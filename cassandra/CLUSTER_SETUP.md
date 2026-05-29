# 🖥️ Configuration du Cluster Cassandra Natif (3 Nœuds)

## Objectif

Connecter ensemble vos 3 machines sur le réseau local (LAN) pour former un cluster Apache Cassandra natif unique.

**Topologie du Cluster (`dc1`) :**
- **Nœud 1 (Seed)** : `192.168.150.123`
- **Nœud 2 (Seed)** : `192.168.150.107`
- **Nœud 3** : `192.168.150.102`

Facteur de réplication (RF) : `3` (Chaque donnée sera écrite sur les 3 nœuds pour une tolérance aux pannes maximale).

---

## 🔒 1. Prérequis Réseau (Pare-feu)

Sur les **3 machines**, assurez-vous que les ports suivants sont ouverts :
- **7000/tcp** : Communication interne du cluster Cassandra (Gossip).
- **9042/tcp** : Port de connexion client (cqlsh, Spring Boot, etc.).
- **7199/tcp** : (Optionnel) Administration via `nodetool`.

Vérifiez que vos 3 machines communiquent avec la commande `ping 192.168.150.x` depuis chacune d'entre elles.

---

## ⚙️ 2. Configuration (`cassandra.yaml`)

Sur **chacune** des 3 machines, éditez le fichier `cassandra.yaml` (généralement situé dans `/etc/cassandra/cassandra.yaml` ou `conf/cassandra.yaml`). 

Les champs suivants doivent être configurés exactement ainsi :

### A. Paramètres Communs (Identiques sur les 3 nœuds)
```yaml
cluster_name: 'VPDFCluster'
endpoint_snitch: GossipingPropertyFileSnitch

seed_provider:
  - class_name: org.apache.cassandra.locator.SimpleSeedProvider
    parameters:
      # On met les 2 premiers noeuds comme référents (Seeds)
      - seeds: "192.168.150.123,192.168.150.107"
```

### B. Paramètres Spécifiques (À adapter selon l'IP de la machine)
*Remplacez `<IP_DE_CETTE_MACHINE>` par l'adresse IP (192.168.150.x) de la machine que vous configurez.*

```yaml
listen_address: <IP_DE_CETTE_MACHINE>
rpc_address: <IP_DE_CETTE_MACHINE>
broadcast_rpc_address: <IP_DE_CETTE_MACHINE>
```

---

## 🏷️ 3. Datacenter et Rack (`cassandra-rackdc.properties`)

Puisque nous utilisons `GossipingPropertyFileSnitch`, sur les 3 machines, ouvrez le fichier `cassandra-rackdc.properties` (dans le répertoire conf) et mettez :

```properties
dc=dc1
rack=rack1
```

---

## 🚀 4. Démarrage (Ordre très important !)

1. **Allumez le Nœud 1 (Seed 123)** et attendez 1 minute.
   ```bash
   systemctl start cassandra
   # ou bin/cassandra -f
   ```
2. **Allumez le Nœud 2 (Seed 107)** et attendez 1 minute.
3. **Allumez le Nœud 3 (102)**.
4. Sur n'importe quelle machine, lancez `nodetool status` pour vérifier. Vous devriez voir `UN` (Up/Normal) sur les 3 IPs :
   ```
   Datacenter: dc1
   ================
   Status=Up/Down | State=Normal/Leaving/Joining/Moving
   --  Address           Load       Tokens
   UN  192.168.150.123   ...
   UN  192.168.150.107   ...
   UN  192.168.150.102   ...
   ```

---

## 💻 5. Configuration Côté Application (Spring Boot)

Une fois les 3 nœuds "Up/Normal", l'application `vpdf-backend` configurée dans `application.yml` avec :
```yaml
spring.cassandra.contact-points: 192.168.150.123,192.168.150.107,192.168.150.102
spring.cassandra.local-datacenter: dc1
```
se connectera toute seule au cluster !
