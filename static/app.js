const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let nodes = [];
let edges = [];

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
    ctx.fillStyle = "#9bd0ff";
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

        console.log("Nodes inside function:", nodes);
        console.log("Edges inside function:", edges);
    } catch (err) {
        console.error(err);
    }
}




async function main() {
    await getGraph();
    drawGraph();
}

main();


