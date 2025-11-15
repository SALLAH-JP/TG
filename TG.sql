CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,   -- identifiant simple ex: A, B, C
    x FLOAT NOT NULL,            -- coordonnée X pour affichage
    y FLOAT NOT NULL,            -- coordonnée Y pour affichage
    capacity INTEGER DEFAULT 0   -- capacité du conteneur (optionnel)
);

CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    from_node INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    to_node   INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    weight FLOAT NOT NULL,     -- distance ou temps
    undirected BOOLEAN DEFAULT TRUE   -- graphe non orienté par défaut
);

-- Nodes
INSERT INTO nodes (name, x, y) VALUES ('DEPOT', 120, 260);
INSERT INTO nodes (name, x, y) VALUES ('A', 160, 370);
INSERT INTO nodes (name, x, y) VALUES ('B', 280, 200);
INSERT INTO nodes (name, x, y) VALUES ('C', 380, 300);
INSERT INTO nodes (name, x, y) VALUES ('D', 250, 320);
INSERT INTO nodes (name, x, y) VALUES ('E', 300, 400);
INSERT INTO nodes (name, x, y) VALUES ('F', 450, 390);
INSERT INTO nodes (name, x, y) VALUES ('G', 500, 170);

-- Edges (non orientées)
-- DEPOT ↔ B
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (1, 3, 2.3, TRUE);
-- DEPOT ↔ A
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (1, 2, 2.0, TRUE);
-- A ↔ D
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (2, 5, 2.2, TRUE);
-- A ↔ E
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (2, 6, 3.0, TRUE);
-- B ↔ D
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (3, 5, 2.7, TRUE);
-- B ↔ G
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (3, 8, 1.2, TRUE);
-- D ↔ C
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (5, 4, 1.8, TRUE);
-- D ↔ F
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (5, 7, 2.5, TRUE);
-- C ↔ F
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (4, 7, 1.9, TRUE);
-- C ↔ G
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES (4, 8, 1.5, TRUE);
-- B ↔ G (déjà ajouté)  
-- D ↔ B (déjà ajouté)
-- autres arêtes déjà couvertes par non-orienté

SELECT * FROM edges;
