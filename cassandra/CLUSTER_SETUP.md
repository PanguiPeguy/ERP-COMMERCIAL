## Objectif

Former un cluster Cassandra **natif** sur **6 machines du LAN** avec :

- **1 DC** : `datacenter1`
- **RF=3** pour le keyspace `vpdf`
- **Seeds** : `192.168.150.123`, `192.168.150.107`, `192.168.150.102`

IP des nœuds (LAN) : `192.168.150.102`, `192.168.150.103`, `192.168.150.104`, `192.168.150.105`, `192.168.150.106`, `192.168.150.107`, `192.168.150.123`

> Note : la liste ci-dessus contient 7 IP dans votre message. Assurez-vous du nombre exact de nœuds (6 attendus) et mappez 1 IP ↔ 1 machine.

## Prérequis réseau

Ouvrir entre tous les nœuds (pare-feu) :

- **7000/tcp** (inter-nœuds)
- **9042/tcp** (clients CQL / Spring)
- (optionnel admin) **7199/tcp** (JMX / nodetool)

Vérifier que chaque nœud peut joindre les autres sur le LAN (ping + ports).

## Configuration Cassandra (sur chaque machine)

Fichier (selon installation) : souvent `/etc/cassandra/cassandra.yaml`.

À définir de manière cohérente :

- **`cluster_name`** : identique partout (ex. `VPDFCluster`)
- **`endpoint_snitch`** : recommandé `GossipingPropertyFileSnitch`
- **Seeds** (même liste sur tous les nœuds) :
  - `192.168.150.123,192.168.150.107,192.168.150.102`

Paramètres critiques par nœud (doivent être **l’IP LAN** de la machine) :

- `listen_address: <IP_LAN_DU_NOEUD>`
- `broadcast_address: <IP_LAN_DU_NOEUD>`
- `rpc_address: 0.0.0.0` (ou IP LAN)
- `broadcast_rpc_address: <IP_LAN_DU_NOEUD>`

DC/Rack (si vous utilisez `GossipingPropertyFileSnitch`) :

- Fichier (souvent) `/etc/cassandra/cassandra-rackdc.properties`
  - `dc=datacenter1`
  - `rack=rackX` (par exemple `rack1`…`rack6`)

## Démarrage (ordre conseillé)

1. Démarrer les **seeds** en premier.
2. Démarrer les autres nœuds ensuite.
3. Sur un seed, vérifier :
   - `nodetool status` → tous les nœuds en **UN** dans `datacenter1`

## Schéma + keyspace (RF=3)

Le script `cassandra/init.sql` du repo contient :

- création du keyspace `vpdf` en `NetworkTopologyStrategy` avec `datacenter1: 3`
- création des tables

À exécuter **une seule fois** (depuis un nœud) avec `cqlsh` sur le cluster natif, puis le schéma se propage.

## Côté application (Spring Boot)

Dans `vpdf-backend/src/main/resources/application.yml`, par défaut l’application vise le cluster natif via les 3 seeds.

- `spring.cassandra.contact-points` (par défaut) : `192.168.150.123,192.168.150.107,192.168.150.102`
- `spring.cassandra.local-datacenter` : `datacenter1`
- cohérence recommandée : `LOCAL_QUORUM`

Pour le mode docker-compose local, lancer avec le profil `docker` (déjà activé dans `docker-compose.yml`).

