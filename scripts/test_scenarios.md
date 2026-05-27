# 🧪 VPDF ERP — 10 Scénarios de Test Cassandra Distribuée

> **Prérequis :** `docker-compose up -d` — attendre 90s que le cluster soit prêt.  
> **Vérifier le cluster :** `docker exec vpdf-cassandra-node1 nodetool status`

---

## Scénario 1 — Réplication Multi-Nœuds
**Objectif :** Écriture sur Node1 → lecture automatique depuis Node2 et Node3.

```bash
# Écrire sur Node 1
docker exec vpdf-cassandra-node1 cqlsh -e "
  USE vpdf;
  INSERT INTO clients (no_client, nom_client, no_telephone, date_creation)
  VALUES (99999, 'Test Replication', '(000)000-0000', toTimestamp(now()));
"

# Lire depuis Node 2
docker exec vpdf-cassandra-node2 cqlsh -e "USE vpdf; SELECT * FROM clients WHERE no_client = 99999;"

# Lire depuis Node 3
docker exec vpdf-cassandra-node3 cqlsh -e "USE vpdf; SELECT * FROM clients WHERE no_client = 99999;"
```

**✅ À observer :**
- La ligne est visible sur les 3 nœuds immédiatement.
- Cassandra utilise le **Gossip Protocol** pour propager l'information.
- RF=3 signifie que chaque donnée est stockée sur les 3 nœuds.
- Le coordinateur (Node1) a écrit en parallèle sur les replicas.

---

## Scénario 2 — Tolérance aux Pannes (Haute Disponibilité)
**Objectif :** Le cluster reste disponible même si un nœud tombe.

```bash
# Arrêter Node 2
docker stop vpdf-cassandra-node2

# Vérifier l'état du cluster (UN = Up/Normal, DN = Down/Normal)
docker exec vpdf-cassandra-node1 nodetool status

# Le backend doit toujours fonctionner — tester l'API
curl http://localhost:8080/api/clients

# Insérer des données avec Node2 hors ligne
docker exec vpdf-cassandra-node1 cqlsh -e "
  USE vpdf; INSERT INTO clients (no_client,nom_client,no_telephone) VALUES (88888,'Node2 Down Test','(111)111-1111');
"

# Redémarrer Node2
docker start vpdf-cassandra-node2
sleep 30

# Vérifier que Node2 a bien récupéré les données
docker exec vpdf-cassandra-node2 cqlsh -e "USE vpdf; SELECT * FROM clients WHERE no_client = 88888;"
```

**✅ À observer :**
- Avec RF=3 et QUORUM, on a besoin de ⌈3/2⌉=2 nœuds disponibles.
- Le cluster reste opérationnel avec 2 nœuds sur 3.
- Quand Node2 revient, il obtient les données manquantes via **hinted handoff** ou **read repair**.
- C'est le principe du **CAP theorem** : Cassandra choisit AP (Availability + Partition tolerance).

---

## Scénario 3 — Consistency Level ONE vs QUORUM
**Objectif :** Comparer performances et cohérence selon le niveau de consistance.

```bash
# Se connecter à cqlsh sur Node1
docker exec -it vpdf-cassandra-node1 cqlsh

# Dans cqlsh :
USE vpdf;

-- Test avec ONE (lecture depuis n'importe quel replica)
CONSISTENCY ONE;
SELECT COUNT(*) FROM commandes;

-- Test avec QUORUM (lecture depuis la majorité)
CONSISTENCY QUORUM;
SELECT COUNT(*) FROM commandes;

-- Test avec ALL (tous les nœuds doivent répondre)
CONSISTENCY ALL;
SELECT COUNT(*) FROM commandes;
```

**✅ À observer :**
| Niveau | Latence | Cohérence | Dispo si nœud en panne |
|--------|---------|-----------|------------------------|
| ONE    | Faible  | Éventuelle| Oui (1 nœud suffisant)  |
| QUORUM | Moyenne | Forte     | Oui (2 nœuds suffisants)|
| ALL    | Haute   | Parfaite  | Non (3 nœuds requis)    |

---

## Scénario 4 — Distribution des Partitions (Token Ring)
**Objectif :** Observer comment Cassandra distribue les données entre les nœuds.

```bash
# Voir la distribution des tokens
docker exec vpdf-cassandra-node1 nodetool ring

# Voir les statistiques par table
docker exec vpdf-cassandra-node1 nodetool tablestats vpdf.clients
docker exec vpdf-cassandra-node1 nodetool tablestats vpdf.commandes

# Voir combien de données sont sur chaque nœud
docker exec vpdf-cassandra-node1 nodetool status
```

