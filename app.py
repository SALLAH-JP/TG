from flask import Flask, jsonify, render_template
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


@app.route('/graph')
def get_graph():
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

    # --- Retourner deux listes ---
    return jsonify({"nodes": nodes, "edges": edges})


@app.route('/algo/dijkstra?src=A&dst=Z')
def dijkstra(graph, start, goal):
    # Initialisation
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
        for neighbor, weight in graph[current].items():
            if neighbor in unvisited:
                new_distance = distances[current] + weight
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current

    return None, float('inf')  # Aucun chemin trouvé


@app.route('/algo/coloring')
def color(graph):
    colors = {}  # {node: color}

    for node in edges:  
        # couleurs déjà utilisées par les voisins
        neighbor_colors = {colors[n] for n in edges[node] if n in colors}

        # trouver la première couleur disponible
        c = 0
        while c in neighbor_colors:
            c += 1
        
        colors[node] = c

    return colors



if __name__ == "__main__":
    app.run(debug=True, port=5000)
