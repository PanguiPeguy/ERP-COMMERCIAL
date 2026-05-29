# 🌾 VPDF ERP — VentesPleinDeFoin

Bienvenue dans le dépôt du projet **VentesPleinDeFoin (VPDF)** ! 
Ce projet est un ERP (Entreprise Resource Planning) complet de gestion commerciale. Il a été conçu de A à Z avec une architecture distribuée, modulaire et orientée pour de hautes performances grâce à l'utilisation d'une base de données NoSQL lourde.

---

## 📖 Sommaire
1. [Architecture Globale](#-architecture-globale)
2. [Fonctionnalités Métier](#-fonctionnalités-métier)
3. [Détail de la Base de Données (Cassandra)](#-détail-de-la-base-de-données-cassandra)
4. [Prérequis](#-prérequis)
5. [Installation Native (Sans Docker)](#-installation-native-sans-docker---recommandé-pour-le-dev)
6. [Installation via Docker](#-installation-via-docker)
7. [Générer un jeu de données (10k)](#-générer-10-000-enregistrements)
8. [Crédits et Maintenance](#-crédits)

---

## 🏗 Architecture Globale

Le projet est divisé en trois tiers distincts afin d'assurer l'indépendance de chaque couche.

| Couche      | Technologie | Port (défaut) |
|-------------|-------------|--------------|
| **Frontend**    | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts | `3000` |
| **Backend**     | Spring Boot 3.2, Java 17, Spring Data Cassandra, Maven | `8080` |
| **Database** | Apache Cassandra 4.1 (Cluster prêt, 3 nœuds configurés) | `9042` |

**Réseau et Sécurité :**
- L'API (Backend) inclut une politique CORS ouverte (`*`) sur les routes `/api/**` afin de répondre instantanément aux appels provenant du frontend.
- Le Frontend interroge directement le backend via l'URL d'API sans intermédiaire.

---

## ⚙️ Fonctionnalités Métier

L'application couvre l'entièreté d'un cycle commercial classique :
- **📊 Dashboard :** Vue d'ensemble des ventes, chiffre d'affaires, et indicateurs KPI générés en temps réel par des requêtes optimisées.
- **👥 Gestion des Clients :** Fiche d'identité client, historique, dates de création.
- **📦 Stock & Catalogue (Articles) :** Mise à jour en temps réel (patch) des quantités disponibles, référentiel produit, tarification unitaire.
- **🛒 Commandes :** Génération de paniers (lignes de commande par article), calcul automatique des montants intégraux. Suivi du statut de préparation.
- **🚚 Livraisons :** Regroupement de commandes, dispatch logistique et tracking (livré, en attente, etc.).

---

## 🗄 Détail de la Base de Données (Cassandra)

Le modèle de données (Keyspace : `ventespleindefoin`) NoSQL a été pensé pour dénormaliser l'information volontairement, évitant ainsi des requêtes de type `JOIN` et permettant de mettre l'application à l'échelle massivement :

- `clients` et `articles` : Indexation par identifiant direct (Primary Key).
- `commandes` : Regroupe les métadonnées globales de chaque acte d'achat.
- `commandes_par_client` : *Table dénormalisée* contenant l'historique direct pour un client, trié technologiquement par ordre décroissant (DESC) sans nécessiter de tri logiciel à la lecture !
- `lignes_commande` : Stocke le contenu de chaque commande, avec une **partition key** co-localisée sur la commande. Tout le contenu du panier est donc situé physiquement sur les mêmes disques du cluster.
- `livraisons` et `details_livraison`.

*(Le schéma d'initialisation exact est visible dans `cassandra/init.sql`)*

---

## 📋 Prérequis

Pour installer le projet localement :
- **Java 17+** et **Maven** (Pour le Backend Spring Boot)
- **Node.js 20+** et **NPM** (Pour le Frontend Next.js)
- **Base Cassandra** (Un nœud local ou un cluster accessible)

---

## 🛠 Installation Native (Sans Docker) - *Recommandé pour le Dev*

Si vous désirez travailler directement sur les stacks sans virtualisation logicielle (Docker), suivez ces étapes :

### 1️⃣ Base de Données
Assurez-vous qu'une instance locale de Cassandra est démarrée.
Modifiez si nécessaire le fichier `vpdf-backend/src/main/resources/application.yml` ou `CassandraConfig.java` pour que les IPs pointent vers votre / vos serveurs Cassandra.
*Exemple par défaut prévu dans le projet : Un cluster installé (sans docker) sur les IPs `192.168.150.123`, `192.168.150.107`, `192.168.150.102`.*

### 2️⃣ Démarrer le Backend
Ouvrez un terminal :
```bash
cd vpdf-backend
mvn clean install -DskipTests
mvn spring-boot:run
```
> 🎉 L'API REST écoutera sous http://localhost:8080/api

### 3️⃣ Démarrer le Frontend
Vérifiez que votre fichier environement `vpdf-frontend/.env.local` pointe bien vers ce Backend (`NEXT_PUBLIC_API_URL=http://localhost:8080`).
Dans un autre terminal :
```bash
cd vpdf-frontend
npm install
npm run dev
```
> 🎉 L'Interface graphique sera accessible sous http://localhost:3000

---

## 🐳 Installation via Docker

Si vous disposez de Docker et Docker-Compose, les composants de l'application sont "Dockerisés" et intégrables rapidement. 

```bash
# 1. Compiler les images et lancer le frontend + backend
docker-compose up --build -d

# 2. Stopper l'application
docker-compose down
```
⚠️ **Attention** : Le `docker-compose.yml` du projet démarre les conteneurs API et FrontEnd. Le cluster Cassandra (3 nœuds) est supposé être hébergé sur le **réseau LAN local** (configuration "NATIF").

---

## 📈 Générer 10 000 enregistrements

Pour évaluer la robustesse de VPDF et du cluster, un script Python est fourni pour amorcer 10 000 lignes factices réalistes :

```bash
cd scripts
# Installez potentiellement Pip / packages requis si demandés
python3 generate_10k_data.py > data_10k.cql

# Exécuter les insertions CQL sur votre base de données :
cqlsh 192.168.150.123 < data_10k.cql
```

*(Plus de détails concernant les tests distribués dans `scripts/test_scenarios.md`)*

---

## 📝 Crédits
Projet **VentesPleinDeFoin** 
Propulsé par Spring Boot 3 & Next.js 14 pour des performances optimales sur des environnements Cassandra mutualisés.