**✅ À observer :**
- Chaque nœud possède ~33% de l'espace de tokens.
- Les données sont réparties uniformément grâce au **consistent hashing**.
- La colonne **Load** montre la quantité de données stockée sur chaque nœud.
- Les clés de partition (`no_client`, `no_commande`) déterminent le nœud de stockage.

---

## Scénario 5 — Scalabilité en Écriture (Throughput BigData)
**Objectif :** Mesurer les performances d'insertion de 10 000 enregistrements.

```bash
# Générer le fichier CQL (dans le répertoire scripts/)
python3 generate_10k_data.py > data_10k.cql

# Mesurer le temps d'insertion
time docker exec -i vpdf-cassandra-node1 cqlsh < data_10k.cql

# Vérifier le nombre de lignes insérées
docker exec vpdf-cassandra-node1 cqlsh -e "
  USE vpdf;
  SELECT COUNT(*) FROM clients;
  SELECT COUNT(*) FROM commandes;
  SELECT COUNT(*) FROM lignes_commande;
"
```

**✅ À observer :**
- Cassandra peut ingérer des **millions de lignes/seconde** avec le bon matériel.
- L'écriture est toujours en **O(1)** quelle que soit la taille de la table.
- Comparer avec une base relationnelle qui ralentit sur les index lors des insertions massives.
- Le SSTable (format de fichier Cassandra) est append-only → écriture ultra-rapide.

---

## Scénario 6 — Accès par Clé de Partition (Requête Single-Node)
**Objectif :** Démontrer qu'une requête avec clé de partition est ultra-rapide.

```bash
docker exec vpdf-cassandra-node1 cqlsh -e "
  USE vpdf;

  -- Tracing ON pour voir le routing
  TRACING ON;

  -- Cette requête va directement au bon nœud (partition key = no_commande)
  SELECT * FROM lignes_commande WHERE no_commande = 10001;

  -- Comparer avec un FULL SCAN (interdit en production !)
  -- SELECT COUNT(*) FROM commandes;  -- peut faire timeout avec 5000+ lignes

  TRACING OFF;
"
```

**✅ À observer :**
- Avec TRACING ON, on voit que la requête ne touche qu'**un seul nœud** (celui qui possède la partition).
- Latence de l'ordre de **quelques millisecondes**, indépendante du volume total.
- Toutes les lignes d'une commande sont **co-localisées** sur le même nœud.
- C'est pour ça que le modèle de données Cassandra est conçu autour des **query patterns**.

---

## Scénario 7 — Dénormalisation et Accès Multi-Patterns
**Objectif :** Démontrer l'utilité des tables dénormalisées (`commandes_par_client`).

```bash
docker exec vpdf-cassandra-node1 cqlsh -e "
  USE vpdf;
  TRACING ON;

  -- Requête 1 : commandes d'un client spécifique (table dédiée)
  SELECT * FROM commandes_par_client WHERE no_client = 1001 LIMIT 10;

  -- Requête 2 : commande par ID (table principale)
  SELECT * FROM commandes WHERE no_commande = 10001;

  TRACING OFF;
"
```

**✅ À observer :**
- Cassandra nécessite une **table par pattern d'accès** (c'est du duplication intentionnelle).
- `commandes_par_client` permet une requête rapide par client + date.
- `commandes` permet une requête rapide par ID de commande.
- En SQL, une seule table + index suffit. En Cassandra, on sacrifie l'espace pour la vitesse.
- Comparer les traces : les deux requêtes sont des **single-partition lookups** → ultra-rapide.

---

## Scénario 8 — Récupération après Panne (Hinted Handoff + Repair)
**Objectif :** Observer la récupération automatique des données après une panne nœud.

```bash
# 1. Arrêter Node 3
docker stop vpdf-cassandra-node3

# 2. Insérer 100 enregistrements (Node3 manque ces données)
docker exec vpdf-cassandra-node1 cqlsh << 'EOF'
USE vpdf;
BEGIN BATCH
  INSERT INTO clients (no_client,nom_client,no_telephone) VALUES (77001,'Panne Test 1','(770)001-0001');
  INSERT INTO clients (no_client,nom_client,no_telephone) VALUES (77002,'Panne Test 2','(770)002-0002');
  INSERT INTO clients (no_client,nom_client,no_telephone) VALUES (77003,'Panne Test 3','(770)003-0003');
APPLY BATCH;
EOF

# 3. Redémarrer Node 3
docker start vpdf-cassandra-node3

# 4. Attendre 30 secondes
sleep 30

# 5. Vérifier : Node3 doit avoir récupéré les données via hinted handoff
docker exec vpdf-cassandra-node3 cqlsh -e "USE vpdf; SELECT * FROM clients WHERE no_client IN (77001,77002,77003);"

# 6. Forcer une réparation si nécessaire
docker exec vpdf-cassandra-node3 nodetool repair vpdf
```

