CREATE TABLE nodes (
    name TEXT PRIMARY KEY,
    x FLOAT NOT NULL,            -- coordonnée X pour affichage
    y FLOAT NOT NULL             -- coordonnée Y pour affichage
);

CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    from_node TEXT NOT NULL REFERENCES nodes(name) ON DELETE CASCADE,
    to_node   TEXT NOT NULL REFERENCES nodes(name) ON DELETE CASCADE,
    weight FLOAT NOT NULL,
    undirected BOOLEAN DEFAULT TRUE
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
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('DEPOT', 'B', 2.3, TRUE);
-- DEPOT ↔ A
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('DEPOT', 'A', 2.0, TRUE);
-- A ↔ D
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('A', 'D', 2.2, TRUE);
-- A ↔ E
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('A', 'E', 3.0, TRUE);
-- B ↔ D
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('B', 'D', 2.7, TRUE);
-- B ↔ G
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('B', 'G', 1.2, TRUE);
-- D ↔ C
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('D', 'C', 1.8, TRUE);
-- D ↔ F
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('D', 'F', 2.5, TRUE);
-- C ↔ F
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('C', 'F', 1.9, TRUE);
-- C ↔ G
INSERT INTO edges (from_node, to_node, weight, undirected) VALUES ('C', 'G', 1.5, TRUE);
-- B ↔ G (déjà ajouté)  
-- D ↔ B (déjà ajouté)
-- autres arêtes déjà couvertes par non-orienté

SELECT * FROM nodes;
