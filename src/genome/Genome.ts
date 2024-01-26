import { Calculator } from "../calculations";
import { RandomHashSet } from "../data_structures";
import Neat from "../neat/Neat";
import ConnectionGene from "./ConnectionGene";
import NodeGene from "./NodeGene";

export default class Genome {
	private _connections: RandomHashSet<ConnectionGene> = new RandomHashSet<ConnectionGene>();
	private _nodes: RandomHashSet<NodeGene> = new RandomHashSet<NodeGene>();

	private _neat: Neat;
	private _calculator: Calculator;

	constructor(neat: Neat) {
		this._neat = neat;
		this._calculator = new Calculator(this);
	}

	/**
	 * Calcula a distância entre dois genomas.
	 * - g1 deve ter o maior número de inovação!
	 *
	 * @param g2 - O segundo genoma para calcular a distância.
	 * @returns A distância entre os genomas.
	 */
	distance(g2: Genome): number {
		let g1: Genome = this;

		const highestInnovationGene1: number = g1.connections.size > 0 ? g1.connections.get(g1.connections.size - 1)?.innovation ?? 0 : 0;
		const highestInnovationGene2: number = g2.connections.size > 0 ? g2.connections.get(g2.connections.size - 1)?.innovation ?? 0 : 0;

		if (highestInnovationGene1 < highestInnovationGene2) {
			// Troca os genomas se g1 não tiver a maior inovação
			const temp: Genome = g1;
			g1 = g2;
			g2 = temp;
		}

		let indexG1: number = 0;
		let indexG2: number = 0;
		let similar: number = 0;
		let disjoint: number = 0;
		let excess: number = 0;
		let weightDiff: number = 0;

		while (indexG1 < g1.connections.size && indexG2 < g2.connections.size) {
			const gene1: ConnectionGene = g1.connections.get(indexG1) as ConnectionGene;
			const gene2: ConnectionGene = g2.connections.get(indexG2) as ConnectionGene;

			const in1: number = gene1.innovation;
			const in2: number = gene2.innovation;

			if (in1 === in2) {
				similar++;
				weightDiff += Math.abs(gene1.weight - gene2.weight);
				indexG1++;
				indexG2++;
			} else if (in1 < in2) {
				disjoint++;
				indexG1++;
			} else {
				disjoint++;
				indexG2++;
			}
		}

		weightDiff = weightDiff / Math.max(1, similar);
		excess = g1.connections.size - indexG1;

		let N: number = Math.max(g1.connections.size, g2.connections.size);

		if (N < 20) {
			N = 1;
		}

		let result = (this.neat.C1 * disjoint) / N;
		result += (this.neat.C2 * excess) / N;
		result += this.neat.C3 * weightDiff;
		return result;
	}

	/**
	 * Cria um novo genoma resultante da combinação de dois genomas.
	 * g1 deve ter a pontuação mais alta.
	 * - Leva todos os genes de "a"
	 * - Se houver um gene em "a" que também está em "b", escolhe aleatoriamente
	 * - Não leva genes disjoint de "b"
	 * - Leva genes excess de "a", se existirem
	 *
	 * @param g1 - O primeiro genoma para a cruzada.
	 * @param g2 - O segundo genoma para a cruzada.
	 * @returns O novo genoma resultante da cruzada.
	 */
	static crossover(g1: Genome, g2: Genome): Genome {
		const neat: Neat = g1.neat;
		const genome: Genome = neat.empty_genome();
		let indexG1: number = 0;
		let indexG2: number = 0;

		while (indexG1 < g1.connections.size && indexG2 < g2.connections.size) {
			const gene1: ConnectionGene = g1.connections.get(indexG1) as ConnectionGene;
			const gene2: ConnectionGene = g2.connections.get(indexG2) as ConnectionGene;

			const in1: number = gene1.innovation;
			const in2: number = gene2.innovation;

			if (in1 === in2) {
				if (Math.random() < 0.5) {
					genome.connections.add(Neat.getConnection(gene1));
				} else {
					genome.connections.add(Neat.getConnection(gene2));
				}
				indexG1++;
				indexG2++;
			} else if (in1 < in2) {
				genome.connections.add(Neat.getConnection(gene1));
				indexG1++;
			} else {
				indexG2++;
			}
		}

		while (indexG1 < g1.connections.size) {
			const gene1: ConnectionGene = g1.connections.get(indexG1) as ConnectionGene;
			genome.connections.add(Neat.getConnection(gene1));
			indexG1++;
		}

		for (let c of genome.connections.getData()) {
			genome.nodes.add(c.from);
			genome.nodes.add(c.to);
		}

		return genome;
	}