**✅ À observer :**
- Cassandra stocke les écritures destinées au nœud absent (**Hinted Handoff**).
- Quand Node3 revient, il reçoit automatiquement les données manquantes.
- `nodetool repair` force la synchronisation des données entre nœuds.
- Durée du handoff : configurable, par défaut 3 heures.

---

## Scénario 9 — Ajout d'un Nœud (Scalabilité Horizontale)
**Objectif :** Ajouter un 4ème nœud et observer le rééquilibrage automatique.

```bash
# Ajouter Node4 au docker-compose (dans un vrai déploiement)
# Simuler en réutilisant la config :

docker run -d \
  --name vpdf-cassandra-node4 \
  --network vpdf_vpdf-net \
  -e CASSANDRA_CLUSTER_NAME=VPDFCluster \
  -e CASSANDRA_SEEDS=vpdf-cassandra-node1 \
  -e CASSANDRA_DC=datacenter1 \
  -e CASSANDRA_RACK=rack4 \
  -e MAX_HEAP_SIZE=512M \
  -e HEAP_NEWSIZE=128M \
  cassandra:4.1

# Observer le streaming des données vers Node4
sleep 60
docker exec vpdf-cassandra-node1 nodetool status
docker exec vpdf-cassandra-node4 nodetool netstats
```

**✅ À observer :**
- Node4 rejoint automatiquement le cluster (via Gossip Protocol).
- Cassandra commence à lui **streamer** une portion des tokens (données).
- Pendant le streaming, le cluster reste **pleinement opérationnel** (zero downtime).
- Après rééquilibrage, chaque nœud possède ~25% des données.
- `nodetool netstats` montre le transfert de données en temps réel.

---

## Scénario 10 — Test de Charge Simultané (Stress Test BigData)
**Objectif :** Simuler des écritures simultanées depuis plusieurs clients.

```bash
# Installer cassandra-stress (inclus dans l'image)
# Générer 10 000 écritures simultanées sur la table commandes

docker exec vpdf-cassandra-node1 cassandra-stress write \
  n=10000 \
  cl=QUORUM \
  -schema keyspace=vpdf \
  -node cassandra-node1,cassandra-node2,cassandra-node3 \
  -rate threads=50 \
  2>&1 | tail -30

# Lire les résultats de performance
docker exec vpdf-cassandra-node1 cassandra-stress read \
  n=10000 \
  cl=QUORUM \
  -schema keyspace=vpdf \
  -node cassandra-node1,cassandra-node2,cassandra-node3 \
  -rate threads=50 \
  2>&1 | tail -20
```

**✅ À observer :**
- **Throughput** : Cassandra peut atteindre 50,000-100,000 écritures/seconde.
- **Latence p99** : doit rester < 10ms même sous charge.
- **Répartition** : les 3 nœuds partagent la charge équitablement.
- Comparer avec PostgreSQL/MySQL qui saturent rapidement sous forte concurrence d'écriture.
- Cassandra est conçu pour des **workloads IoT, logs, time-series** avec millions d'événements/s.

---

## 📊 Récapitulatif des Concepts Démontrés

| Scénario | Concept Cassandra | Avantage |
|----------|-------------------|----------|
| 1 | Réplication RF=3 | Zéro perte de données |
| 2 | Haute Disponibilité AP | Uptime 99.999% |
| 3 | Consistency Levels | Flexibilité cohérence/perf |
| 4 | Token Ring | Distribution équitable |
| 5 | Write Path SSTable | Ingestion BigData ultra-rapide |
| 6 | Partition Key Routing | Latence O(1) |
| 7 | Dénormalisation | Tous les patterns en O(1) |
| 8 | Hinted Handoff | Auto-réparation après panne |
| 9 | Élasticité horizontale | Scale sans downtime |
| 10 | Stress Test | Validation performances prod |

---

## 🔧 Commandes Utiles de Monitoring

```bash
# État général du cluster
docker exec vpdf-cassandra-node1 nodetool status

# Statistiques des tables
docker exec vpdf-cassandra-node1 nodetool tablestats vpdf

# Compaction en cours
docker exec vpdf-cassandra-node1 nodetool compactionstats

# GC et mémoire
docker exec vpdf-cassandra-node1 nodetool gcstats

# Logs en temps réel
docker logs vpdf-cassandra-node1 -f

# Topologie du cluster
docker exec vpdf-cassandra-node1 nodetool describering vpdf
