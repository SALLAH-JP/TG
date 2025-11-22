import psycopg2


# --- Connexion PostgreSQL ---
def get_connection():
    return psycopg2.connect(
        dbname="TG",
        user="postgres",
        password="2004",
        host="localhost",   # ou IP du serveur
        port=5432
    )



def index():
    return render_template("index.html")



def load_graph():
    conn = get_connection()
    cur = conn.cursor()

    # --- Récupérer les nodes ---
    cur.execute("SELECT name, x, y FROM nodes;")
    nodes_data = cur.fetchall()
    
    nodes = []
    for name, x, y in nodes_data:
        nodes.append({
            "name": name,
            "x": x,
            "y": y
        })

    # --- Récupérer les edges ---
    cur.execute("SELECT from_node, to_node, weight, undirected FROM edges;")
    edges_data = cur.fetchall()

    edges = []
    for from_node, to_node, weight, undirected in edges_data:
        edge = {
            "from": from_node,
            "to": to_node,
            "weight": weight,
            "undirected": undirected
        }
        edges.append(edge)


    # --- Récupérer les edges ---
    cur.execute("SELECT from_node, to_node, weight FROM contraintes;")
    cons_data = cur.fetchall()

    cons = []
    for from_node, to_node, weight in cons_data:
        con = {
            "from": from_node,
            "to": to_node,
            "weight": weight,
        }
        cons.append(con)

    cur.close()
    conn.close()

    return nodes, edges, cons



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


def api_dijkstra(src, dst):
    nodes, edges, cons = load_graph()
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
        

        for con in cons:
            if (con["from"] == source and con["to"] == desti) or (con["from"] == desti and con["to"] == source):
                weight += con["weight"]

        graph[source].append((desti, weight))
        graph[desti].append((source, weight))





    if not src or not dst:
        return jsonify({"path": [], "distance": -1})

    path, distance = dijkstra(graph, src, dst)
    if distance == float('inf'):
        distance = -1
        path = []

    return (path, distance)


def color():
    nodes, edges, cons = load_graph()
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


    node_colors = {}
    nodes_sorted = sorted(graph.keys(), key=lambda n: len(graph[n]), reverse=True)

    for node in nodes_sorted:
        # trouver les couleurs utilisées par les voisins
        used_colors = {node_colors[neighbor] for neighbor, _ in graph[node] if neighbor in node_colors}

        # assigner la plus petite couleur disponible
        color = 1
        while color in used_colors:
            color += 1

        node_colors[node] = color

    return node_colors




def add_node(name, x, y):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO nodes (name, x, y) VALUES (%s, %s, %s)",
            (name, float(x), float(y))
        )
        conn.commit()
        return "success"
    except Exception as e:
        conn.rollback()
        return "error"


    cur.close()
    conn.close()



def add_edge(from_node, to_node, weight):
    conn = get_connection()
    cur = conn.cursor()


    try:
        cur.execute(
            "INSERT INTO edges (from_node, to_node, weight) VALUES (%s, %s, %s)",
            (from_node, to_node, weight)
        )
        conn.commit()
        return "success"
    except Exception as e:
        conn.rollback()
        return "error"


    cur.close()
    conn.close()




def del_node(name):
    conn = get_connection()
    cur = conn.cursor()

    try:

        cur.execute("DELETE FROM nodes WHERE name = %s", (name,))
        conn.commit()
        return "success"
    except Exception as e:
        conn.rollback()
        return "error"


    cur.close()
    conn.close()



def del_edge(from_node, to_node):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            DELETE FROM edges
            WHERE ((from_node = %s) AND (to_node = %s))
               OR ((from_node = %s) AND (to_node = %s))
            """,
            (from_node, to_node, to_node, from_node)
        )
        conn.commit()
        return "success"
    except Exception as e:
        conn.rollback()
        return "error"


    cur.close()
    conn.close()



def add_cons(from_node, to_node, weight):
    conn = get_connection()
    cur = conn.cursor()


    try:
        cur.execute(
            "INSERT INTO contraintes (from_node, to_node, weight) VALUES (%s, %s, %s)",
            (from_node, to_node, weight)
        )
        conn.commit()
        return "success"
    except Exception as e:
        conn.rollback()
        return "error"


    cur.close()
    conn.close()


def del_cons(from_node, to_node):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            DELETE FROM contraintes
            WHERE ((from_node = %s) AND (to_node = %s))
               OR ((from_node = %s) AND (to_node = %s))
            """,
            (from_node, to_node, to_node, from_node)
        )
        conn.commit()
        return "success"
    except Exception as e:
        conn.rollback()
        return "error"


    cur.close()
    conn.close()
