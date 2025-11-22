# WasteGraph — Collecte des Déchets

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Description

**WasteGraph** est une application web interactive pour optimiser les routes de collecte des déchets. Elle permet de visualiser un graphe de collecte, calculer les chemins optimaux entre deux points et assigner des équipes/jours à différentes zones de collecte.

### Fonctionnalités principales

- 🗺️ **Visualisation interactive** d'un graphe en Canvas
- 🛣️ **Algorithme de Dijkstra** pour trouver le chemin le plus court
- 🎨 **Coloration de graphe** pour l'assignation d'équipes/jours
- ✏️ **Édition dynamique** : ajout/suppression de nœuds et arêtes
- 💾 **Persistance PostgreSQL** des données
- 🔄 **API REST** complète

---

## 🚀 Installation

### Prérequis

- Python 3.8 ou supérieur
- PostgreSQL 12 ou supérieur
- Node.js (optionnel, pour la gestion des dépendances frontend)

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/WasteGraph.git
cd WasteGraph
```

2. **Créer un environnement virtuel Python**
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate
```

3. **Installer les dépendances Python**
```bash
pip install flask flask-cors psycopg2-binary
```

4. **Configurer PostgreSQL**

Créer une base de données et les tables :

```sql
CREATE DATABASE TG;

\c TG;

CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL
);

CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    from_node VARCHAR(50) NOT NULL,
    to_node VARCHAR(50) NOT NULL,
    weight INT NOT NULL,
    undirected BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (from_node) REFERENCES nodes(name) ON DELETE CASCADE,
    FOREIGN KEY (to_node) REFERENCES nodes(name) ON DELETE CASCADE
);
```

5. **Configurer les identifiants PostgreSQL**

Éditer `app.py` et vérifier les paramètres de connexion :

```python
def get_connection():
    return psycopg2.connect(
        dbname="TG",
        user="postgres",
        password="YOUR_PASSWORD",  # À remplacer
        host="localhost",
        port=5432
    )
```

6. **Lancer l'application**
```bash
python app.py
```

L'application sera accessible à `http://localhost:5000`

---

## 📁 Structure du projet

```
WasteGraph/
├── app.py                      # Backend Flask
├── templates/
│   └── index.html             # Interface HTML
├── static/
│   ├── app.js                 # Logique frontend JavaScript
│   └── style.css              # Feuille de styles
├── README.md
└── requirements.txt           # Dépendances Python
```

---

## 🎮 Guide d'utilisation

### Interface principale

L'application affiche :
- **Zone centrale** : Canvas avec la visualisation du graphe
- **Barre d'outils** : Sélection source/destination et boutons d'action
- **Panneau latéral** : Légende des équipes et résultats

### Opérations disponibles

#### 1. **Ajouter un nœud**
1. Sélectionner "Ajouter un nœud" dans le menu déroulant
2. Cliquer sur "OK"
3. Cliquer sur le canvas pour placer le nœud
4. Entrer le nom du nœud (auto-incrémenté si vide)
5. Appuyer sur "Entrée"

#### 2. **Supprimer un nœud**
1. Sélectionner "Supprimer un nœud"
2. Cliquer sur "OK"
3. Cliquer sur le nœud à supprimer
4. Les arêtes associées sont supprimées automatiquement

#### 3. **Ajouter une arête**
1. Sélectionner "Ajouter une arête"
2. Cliquer sur "OK"
3. Cliquer sur le premier nœud (source)
4. Cliquer sur le second nœud (destination)
5. Entrer le poids/distance de l'arête
6. Appuyer sur "Entrée"

#### 4. **Supprimer une arête**
1. Sélectionner "Supprimer une arête"
2. Cliquer sur "OK"
3. Cliquer sur l'arête à supprimer

#### 5. **Rechercher le chemin optimal**
1. Sélectionner la source dans le menu "Source"
2. Sélectionner la destination dans le menu "Destination"
3. Cliquer sur "Rechercher (Dijkstra)"
4. Le chemin et la distance s'affichent dans le panneau latéral

