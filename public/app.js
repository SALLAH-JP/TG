const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
let cons = [];
let path = [];
let teams = {};
const colors = [
    "#FFFFFF", // blanc
    "#FF0000", // rouge
    "#00FF00", // vert
    "#0000FF", // bleu
    "#FFFF00", // jaune
    "#FFA500", // orange
    "#800080", // violet
    "#00FFFF", // cyan
    "#FFC0CB", // rose
    "#808080", // gris
    "#A52A2A", // marron
    "#008000", // vert foncé
    "#000000"  // noir
];

let nodeCount = 0;


function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Arêtes
    edges.forEach(edge => {
        drawEdge(edge.from, edge.to, edge.weight);
    });

    // Nœuds
    nodes.forEach(node => {
        drawNode(node.x, node.y, node.name);
    });

    cons.forEach(con => {
        drawCons(con.from, con.to, con.weight);
    });


    const selectS = document.getElementById('source');
    selectS.innerHTML = "";
    const selectD = document.getElementById('destination');
    selectD.innerHTML = "";
    nodes.forEach(node => {
        const optionS = document.createElement('option'); // crée une option
        optionS.value = node.name;  // valeur envoyée / utilisée par onclick
        optionS.text = node.name;   // texte affiché
        selectS.appendChild(optionS); // ajoute l'option au select

        const optionD = document.createElement('option'); // crée une option
        optionD.value = node.name;  // valeur envoyée / utilisée par onclick
        optionD.text = node.name;   // texte affiché
        selectD.appendChild(optionD); // ajoute l'option au select
    });
}



function drawEdge(from, to, weight) {
    const fromNode = nodes.find(n => n.name === from);
    const toNode = nodes.find(n => n.name === to);
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(weight, (fromNode.x + toNode.x)/2, (fromNode.y + toNode.y)/2);
}



function drawNode(x, y, name) {
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fillStyle = colors[teams[name]];
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, x, y);
}


function drawCons(from, to, weight) {
    // Chercher les coordonnées des deux nœuds
    const n1 = nodes.find(n => n.name === from);
    const n2 = nodes.find(n => n.name === to);

    if (!n1 || !n2) {
        console.warn("Contrainte ignorée : noeud introuvable", from, to);
        return;
    }

    // Calcul du point au milieu
    const midX = (n1.x + n2.x) / 2;
    const midY = (n1.y + n2.y) / 2 - 40;

    // Dessin de l’icône avertissement
    ctx.beginPath();
    ctx.arc(midX, midY, 18, 0, Math.PI * 2);  
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Texte ⚠️ dedans
    ctx.fillStyle = "black";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚠️", midX, midY - 1);

    // Valeur au-dessus
    ctx.font = "12px Arial";
    ctx.fillText(weight, midX, midY - 25);
}




async function getGraph() {
    const response = await fetch('/graph');
    const data = await response.json();

    // remplir les listes globales
    nodes = data.nodes;
    edges = data.edges;
    cons = data.cons;

    nodes.forEach(node => {
        teams[node.name] = 0;
    });

}

async function getPath(scr, dst) {
    const response = await fetch(`/algo/dijkstra?src=${scr}&dst=${dst}`);
    const data = await response.json();

    if (data.distance === -1) data.distance = "Infini";

    if (data.path.length === 0) document.getElementById("path").textContent = "Aucun chemin trouvé";
    else document.getElementById("path").textContent = data.path.join(" → ");


    document.getElementById("distance").textContent = data.distance;

    // remplir les listes globales
    path = data.path;

}


async function getTeams(scr, dst) {

    const response = await fetch('/algo/coloring');
    const data = await response.json();

    teams = data;
    const nbTeams = Math.max(...Object.values(teams));

    const legend = document.querySelector(".legend");

    legend.innerHTML = ""; // reset si nécessaire

    for (let i = 1; i <= nbTeams; i++) {
        const li = document.createElement("li");
        
        // Créer le dot
        const dot = document.createElement("span");
        dot.classList.add("dot"); // optionnel si tu veux le style dot en général
        dot.style.backgroundColor = colors[i]; // couleur dynamique

        // Ajouter le texte
        li.textContent = ` Jour/équipe ${i}`;
        
        // Ajouter le dot avant le texte
        li.prepend(dot);

        // Ajouter à la légende
        legend.appendChild(li);
    }
    
    drawGraph();
}



let addNodeMode = false;
let delNodeMode = false;
let addEdgeMode = false;
let delEdgeMode = false;
let addConsMode = false;
let delConsMode = false;
let addPending = false;
let selectedNodeForEdge = null;
let selectedNodeForCons = null;


async function addNodeBdd(node) {
    const response = await fetch('/graph/node', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(node)
    });

    const data = await response.json();
    console.log('Réponse serveur :', data);
}

async function addEdgeBdd(edge) {
    const response = await fetch('/graph/edge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(edge)
    });

    const data = await response.json();
    console.log('Réponse serveur :', data);
}

async function addConsBdd(cons) {
    const response = await fetch('/graph/cons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cons)
    });

    const data = await response.json();
    console.log('Réponse serveur :', data);
}

