from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import os
import logic  # tes fonctions métier



class Handler(BaseHTTPRequestHandler):

    # --------------------------
    # GET
    # --------------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/":
            path = "/index.html"

        filepath = os.path.join("public", path.lstrip("/"))
        if os.path.exists(filepath):
            if filepath.endswith(".html"):
                ctype = "text/html"
            elif filepath.endswith(".css"):
                ctype = "text/css"
            elif filepath.endswith(".js"):
                ctype = "application/javascript"
            else:
                ctype = "application/octet-stream"

            with open(filepath, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.end_headers()
            self.wfile.write(content)
            return  # on sort ici, fichier statique servi


        if parsed.path == "/algo/dijkstra":
            qs = parse_qs(parsed.query)
            src = qs.get("src", [""])[0]
            dst = qs.get("dst", [""])[0]

            path, dist = logic.api_dijkstra(src, dst)

            if dist == float("inf") or dist == -1:
                dist = "inf"

            return self.send_json({"distance": dist, "path": path})

        if parsed.path == "/graph":
            nodes, edges, cons = logic.load_graph()
            return self.send_json({"nodes": nodes, "edges": edges, "cons": cons})

        if parsed.path == "/algo/coloring":
            result = logic.color()
            return self.send_json(result)

        # Aucune route trouvée
        self.send_error(404)

    # --------------------------
    # POST
    # --------------------------
    def do_POST(self):
        parsed = urlparse(self.path)

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body)
        except:
            return self.send_json({"success": False, "message": "JSON invalide"})

        if parsed.path == "/graph/node":
            status = logic.add_node(data["name"], data["x"], data["y"])
            return self.send_json({"success": status == "success"})

        if parsed.path == "/graph/cons":
            status = logic.add_cons(data["from"], data["to"], data["weight"])
            return self.send_json({"success": status == "success"})

        if parsed.path == "/graph/edge":
            status = logic.add_edge(data["from"], data["to"], data["weight"])
            return self.send_json({"success": status == "success"})

        self.send_error(404)


    # --------------------------
    # POST
    # --------------------------
    def do_DELETE(self):
        parsed = urlparse(self.path)

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body)
        except:
            return self.send_json({"success": False, "message": "JSON invalide"})

        if parsed.path == "/graph/node":
            status = logic.del_node(data["name"])
            return self.send_json({"success": status == "success"})

        if parsed.path == "/graph/cons":
            status = logic.del_cons(data["from"], data["to"])
            return self.send_json({"success": status == "success"})

        if parsed.path == "/graph/edge":
            status = logic.del_edge(data["from"], data["to"])
            return self.send_json({"success": status == "success"})

        self.send_error(404)

    # --------------------------
    # JSON Helper - ✅ CORRIGÉ
    # --------------------------
    def send_json(self, obj):
        j = json.dumps(obj)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        # ✅ BYTES au lieu de STRING
        self.wfile.write(j.encode("utf-8"))

# --------------------------
# SERVER START
# --------------------------
if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 5000), Handler)
    print("✅ Serveur lancé : http://localhost:5000")
    server.serve_forever()
