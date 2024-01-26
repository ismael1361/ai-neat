import { Genome } from "../genome";
import Connection from "./Connection";
import Node from "./Node";

export default class Calculator {
	private inputs: Node[] = [];
	private hidden: Node[] = [];
	private outputs: Node[] = [];

	constructor(g: Genome) {
		const nodes = g.nodes;
		const cons = g.connections;
		const nodeHash: Map<number, Node> = new Map<number, Node>();

		for (const n of nodes.getData()) {
			const node = new Node(n.x);
			nodeHash.set(n.innovation, node);

			if (node.x <= 0.1) {
				this.inputs.push(node);
			} else if (node.x >= 0.9) {
				this.outputs.push(node);
			} else {
				this.hidden.push(node);
			}
		}

		this.hidden.sort((a, b) => a.compareTo(b));

		for (const c of cons.getData()) {
			const from = c.from;
			const to = c.to;

			const node_from = nodeHash.get(from.innovation) as Node;
			const node_to = nodeHash.get(to.innovation) as Node;

			const connection = new Connection(node_from, node_to);
			connection.weight = c.weight;
			connection.isEnabled = c.isEnabled;

			node_to.connections.push(connection);
		}
	}

	calculate(...inputs: number[]): number[] {
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].output = inputs[i] ?? 1;
		}

		for (const node of this.hidden) {
			node.calculate();
		}

		const outputs: number[] = [];
		for (const node of this.outputs) {
			node.calculate();
			outputs.push(node.output);
		}

		return outputs;
	}
}
