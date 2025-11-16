from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)  # permet à JS d'accéder au backend


# --- Connexion PostgreSQL ---
def get_connection():
    return psycopg2.connect(
        dbname="TG",
        user="postgres",
        password="2004",
        host="localhost",   # ou IP du serveur
        port=5432
    )



@app.route("/")
def index():
    return render_template("index.html")



def load_graph():
    conn = get_connection()
    cur = conn.cursor()

    # --- Récupérer les nodes ---
    cur.execute("SELECT id, name, x, y, capacity FROM nodes;")
    nodes_data = cur.fetchall()
    
    nodes = []
    id_to_name = {}
    for node_id, name, x, y, capacity in nodes_data:
        nodes.append({
            "name": name,
            "x": x,
            "y": y,
            "capacity": capacity
        })
        id_to_name[node_id] = name

    # --- Récupérer les edges ---
    cur.execute("SELECT from_node, to_node, weight, undirected FROM edges;")
    edges_data = cur.fetchall()

    edges = []
    for from_id, to_id, weight, undirected in edges_data:
        edge = {
            "from": id_to_name[from_id],
            "to": id_to_name[to_id],
            "weight": weight,
            "undirected": undirected
        }
        edges.append(edge)

    cur.close()
    conn.close()

    return nodes, edges


@app.route('/graph')
def get_graph():
    nodes, edges = load_graph()

    # --- Retourner deux listes ---
    return jsonify({"nodes": nodes, "edges": edges})



def dijkstra(graph, start, goal):
    
    unvisited = set(graph.keys())
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {node: None for node in graph}

    while unvisited:
        # Sélectionner le nœud non visité avec la plus petite distance
        current = min((node for node in unvisited), key=lambda node: distances[node])

        if distances[current] == float('inf'):
            break  # Les nœuds restants sont inaccessibles

        unvisited.remove(current)

        # Si on a atteint l'objectif
        if current == goal:
            # Construire le chemin
            path = []
            while current is not None:
                path.insert(0, current)
                current = previous[current]
            return path, distances[path[-1]]

        # Mettre à jour les voisins
        for neighbor, weight in graph[current]:
            if neighbor in unvisited:
                new_distance = distances[current] + weight
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current

    return None, float('inf')  # Aucun chemin trouvé


@app.route("/algo/dijkstra")
def api_dijkstra():
    src = request.args.get("src")
    dst = request.args.get("dst")

    nodes, edges = load_graph()
    graph = {}

    # Initialiser chaque nœud avec une liste vide
    for node in nodes:
        graph[node["name"]] = []

    # Ajouter les tuples
    for edge in edges:
        source = edge["from"]
        desti = edge["to"]
        weight = edge["weight"]

        # Ajouter (destination, poids)
        graph[source].append((desti, weight))
        graph[desti].append((source, weight))


    if not src or not dst:
        return jsonify({"error": "src et dst sont requis"}), 400

    path, distance = dijkstra(graph, src, dst)

    return jsonify({"path": path, "distance": distance})



@app.route('/algo/coloring')
def color():
    nodes, edges = load_graph()
    graph = {}

    # Initialiser chaque nœud avec une liste vide
    for node in nodes:
        graph[node["name"]] = []

    # Ajouter les tuples
    for edge in edges:
        source = edge["from"]
        desti = edge["to"]
        weight = edge["weight"]

        # Ajouter (destination, poids)
        graph[source].append((desti, weight))
        graph[desti].append((source, weight))


    degres = {noeud: len(voisins) for noeud, voisins in graph.items()}
    
    # 2️ Trier les noeuds par degré décroissant
    noeuds_tries = sorted(graph.keys(), key=lambda n: degres[n], reverse=True)

    couleur_noeud = {n : 0 for n in graph}

    # 3️ Colorier chaque noeud
    for noeud in range(len(noeuds_tries) - 1):
        voisins = [v[0] for v in graph[noeuds_tries[noeud]]]  # on prend juste le nom des voisins

        for col_node in couleur_noeud:
            if not (col_node in voisins) and couleur_noeud[col_node] == 0:
                couleur_noeud[col_node] = noeud + 1

    return jsonify(couleur_noeud)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
