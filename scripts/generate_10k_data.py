#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VPDF ERP - Générateur de 10 000 enregistrements CQL
Usage: python3 generate_10k_data.py > data_10k.cql
       docker exec -i vpdf-cassandra-node1 cqlsh < data_10k.cql

Génère:
  - 500 clients
  - 200 articles (plantes/arbres)
  - 5 000 commandes
  - ~12 000 lignes de commande
  - 1 000 livraisons
  - ~8 000 détails de livraison
"""

import random
import sys
from datetime import datetime, timedelta

random.seed(42)

# =========================================================
# DONNÉES DE RÉFÉRENCE
# =========================================================
PRENOMS = [
    "Jean","Marc","Pierre","Paul","André","Michel","François","Luc","Robert","Henri",
    "Guy","Serge","Daniel","Yves","Alain","Louis","Gilles","Rémi","Patrice","Claude",
    "Marie","Sophie","Claire","Julie","Anne","Isabelle","Nicole","Monique","Sylvie",
    "Chantal","Brigitte","Martine","Nathalie","Christine","Catherine","Madeleine",
    "Dominique","Agnès","Hélène","Laurence","Peguy","Simon","Lin","Hafed","Dollard"
]

NOMS = [
    "Tremblay","Gagnon","Roy","Côté","Bouchard","Gauthier","Morin","Lavoie","Fortin",
    "Gagné","Ouellet","Pelletier","Leblanc","Poirier","Bélanger","Lachance","Desrosiers",
    "Leclerc","Beaulieu","Bergeron","Simard","Lapointe","Dubois","Paquette","Champagne",
    "Paradis","Fontaine","Lemay","Lacroix","Marchand","Sansom","Leconte","Lecoq","Alaoui",
    "Bé","Nguema","Fofana","Diallo","Bakayoko","Tchangani","Kamga","Ngo Nkot"
]

ARTICLES_DATA = [
    ("Cèdre en boule", 10.99, "Conifère"),("Sapin de Noël", 12.99, "Conifère"),
    ("Épinette bleue", 25.99, "Conifère"),("Chêne pédonculé", 22.99, "Feuillu"),
    ("Érable argenté", 15.99, "Feuillu"),("Herbe à puce", 10.99, "Plante"),
    ("Poirier Bartlett", 26.99, "Fruitier"),("Catalpa bignonioides", 25.99, "Arbre"),
    ("Pommier McIntosh", 25.99, "Fruitier"),("Genévrier de Virginie", 15.99, "Conifère"),
    ("Bouleau blanc", 18.99, "Feuillu"),("Lilas commun", 14.99, "Arbuste"),
    ("Hêtre européen", 22.99, "Feuillu"),("Pin sylvestre", 19.99, "Conifère"),
    ("Peuplier faux-tremble", 16.99, "Feuillu"),("Aulne glutineux", 17.99, "Feuillu"),
    ("Frêne blanc", 21.99, "Feuillu"),("Mélèze laricin", 20.99, "Conifère"),
    ("Thuya occidental", 11.99, "Conifère"),("Érable rouge", 24.99, "Feuillu"),
    ("Rose sauvage", 9.99, "Arbuste"),("Forsythia d'Europe", 12.99, "Arbuste"),
    ("Cornouiller stolonifère", 18.99, "Arbuste"),("Viorne trilobée", 15.99, "Arbuste"),
    ("Sureau du Canada", 13.99, "Arbuste"),("Prunier sauvage", 23.99, "Fruitier"),
    ("Cerisier Bing", 28.99, "Fruitier"),("Noyer cendré", 29.99, "Feuillu"),
    ("Charme commun", 19.99, "Feuillu"),("Magnolia de Soulange", 34.99, "Arbre"),
    ("Glycine du Japon", 16.99, "Grimpante"),("Pivoine arbustive", 22.99, "Arbuste"),
    ("Rhododendron catawba", 27.99, "Arbuste"),("Azalée du Japon", 18.99, "Arbuste"),
    ("Hortensia Annabelle", 15.99, "Arbuste"),("Spirée de Van Houtte", 12.99, "Arbuste"),
    ("Weigela florida", 14.99, "Arbuste"),("Potentille arbustive", 11.99, "Arbuste"),
    ("Muflier des jardins", 5.99, "Annuelle"),("Impatiens de Sultanie", 4.99, "Annuelle"),
    ("Pétunia hybride", 5.99, "Annuelle"),("Bégonia tubéreux", 7.99, "Annuelle"),
    ("Géranium zonal", 6.99, "Annuelle"),("Lavande officinale", 9.99, "Vivace"),
    ("Hostas sum and substance", 12.99, "Vivace"),("Fougère autruche", 11.99, "Vivace"),
    ("Iris des marais", 10.99, "Vivace"),("Rudbeckia hirta", 8.99, "Vivace"),
    ("Échinacée pourpre", 9.99, "Vivace"),("Sauge des prés", 8.99, "Vivace"),
]

STATUTS_CMD = ["EN_ATTENTE","CONFIRMEE","LIVREE","ANNULEE"]
STATUTS_LIV = ["PLANIFIEE","EN_COURS","LIVREE"]

# =========================================================
# HELPERS
# =========================================================
def rand_date(start_year=2022, end_year=2025):
    start = datetime(start_year, 1, 1)
    end   = datetime(end_year, 12, 31)
    delta = end - start
    return (start + timedelta(days=random.randint(0, delta.days))).strftime("%Y-%m-%dT%H:%M:%SZ")

def phone():
    area = random.randint(200, 999)
    return f"({area}){random.randint(100,999)}-{random.randint(1000,9999)}"

def cql_str(s):
    return "'" + str(s).replace("'", "''") + "'"

# =========================================================
# GÉNÉRATION
# =========================================================
print("USE vpdf;")
print()

# ---- CLIENTS (500) ----
print("-- ===== CLIENTS (500) =====")
client_ids = random.sample(range(1001, 9999), 500)
client_ids.sort()
for cid in client_ids:
    nom = f"{random.choice(PRENOMS)} {random.choice(NOMS)}"
    tel = phone()
    ts  = rand_date()
    print(f"INSERT INTO clients (no_client, nom_client, no_telephone, date_creation) VALUES ({cid}, {cql_str(nom)}, {cql_str(tel)}, {cql_str(ts)});")

print()

# ---- ARTICLES (200, en réutilisant les 50 de base plusieurs fois avec ID différents) ----
print("-- ===== ARTICLES (200) =====")
article_ids = random.sample(range(101, 9999), 200)
article_ids.sort()
articles_map = {}  # id -> (desc, prix, cat, stock)
for i, aid in enumerate(article_ids):
    base = ARTICLES_DATA[i % len(ARTICLES_DATA)]
    desc, prix_base, cat = base
    prix  = round(prix_base + random.uniform(-2, 10), 2)
    stock = random.randint(0, 150)
    articles_map[aid] = (desc, prix, cat, stock)
    ts = rand_date()
    print(f"INSERT INTO articles (no_article, description, prix_unitaire, quantite_en_stock, categorie, date_creation) VALUES ({aid}, {cql_str(desc)}, {prix}, {stock}, {cql_str(cat)}, {cql_str(ts)});")

print()

# ---- COMMANDES (5000) ----
print("-- ===== COMMANDES (5 000) =====")
commande_ids = random.sample(range(10001, 99999), 5000)
commande_ids.sort()
# Map commande -> (noClient, nomClient, date)
commandes_map = {}
for cid in commande_ids:
    nc = random.choice(client_ids)
    # Reconstruit le nom (simplifié)
    nom = f"Client {nc}"
    dt  = rand_date()
    statut = random.choices(STATUTS_CMD, weights=[3,4,8,1])[0]
    montant = round(random.uniform(15, 850), 2)
    commandes_map[cid] = (nc, nom, dt, statut, montant)
    print(f"INSERT INTO commandes (no_commande, date_commande, no_client, nom_client, statut, montant_total) VALUES ({cid}, {cql_str(dt)}, {nc}, {cql_str(nom)}, {cql_str(statut)}, {montant});")

print()

# ---- COMMANDES PAR CLIENT ----
print("-- ===== COMMANDES PAR CLIENT (5 000) =====")
for cid, (nc, nom, dt, statut, montant) in commandes_map.items():
    print(f"INSERT INTO commandes_par_client (no_client, date_commande, no_commande, statut, montant_total) VALUES ({nc}, {cql_str(dt)}, {cid}, {cql_str(statut)}, {montant});")

print()

# ---- LIGNES COMMANDE (~12 000, 2-4 lignes par commande) ----
print("-- ===== LIGNES COMMANDE (~12 000) =====")
for cid in commande_ids:
    nb_lignes = random.randint(1, 4)
    chosen_articles = random.sample(article_ids, min(nb_lignes, len(article_ids)))
    for aid in chosen_articles:
        desc, prix, _, _ = articles_map[aid]
        qte = random.randint(1, 15)
        sous_total = round(prix * qte, 2)
        print(f"INSERT INTO lignes_commande (no_commande, no_article, quantite, description, prix_unitaire, sous_total) VALUES ({cid}, {aid}, {qte}, {cql_str(desc)}, {prix}, {sous_total});")

print()

# ---- LIVRAISONS (1000) ----
print("-- ===== LIVRAISONS (1 000) =====")
livraison_ids = random.sample(range(200001, 299999), 1000)
livraison_ids.sort()
for lid in livraison_ids:
    dt     = rand_date()
    statut = random.choices(STATUTS_LIV, weights=[2, 3, 10])[0]
    print(f"INSERT INTO livraisons (no_livraison, date_livraison, statut) VALUES ({lid}, {cql_str(dt)}, {cql_str(statut)});")

print()

# ---- DETAILS LIVRAISON (~8 000) ----
print("-- ===== DETAILS LIVRAISON (~8 000) =====")
livred_commandes = random.sample(commande_ids, min(4000, len(commande_ids)))
for i, lid in enumerate(livraison_ids):
    # 2-10 détails par livraison
    nb = random.randint(2, 10)
    sub_cmds = random.sample(commande_ids, min(nb, len(commande_ids)))
    for nc in sub_cmds:
        aid = random.choice(article_ids)
        desc = articles_map[aid][0]
        qte_livree = random.randint(1, 10)
        print(f"INSERT INTO details_livraison (no_livraison, no_commande, no_article, quantite_livree, description) VALUES ({lid}, {nc}, {aid}, {qte_livree}, {cql_str(desc)});")

print()
print("-- Génération terminée !")
sys.stderr.write("✅ Script CQL généré avec succès.\n")