async function delNodeBdd(node) {
    const res = await fetch("/graph/node", {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(node)
    });

    const data = await res.json();
    console.log(data);
}

async function delEdgeBdd(edge) {
    const response = await fetch('/graph/edge', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(edge)
    });

    const data = await response.json();
    console.log('Réponse serveur :', data);
}


async function delConsBdd(cons) {
    const response = await fetch('/graph/cons', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cons)
    });

    const data = await response.json();
    console.log('Réponse serveur :', data);
}

canvas.addEventListener("click", (event) => {
    if (addPending) return;


    addPending = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    if (addNodeMode) {

        // Création de l'input
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Nom";
        input.style.position = "absolute";
        input.style.left = event.clientX + "px";  // position dans la page
        input.style.top = event.clientY + "px";
        input.style.transform = "translate(-50%, -50%)";
        input.style.width = "40px";    // largeur fixe
        input.style.height = "20px";   // hauteur si tu veux
        input.style.fontSize = "12px"; // taille du texte
        input.style.padding = "2px";   // petit padding interne

        input.style.zIndex = 1000;

        document.body.appendChild(input);
        input.focus();

        let validated = false; // pour n'ajouter qu'une seule fois

        function valider() {
            if (validated) return; // déjà validé → ne rien faire
            validated = true;

            const exists = nodes.some(node => node.name === input.value.trim());
            if (exists) input.value = "";

            const name = input.value.trim() || "N" + (++nodeCount);
            input.remove();

            // Ajouter le nœud
            teams[name] = 0;
            let newNode = { name: name, x: x, y: y };
            nodes.push(newNode);
            addNodeBdd(newNode);

            drawGraph();

            //addNodeMode = false; // réactive le bouton pour ajouter le suivant
            addPending = false;
        }

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") valider();
        });

        //input.addEventListener("blur", () => valider());
    }



    if (delNodeMode) {

        // On parcourt à l'envers pour récupérer le nœud "au-dessus"
        for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i];
            const distance = Math.hypot(x - n.x, y - n.y);

            if (distance < 35) {
                nodes.splice(i, 1);

                edges = edges.filter(e => e.from !== n.name && e.to !== n.name);

                delNodeBdd(n);

                break;
            }
        }

        addPending = false;
        drawGraph();

    }



    if (addEdgeMode) {
        // Chercher si on a cliqué sur un nœud
        let clickedNode = null;
        
        for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i];
            const distance = Math.hypot(x - n.x, y - n.y);
            
            if (distance < 35) {
                clickedNode = n;
                break;
            }
        }

        if (clickedNode) {
            if (selectedNodeForEdge === null) {
                // Premier nœud sélectionné
                selectedNodeForEdge = clickedNode;
                console.log(`Nœud source sélectionné: ${clickedNode.name}`);
            } else if (selectedNodeForEdge === clickedNode) {
                // Clic sur le même nœud → annuler
                selectedNodeForEdge = null;
                console.log("Sélection annulée");
            } else {
                // Deuxième nœud sélectionné → créer l'arête
                const from = selectedNodeForEdge.name;
                const to = clickedNode.name;
                
                // Vérifier si l'arête existe déjà
                const edgeExists = edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
                
                if (!edgeExists) {
                    // Création de l'input
                    const input = document.createElement("input");
                    input.type = "text";
                    input.placeholder = "Nom";
                    input.style.position = "absolute";
                    input.style.left = event.clientX + "px";  // position dans la page
                    input.style.top = event.clientY + "px";
                    input.style.transform = "translate(-50%, -50%)";
                    input.style.width = "40px";    // largeur fixe
                    input.style.height = "20px";   // hauteur si tu veux
                    input.style.fontSize = "12px"; // taille du texte
                    input.style.padding = "2px";   // petit padding interne

                    input.style.zIndex = 1000;

                    document.body.appendChild(input);
                    input.focus();

                    let validated = false;

                    function validerEdge() {
                        if (validated) return;
                        validated = true;

                        const weight = input.value.trim() || "1";
                        const weightValue = parseFloat(weight) || 1;
                        input.remove();

                        const newEdge = { from: from, to: to, weight: weightValue };
                        edges.push(newEdge);
                        addEdgeBdd(newEdge);

                        console.log(`Arête créée: ${from} → ${to} (poids: ${weightValue})`);
                        
                        selectedNodeForEdge = null;
                        drawGraph();
                    }

                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") validerEdge();
                    });

                } else {
                    alert("Cette arête existe déjà!");
                    selectedNodeForEdge = null;
                }
            }
        }

        addPending = false;
    }




    if (delEdgeMode) {
        const tolerance = 5; // pixels autour de la ligne

        // Parcours toutes les arêtes
        for (let i = edges.length - 1; i >= 0; i--) {
            const e = edges[i];
            const fromNode = nodes.find(n => n.name === e.from);
            const toNode = nodes.find(n => n.name === e.to);
            if (!fromNode || !toNode) continue;

            // Calcul distance point -> segment
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.hypot(dx, dy);
            const distance = Math.abs(dy*x - dx*y + toNode.x*fromNode.y - toNode.y*fromNode.x) / length;

            if (distance <= tolerance) {
                edges.splice(i, 1);
                delEdgeBdd(e);
                
                break;
            }
        }

        addPending = false;
        drawGraph();
    }




    if (addConsMode) {
        // Chercher si on a cliqué sur un nœud
        let clickedNode = null;
        
        for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i];
            const distance = Math.hypot(x - n.x, y - n.y);
            
            if (distance < 35) {
                clickedNode = n;
                break;
            }
        }

        if (clickedNode) {
            if (selectedNodeForCons === null) {
                // Premier nœud sélectionné
                selectedNodeForCons = clickedNode;
                console.log(`Nœud source sélectionné: ${clickedNode.name}`);
            } else if (selectedNodeForCons === clickedNode) {
                // Clic sur le même nœud → annuler
                selectedNodeForCons = null;
                console.log("Sélection annulée");
            } else {
                // Deuxième nœud sélectionné → créer l'arête
                const from = selectedNodeForCons.name;
                const to = clickedNode.name;
                
                // Vérifier si l'arête existe déjà
                const consExists = cons.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
                const edgeExists = edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
                
                if (!consExists && edgeExists) {
                    // Création de l'input
                    const input = document.createElement("input");
                    input.type = "text";
                    input.placeholder = "Nom";
                    input.style.position = "absolute";
                    input.style.left = event.clientX + "px";  // position dans la page
                    input.style.top = event.clientY + "px";
                    input.style.transform = "translate(-50%, -50%)";
                    input.style.width = "40px";    // largeur fixe
                    input.style.height = "20px";   // hauteur si tu veux
                    input.style.fontSize = "12px"; // taille du texte
                    input.style.padding = "2px";   // petit padding interne

                    input.style.zIndex = 1000;

                    document.body.appendChild(input);
                    input.focus();

                    let validated = false;

                    function validerCons() {
                        if (validated) return;
                        validated = true;

                        const weight = input.value.trim() || "1";
                        const weightValue = parseFloat(weight) || 1;
                        input.remove();

                        const newCons = { from: from, to: to, weight: weightValue};
                        cons.push(newCons);
                        addConsBdd(newCons);

                        console.log(`Const créée: ${from} → ${to} (poids: ${weightValue})`);
                        
                        selectedNodeForCons = null;
                        drawGraph();
                    }

                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") validerCons();
                    });

                } else {
                    alert("Cette Constante existe déjà!");
                    selectedNodeForCons = null;
                }
            }
        }

        addPending = false;
    }




    if (delConsMode) {
        const tolerance = 5; // pixels autour de la ligne

        // Parcours toutes les arêtes
        for (let i = cons.length - 1; i >= 0; i--) {
            const e = cons[i];
            const fromNode = nodes.find(n => n.name === e.from);
            const toNode = nodes.find(n => n.name === e.to);
            if (!fromNode || !toNode) continue;

            // Calcul distance point -> segment
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.hypot(dx, dy);
            const distance = Math.abs(dy*x - dx*y + toNode.x*fromNode.y - toNode.y*fromNode.x) / length;

            if (distance <= tolerance) {
                cons.splice(i, 1);
                delConsBdd(e);
                
                break;
            }
        }

        addPending = false;
        drawGraph();
    }




    
});



