# 🧪 VPDF ERP — Scénarios de Test Cassandra 

> **Prérequis :** Votre cluster Cassandra de 3 nœuds (192.168.150.123, 192.168.150.107, 192.168.150.102) doit être démarré et opérationnel.  
> **Vérifier le cluster :** `nodetool status` (depuis n'importe quel nœud).

---

## Scénario 1 — Réplication Multi-Nœuds
**Objectif :** Écriture sur Node1 (123) → lecture automatique depuis Node2 (107) et Node3 (102).

```bash
# Écrire en se connectant au Node 1 (123)
cqlsh 192.168.150.123 -e "
  USE ventespleindefoin;
  INSERT INTO clients (no_client, nom_client, no_telephone, date_creation)
  VALUES (99999, 'Test Replication', '(000)000-0000', toTimestamp(now()));
"

# Lire depuis le Node 2 (107)
cqlsh 192.168.150.107 -e "USE ventespleindefoin; SELECT * FROM clients WHERE no_client = 99999;"

# Lire depuis le Node 3 (102)
cqlsh 192.168.150.102 -e "USE ventespleindefoin; SELECT * FROM clients WHERE no_client = 99999;"
```

**✅ À observer :**
- La donnée est propagée instantanément sur les 3 machines grâce au RF=3.

---

## Scénario 2 — Tolérance aux Pannes
**Objectif :** Le cluster reste disponible même si un nœud tombe.

```bash
# 1. Éteindre le Node 2 (107) physiquement ou arrêter le service
# systemctl stop cassandra

# 2. Vérifier l'état du cluster (Vous verrez Node 2 en 'DN' = Down/Normal)
nodetool status

# 3. Insérer des données depuis Node 1 pendant que Node 2 est mort
cqlsh 192.168.150.123 -e "
  USE ventespleindefoin; INSERT INTO clients (no_client,nom_client,no_telephone) VALUES (88888,'Node2 Down Test','(111)111-1111');
"

# 4. Rallumer Node 2
# systemctl start cassandra
# Attendre 30 secondes...

# 5. Vérifier que Node 2 a bien récupéré les données (Hinted Handoff)
cqlsh 192.168.150.107 -e "USE ventespleindefoin; SELECT * FROM clients WHERE no_client = 88888;"
```

---

## Scénario 3 — Niveau de Consistance (Consistency Level)
**Objectif :** Comparer ONE vs QUORUM.

```bash
# Se connecter à cqlsh
cqlsh 192.168.150.123

# Dans cqlsh :
USE ventespleindefoin;

-- ONE (lecture depuis 1 seul replica, ultra rapide)
CONSISTENCY ONE;
SELECT COUNT(*) FROM commandes;

-- QUORUM (lecture depuis au moins 2 nœuds sur 3, pour être sûr de la donnée)
CONSISTENCY QUORUM;
SELECT COUNT(*) FROM commandes;
```

---

## Scénario 4 — Distribution des Partitions
**Objectif :** Voir comment Cassandra distribue les données de VPDF sur votre réseau.

```bash
# Sur n'importe quelle machine :
nodetool ring

# Statistiques sur la table des clients
nodetool tablestats ventespleindefoin.clients
```

**✅ À observer :**
- Les données sont réparties uniformément entre `123`, `107` et `102` (chacun stocke environ un tiers des clés avant réplication).

---

## Scénario 5 — Scalabilité en Écriture (Throughput BigData)
**Objectif :** Utiliser le script Python pour tester la vitesse d'ingestion.

```bash
# Générer le fichier de 10 000 lignes
cd scripts/
python3 generate_10k_data.py > data_10k.cql

# Injecter dans le cluster et mesurer le temps
time cqlsh 192.168.150.123 < data_10k.cql
```

**✅ À observer :**
- L'ingestion est ultra-rapide (les SSTables agissent en 'append-only').

---

## Scénario 6 — Dénormalisation (O(1))
**Objectif :** Démontrer l'utilité des tables "commandes_par_client".

```bash
cqlsh 192.168.150.123 -e "
  USE ventespleindefoin;
  TRACING ON;

  -- Historique d'un client. Ne cherche que sur un seul nœud, c'est immédiat.
  SELECT * FROM commandes_par_client WHERE no_client = 1001 LIMIT 10;
"
```
