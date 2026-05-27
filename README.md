# 🌿 VPDF ERP — VentesPleinDeFoin

ERP complet de gestion commerciale (Clients, Stock, Commandes, Livraisons, Dashboard)
basé sur **Spring Boot 3** + **Apache Cassandra 4** (3 nœuds) + **Next.js 14**.

## Stack
| Couche      | Technologie |
|-------------|-------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend     | Spring Boot 3.2, Spring Data Cassandra |
| Base de données | Apache Cassandra 4.1 (cluster 3 nœuds) |
| Conteneurs  | Docker Compose |

## Démarrage rapide

```bash
# 1. Lancer le cluster Cassandra + backend + frontend
docker-compose up -d

# 2. Attendre que Cassandra démarre (~60s)
docker logs vpdf-cassandra-node1 -f | grep "Starting listening"

# 3. Ouvrir http://localhost:3000
```

## Ports
- **3000** → Frontend Next.js
- **8080** → Backend Spring Boot (API REST)
- **9042** → Cassandra Node 1
- **9043** → Cassandra Node 2  
- **9044** → Cassandra Node 3

## Générer 10 000 enregistrements
```bash
cd scripts
python3 generate_10k_data.py > data_10k.cql
docker exec -i vpdf-cassandra-node1 cqlsh < data_10k.cql
```

## Test des scénarios distribués
Voir `scripts/test_scenarios.md`