#### 6. **Assigner des équipes/jours**
1. Cliquer sur "Colorier (jours/équipes)"
2. Les nœuds sont colorés selon leur assignation
3. La légende affiche les couleurs et équipes

---

## 🔌 API REST

### Endpoints disponibles

#### **GET /graph**
Récupère tous les nœuds et arêtes

**Réponse :**
```json
{
  "nodes": [
    {"name": "N1", "x": 100, "y": 150},
    {"name": "N2", "x": 300, "y": 250}
  ],
  "edges": [
    {"from": "N1", "to": "N2", "weight": 50, "undirected": false}
  ]
}
```

#### **POST /graph/node**
Ajoute un nœud

**Requête :**
```json
{
  "name": "N3",
  "x": 400,
  "y": 300
}
```

#### **DELETE /graph/node**
Supprime un nœud

**Requête :**
```json
{
  "name": "N3"
}
```

#### **POST /graph/edge**
Ajoute une arête

**Requête :**
```json
{
  "from": "N1",
  "to": "N2",
  "weight": 50
}
```

#### **DELETE /graph/edge**
Supprime une arête

**Requête :**
```json
{
  "from": "N1",
  "to": "N2"
}
```

#### **GET /algo/dijkstra**
Calcule le chemin optimal entre deux nœuds

**Paramètres :** `src` (source), `dst` (destination)

**Réponse :**
```json
{
  "path": ["N1", "N3", "N2"],
  "distance": 150
}
```

#### **GET /algo/coloring**
Assigne des couleurs/équipes aux nœuds (coloration de graphe)

**Réponse :**
```json
{
  "N1": 1,
  "N2": 2,
  "N3": 1
}
```

---

## 🧮 Algorithmes implémentés

### Dijkstra
Trouvez le chemin le plus court entre deux nœuds dans un graphe pondéré.

**Complexité :** O((V + E) log V)

### Graph Coloring (Greedy)
Assignez des couleurs/équipes aux nœuds de manière optimale pour éviter les conflits.

**Stratégie :** Tri par degré décroissant + coloration gloutonne

---

## 🛠️ Technologies utilisées

### Backend
- **Flask** : Framework web léger
- **Flask-CORS** : Gestion des requêtes cross-origin
- **psycopg2** : Driver PostgreSQL pour Python

### Frontend
- **HTML5 / CSS3** : Structure et style
- **Canvas API** : Rendu 2D du graphe
- **JavaScript Vanilla** : Logique interactif
- **Fetch API** : Communication avec le backend

### Base de données
- **PostgreSQL** : Persistance des données

---

## 📊 Exemple de cas d'usage

### Scenario : Optimiser une tournée de collecte

1. **Créer le réseau** : Ajouter des nœuds (points de collecte) et des arêtes (routes)
2. **Assigner les équipes** : Utiliser la coloration pour répartir les zones par jour
3. **Optimiser les trajets** : Utiliser Dijkstra pour trouver le chemin le plus court entre deux points
4. **Valider et mettre à jour** : Les données sont persistées en PostgreSQL

---

## 🐛 Troubleshooting

### Erreur de connexion PostgreSQL
```
psycopg2.OperationalError: could not connect to server
```
✅ Vérifier que PostgreSQL est lancé et que les paramètres de connexion sont corrects

### Arête impossible à ajouter
✅ Vérifier que les deux nœuds existent et que l'arête n'existe pas déjà

### Canvas vide au démarrage
✅ Vérifier que des nœuds existent dans la base de données

---

## 🔐 Sécurité

- Utilisation de **requêtes paramétrées** pour prévenir les injections SQL
- **CORS configuré** pour restreindre les origines autorisées
- Gestion des erreurs côté serveur

---

## 📝 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📧 Contact

**Auteur** : [Votre nom]  
**Email** : [votre.email@example.com]  
**GitHub** : [votre-username]

---

## 🙏 Remerciements

- Flask et la communauté Python
- PostgreSQL pour la fiabilité
- Inspiration des algorithmes classiques de théorie des graphes

---

**Dernière mise à jour** : Novembre 2025
