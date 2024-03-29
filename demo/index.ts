import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { Neat } from "../src/neat";

const neat = new Neat(2, 1, 1000, "sigmoid");

let g = neat.empty_genome();

for (let i = 0; i < 10; i++) {
	g.mutate(false);
}
g.generateCalculator();

drawNetwork(g);

const train_input_data = [
	[0, 0],
	[0, 1],
	[1, 0],
	[1, 1],
];

const train_output_data = [[0], [1], [1], [0]];

for (let i = 0; i < train_input_data.length; i++) {
	const input = train_input_data[i];
	const output = g.calculate(...input);
	console.log(
		input,
		train_output_data[i],
		output.map((o) => (o > 0.5 ? 1 : 0)),
		output.map((o) => o.toFixed(4)),
	);
}

console.log("===========================");

neat.train(
	g,
	train_input_data,
	train_output_data,
	{
		max_iterations: 1500000,
		tolerance: 0.1,
		probability_mutate: 0.2,
		max_check: 5,
	},
	({ error, accuracy, count }) => {
		console.log(error, accuracy, count);
	},
);

console.log("===========================");

for (let i = 0; i < train_input_data.length; i++) {
	const input = train_input_data[i];
	const output = g.calculate(...input);
	console.log(
		input,
		train_output_data[i],
		output.map((o) => (o > 0.5 ? 1 : 0)),
		output.map((o) => o.toFixed(4)),
	);
}

// neat.train(train_input_data, train_output_data, {});

// const client = neat.getClient();

// if (client) {
// 	for (let i = 0; i < train_input_data.length; i++) {
// 		const input = train_input_data[i];
// 		const output = client.calculate(...input)[0];
// 		console.log(input, train_output_data[i], output);
// 	}

// 	console.log("Score:", client.score);

// 	g = client.genome;
// }

drawNetwork(g);

function drawNetwork(gene: typeof g) {
	const canvasWidth = 800;
	const canvasHeight = 600;

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fill();

	// Função para desenhar um círculo
	function drawCircle(x: number, y: number, color: string = "white", radius: number = 10) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.lineWidth = 4;
		ctx.fillStyle = color;
		ctx.stroke();
		ctx.fill();
		ctx.restore();
	}

	// Função para desenhar uma linha
	function drawLine(x1: number, y1: number, x2: number, y2: number, label: any, color: string = "black") {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineWidth = 4;
		ctx.strokeStyle = color;
		ctx.stroke();
		ctx.fillStyle = color;
		ctx.font = "10px Arial";
		ctx.fillText(new String(label + "       ").substring(0, 7), (x1 + x2) / 2, (y1 + y2) / 2 + 15);
		ctx.restore();
	}

	for (let c of gene.connections.getData()) {
		const x1 = c.from.x * canvasWidth;
		const y1 = c.from.y * canvasHeight;
		const x2 = c.to.x * canvasWidth;
		const y2 = c.to.y * canvasHeight;
		const color = c.isEnabled ? "green" : "red";
		drawLine(x1, y1, x2, y2, c.weight, color);
	}

	for (let n of gene.nodes.getData()) {
		const x = n.x * canvasWidth;
		const y = n.y * canvasHeight;
		drawCircle(x, y, n.isBias ? "black" : undefined);
	}

	// Salvar a imagem em um arquivo
	const buffer = canvas.toBuffer("image/png");
	fs.writeFileSync("output.png", buffer);
}