const actionSelect = document.getElementById("actionSelect");
const actionBtn = document.getElementById("actionBtn");

actionSelect.addEventListener("change", function () {
    addNodeMode = false;
    delNodeMode = false;
    addEdgeMode = false;
    delEdgeMode = false;
    addConsMode = false;
    delConsMode = false;


    addPending = false;
    selectedNodeForEdge = null;

    actionBtn.style.backgroundColor = "#eee";

    document.querySelectorAll("input").forEach(inp => inp.remove());
});



function modifGraph() {
    console.log(addPending);
    const action = document.getElementById("actionSelect").value;

    if (action === "addNode") addNodeMode = !addNodeMode;
    else if (action === "delNode") delNodeMode = !delNodeMode;
    else if (action === "addEdge")  addEdgeMode = !addEdgeMode;
    else if (action === "delEdge") delEdgeMode = !delEdgeMode;
    else if (action === "addCons")  addConsMode = !addConsMode;
    else if (action === "delCons") delConsMode = !delConsMode;


    if (addNodeMode) actionBtn.style.backgroundColor = "#4CAF50";
    else if (delNodeMode) actionBtn.style.backgroundColor = "#e53935";
    else if (addEdgeMode) actionBtn.style.backgroundColor = "#4CAF50";
    else if (delEdgeMode) actionBtn.style.backgroundColor = "#e53935";
    else if (addConsMode) actionBtn.style.backgroundColor = "#4CAF50";
    else if (delConsMode) actionBtn.style.backgroundColor = "#e53935";
    else actionBtn.style.backgroundColor = "#eee";


}



async function main() {
    await getGraph();
    
    const canvas = document.getElementById("graphCanvas");

    // Ajuste la taille réelle du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    drawGraph();

}

main();


