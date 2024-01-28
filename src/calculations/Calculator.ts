import { ConnectionGene, Genome } from "../genome";
import Connection from "./Connection";
import Node, { ActivationFunction } from "./Node";

export default class Calculator {
	private inputs: Node[] = [];
	private hidden: Node[] = [];
	private outputs: Node[] = [];

	private type_activation: ActivationFunction = "sigmoid";

	constructor(g: Genome) {
		const nodes = g.nodes;
		const cons = g.connections;
		this.type_activation = g.neat.TYPE_ACTIVATION_FUNCTION;
		const nodeHash: Map<number, Node> = new Map<number, Node>();

		for (const n of nodes.getData()) {
			const node = new Node(n.innovation, n.x);
			node.typeActivation = this.type_activation;
			nodeHash.set(n.innovation, node);
		}

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

		for (let node of nodeHash.values()) {
			if (node.x <= 0.1) {
				this.inputs.push(node);
			} else if (node.x >= 0.9) {
				this.outputs.push(node);
			} else {
				this.hidden.push(node);
			}
		}

		this.hidden.sort((a, b) => b.compareTo(a));
	}

	calculate(...inputs: number[]): number[] {
		inputs = inputs.slice(0, this.inputs.length - 1).map((x) => (x ?? 0) + 0.00001);
		inputs.push(1);

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

	calculateError(input: number[], target: number[], updateWeight: boolean = false, learningRate: number = 0.1): number[] {
		this.calculate(...input);
		const errors: number[] = [];
		for (let i = 0; i < this.outputs.length; i++) {
			this.outputs[i].calculateError((target[i] ?? 0) + 0.00001);
			errors.push(this.outputs[i].error);
		}

		for (let i = this.hidden.length - 1; i >= 0; i--) {
			this.hidden[i].calculateError();
		}
		if (updateWeight) {
			for (let i = 0; i < this.outputs.length; i++) {
				this.outputs[i].applyDelta(learningRate);
			}

			for (let i = this.hidden.length - 1; i >= 0; i--) {
				this.hidden[i].applyDelta(learningRate);
			}
		}
		return errors;
	}

	getWeightBy(connection: ConnectionGene): number {
		let select_connection: Connection | undefined;

		for (let i = 0; i < this.outputs.length; i++) {
			for (let c of this.outputs[i].connections) {
				if (c.from.innovation === connection.from.innovation && c.to.innovation === connection.to.innovation) {
					select_connection = c;
					break;
				}
			}
		}

		if (!select_connection) {
			for (let i = 0; i < this.hidden.length; i++) {
				for (let c of this.hidden[i].connections) {
					if (c.from.innovation === connection.from.innovation && c.to.innovation === connection.to.innovation) {
						select_connection = c;
						break;
					}
				}
			}
		}

		return !select_connection ? connection.weight : select_connection.weight;
	}
}
