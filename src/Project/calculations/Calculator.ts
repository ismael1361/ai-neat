import Node from "./Node";
import Connection from "./Connection";
import NodeGene from "../genome/NodeGene";
import ConnectionGene from "../genome/ConnectionGene";
import { RandomHashSet } from "../data_structures";
import Genome from "../genome/Genome";

/**
 * @class
 * @description Representa um calculador para uma rede neural.
 */
export default class Calculator {
	/**
	 * @type {Array<Node>}
	 * @description Nós de entrada da rede neural.
	 */
	input_nodes: Array<Node> = [];

	/**
	 * @type {Array<Node>}
	 * @description Nós ocultos da rede neural.
	 */
	hidden_nodes: Array<Node> = [];

	/**
	 * @type {Array<Node>}
	 * @description Nós de saída da rede neural.
	 */
	output_nodes: Array<Node> = [];

	/**
	 * @constructor
	 * @param {Genome} g - O genoma associado ao calculador.
	 */
	constructor(g: Genome) {
		const nodes: RandomHashSet<NodeGene> = g.getNodes();
		const cons: RandomHashSet<ConnectionGene> = g.getConnections();

		const nodeHashMap: Map<number, Node> = new Map();

		for (const n of nodes.getData()) {
			const node: Node = new Node(n.getX());
			nodeHashMap.set(n.getInnovation_number(), node);

			if (n.getX() <= 0.1) {
				this.input_nodes.push(node);
			} else if (n.getX() >= 0.9) {
				this.output_nodes.push(node);
			} else {
				this.hidden_nodes.push(node);
			}
		}

		this.hidden_nodes.sort((o1, o2) => o1.compareTo(o2));

		for (const c of cons.getData()) {
			const from: NodeGene = c.getFrom();
			const to: NodeGene = c.getTo();

			const node_from: Node | undefined = nodeHashMap.get(from.getInnovation_number());
			const node_to: Node | undefined = nodeHashMap.get(to.getInnovation_number());

			if (node_from && node_to) {
				const con: Connection = new Connection(node_from, node_to);
				con.setWeight(c.getWeight());
				con.setEnabled(c.isEnabled());

				node_to.pushConnection(con);
			}
		}
	}

	/**
	 * @method
	 * @param {...number} input - Os valores de entrada para a rede neural.
	 * @returns {Array<number>} - Os valores de saída da rede neural.
	 */
	calculate(...input: number[]): Array<number> {
		if (input.length !== this.input_nodes.length) {
			throw new Error("Data doesn't fit");
		}

		for (let i = 0; i < this.input_nodes.length; i++) {
			this.input_nodes[i].setOutput(input[i]);
		}

		for (const n of this.hidden_nodes) {
			n.calculate();
		}

		const output: Array<number> = [];
		for (let i = 0; i < this.output_nodes.length; i++) {
			this.output_nodes[i].calculate();
			output.push(this.output_nodes[i].getOutput());
		}

		return output;
	}
}
