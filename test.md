### Comment initialiser l'ERP et enrichir votre Base de Données

Voici la méthode **exacte** pour votre projet (en admettant que votre nœud principal soit allumé sur `192.168.150.123`). Toutes les commandes que je vous montre ci-dessous sont à exécuter en natif directement sur votre terminal Kali.

Ouvrez un terminal et rendez-vous dans le dossier `cassandra` de votre projet :

```bash
cd /home/panguipeguy/Bureau/ERP-COMMERCIAL/cassandra
```

**Étape 1 : Créer les tables (le Schéma)**
Le fichier `init.sql` contient les règles d'architecture de votre base (les "Keyspace" et "Tables"). C'est la toute première chose à charger dans la base vide.

```bash
cqlsh 192.168.150.123 -u cassandra -p cassandra -f init.sql
```

_(Si vous n'avez pas de mot de passe par défaut sur votre configuration, tapez simplement `cqlsh 192.168.150.123 -f init.sql`)_

**Étape 2 : Générer le fichier des 10 000 enregistrements**
Votre fichier `generate_10k_data.py` fabrique 10 000 opérations de clients, articles, commandes et livraisons de manière aléatoire en générant du langage CQL :

```bash
python3 generate_10k_data.py > data_10k.cql
```

_(Cela va créer un gros fichier texte du nom de `data_10k.cql` dans le dossier)._

**Étape 3 : Injecter les données**
Il ne reste plus qu'à envoyer ces milliers de lignes fraichement générées dans votre base Cassandra toujours à travers `cqlsh` :

```bash
cqlsh 192.168.150.123 -f data_10k.cql
```

Une fois que c'est terminé, le frontend et le backend que nous avions relancés précédemment afficheront et exploiteront directement ces 10 000 nouvelles données !