	generateCalculator(): void {
		this._calculator = new Calculator(this);
	}

	calculate(...inputs: number[]): number[] {
		return this._calculator.calculate(...inputs);
	}

	mutate(): void {
		if (Math.random() < this.neat.PROBABILITY_MUTATE_LINK) {
			this.mutate_link();
		}
		if (Math.random() < this.neat.PROBABILITY_MUTATE_NODE) {
			this.mutate_node();
		}
		if (Math.random() < this.neat.PROBABILITY_MUTATE_WEIGHT_SHIFT) {
			this.mutate_weight_shift();
		}
		if (Math.random() < this.neat.PROBABILITY_MUTATE_WEIGHT_RANDOM) {
			this.mutate_weight_random();
		}
		if (Math.random() < this.neat.PROBABILITY_MUTATE_TOGGLE_LINK) {
			this.mutate_link_toggle();
		}

		if (this._connections.size === 0) {
			this.mutate_link();
		}
	}

	mutate_link(): void {
		const n1: NodeGene | null = this.nodes.random_element();

		for (let i = 0; i < 100; i++) {
			const n2: NodeGene | null = this.nodes.random_element();

			if (n1 !== null && n2 !== null && n1 !== n2) {
				if (n1.x === n2.x) {
					continue;
				}

				let con: ConnectionGene = n1.x < n2.x ? new ConnectionGene(0, n1, n2) : new ConnectionGene(0, n2, n1);

				if (this._connections.contains(con)) {
					continue;
				}

				con = this.neat.getConnection(con.from, con.to);
				con.weight = (Math.random() * 2 - 1) * this.neat.WEIGHT_RANDOM_STRENGTH;

				this._connections.add_sorted(con);
				return;
			}
		}
	}

	mutate_node(): void {
		const c: ConnectionGene | null = this._connections.random_element();
		if (c == null) {
			return;
		}

		const from = c.from;
		const to = c.to;
		const middle = this.neat.getNode();
		middle.x = (from.x + to.x) / 2;
		middle.y = (from.y + to.y) / 2 + (Math.random() * 2 - 1) * 0.1;

		const con1 = this.neat.getConnection(from, middle);
		const con2 = this.neat.getConnection(middle, to);

		con1.weight = 1;
		con2.weight = c.weight;
		con2.isEnabled = c.isEnabled;

		this._connections.remove(c);
		this._connections.add(con1);
		this._connections.add(con2);

		this.nodes.add(middle);
	}

	mutate_weight_shift(): void {
		const c: ConnectionGene | null = this._connections.random_element();
		if (c !== null) {
			c.weight += (Math.random() * 2 - 1) * this.neat.WEIGHT_SHIFT_STRENGTH;
		}
	}

	mutate_weight_random(): void {
		const c: ConnectionGene | null = this._connections.random_element();
		if (c !== null) {
			c.weight = (Math.random() * 2 - 1) * this.neat.WEIGHT_RANDOM_STRENGTH;
		}
	}

	mutate_link_toggle(): void {
		const c: ConnectionGene | null = this._connections.random_element();
		if (c !== null) {
			c.isEnabled = !c.isEnabled;
		}
	}

	get connections(): RandomHashSet<ConnectionGene> {
		return this._connections;
	}

	get nodes(): RandomHashSet<NodeGene> {
		return this._nodes;
	}

	get neat(): Neat {
		return this._neat;
	}
}
