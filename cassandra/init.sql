-- ============================================================
-- VPDF ERP - Schema Cassandra
-- Executé automatiquement au démarrage du container Node1
-- ============================================================

CREATE KEYSPACE IF NOT EXISTS vpdf
  WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'datacenter1': 3
  }
  AND durable_writes = true;

USE vpdf;

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
    no_client       int PRIMARY KEY,
    nom_client      text,
    no_telephone    text,
    date_creation   timestamp
);

-- ARTICLES / STOCK
CREATE TABLE IF NOT EXISTS articles (
    no_article          int PRIMARY KEY,
    description         text,
    prix_unitaire       decimal,
    quantite_en_stock   int,
    categorie           text,
    date_creation       timestamp
);

-- COMMANDES (par ID)
CREATE TABLE IF NOT EXISTS commandes (
    no_commande     int PRIMARY KEY,
    date_commande   timestamp,
    no_client       int,
    nom_client      text,
    statut          text,
    montant_total   decimal
);

-- COMMANDES PAR CLIENT (accès secondaire, triées par date DESC)
CREATE TABLE IF NOT EXISTS commandes_par_client (
    no_client       int,
    date_commande   timestamp,
    no_commande     int,
    statut          text,
    montant_total   decimal,
    PRIMARY KEY ((no_client), date_commande, no_commande)
) WITH CLUSTERING ORDER BY (date_commande DESC, no_commande ASC);

-- LIGNES DE COMMANDE (partition = commande entière co-localisée)
CREATE TABLE IF NOT EXISTS lignes_commande (
    no_commande     int,
    no_article      int,
    quantite        int,
    description     text,
    prix_unitaire   decimal,
    sous_total      decimal,
    PRIMARY KEY ((no_commande), no_article)
);

-- LIVRAISONS
CREATE TABLE IF NOT EXISTS livraisons (
    no_livraison    int PRIMARY KEY,
    date_livraison  timestamp,
    statut          text
);

-- DETAILS LIVRAISON
CREATE TABLE IF NOT EXISTS details_livraison (
    no_livraison    int,
    no_commande     int,
    no_article      int,
    quantite_livree int,
    description     text,
    PRIMARY KEY ((no_livraison), no_commande, no_article)
);