const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];
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


function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Arêtes
  edges.forEach(edge => {
    const fromNode = nodes.find(n => n.name === edge.from);
    const toNode = nodes.find(n => n.name === edge.to);
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(edge.weight, (fromNode.x + toNode.x)/2, (fromNode.y + toNode.y)/2);
  });

  // Nœuds
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 35, 0, Math.PI * 2);
    ctx.fillStyle = colors[teams[node.name]];
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.name, node.x, node.y);
  });
}

async function getGraph() {
    try {
        const response = await fetch('http://127.0.0.1:5000/graph');
        const data = await response.json();

        // remplir les listes globales
        nodes = data.nodes;
        edges = data.edges;

        nodes.forEach(node => {
            teams[node.name] = 0;
        });

    } catch (err) {
        console.error(err);
    }
}

async function getPath(scr, dst) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/algo/dijkstra?src=${scr}&dst=${dst}`);
        const data = await response.json();

        document.getElementById("path").textContent = data.path.join(" → ");
        document.getElementById("distance").textContent = data.distance;

        // remplir les listes globales
        path = data.path;

    } catch (err) {
        console.error(err);
    }
}


async function getTeams(scr, dst) {
    try {
        const response = await fetch('http://127.0.0.1:5000/algo/coloring');
        const data = await response.json();

        //document.getElementById("path").textContent = data.path.join(" → ");
        //document.getElementById("distance").textContent = data.distance;

        // remplir les listes globales
        
        teams = data;
        drawGraph();


    } catch (err) {
        console.error(err);
    }
}



async function main() {
    await getGraph();
    drawGraph();

    const selectS = document.getElementById('source');
    const selectD = document.getElementById('destination');

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

main();


