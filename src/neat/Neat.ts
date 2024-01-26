import { RandomHashSet, RandomSelector } from "../data_structures";
import { ConnectionGene, Genome, NodeGene } from "../genome";
import Client from "./Client";
import Species from "./Species";

export default class Neat {
	static MAX_NODES: number = Math.pow(2, 16);

	private all_connections: Map<number, ConnectionGene> = new Map<number, ConnectionGene>();
	private all_nodes: RandomHashSet<NodeGene> = new RandomHashSet<NodeGene>();

	private input_size: number;
	private output_size: number;
	private max_population_size: number;

	public WEIGHT_SHIFT_STRENGTH: number = 0.3;
	public WEIGHT_RANDOM_STRENGTH: number = 1;

	public SURVIVORS: number = 0.4;

	public PROBABILITY_MUTATE_LINK: number = 0.01;
	public PROBABILITY_MUTATE_NODE: number = 0.01;
	public PROBABILITY_MUTATE_WEIGHT_SHIFT: number = 0.2;
	public PROBABILITY_MUTATE_WEIGHT_RANDOM: number = 0.02;
	public PROBABILITY_MUTATE_TOGGLE_LINK: number = 0.1;

	public coefficients: {
		c1: number;
		c2: number;
		c3: number;
	} = {
		c1: 1,
		c2: 1,
		c3: 1,
	};

	public CP: number = 20;

	private _clients: RandomHashSet<Client> = new RandomHashSet<Client>();
	private _species: RandomHashSet<Species> = new RandomHashSet<Species>();

	constructor(input_size: number, output_size: number, population_size: number = 100) {
		this.input_size = input_size;
		this.output_size = output_size;
		this.max_population_size = population_size;
		this.reset(input_size, output_size, population_size);
	}

	empty_genome(): Genome {
		const g: Genome = new Genome(this);
		for (let i = 0; i < this.input_size + this.output_size; i++) {
			const n = this.getNode(i + 1);
			g.nodes.add(n);
		}
		return g;
	}

	reset(input_size: number, output_size: number, population_size: number = 100): void {
		this.input_size = input_size;
		this.output_size = output_size;
		this.max_population_size = population_size;

		this.all_connections.clear();
		this.all_nodes.clear();
		this._clients.clear();

		for (let i = 0; i < input_size; i++) {
			const n = this.getNode();
			n.x = 0.1;
			n.y = (i + 1) / (input_size + 1);
		}

		for (let i = 0; i < output_size; i++) {
			const n = this.getNode();
			n.x = 0.9;
			n.y = (i + 1) / (output_size + 1);
		}

		for (let i = 0; i < population_size; i++) {
			const c = new Client(this.empty_genome());
			c.mutate();
			c.generateCalculator();
			this._clients.add(c);
		}
	}

	getClient(index?: number): Client | null {
		return typeof index === "number" ? this._clients.get(index) : this._clients.data.sort((a, b) => b.score - a.score)[0];
	}

	static getConnection(con: ConnectionGene) {
		const c: ConnectionGene = new ConnectionGene(con.innovation, con.from, con.to);
		c.weight = con.weight;
		c.isEnabled = con.isEnabled;
		return c;
	}

	containsConnection(con: ConnectionGene): boolean {
		for (let c of this.all_connections.values()) {
			if (c.equals(con)) {
				return true;
			}
		}

		return false;
	}

	getConnection(node1: NodeGene, node2: NodeGene): ConnectionGene {
		const connectionGene: ConnectionGene = new ConnectionGene(this.all_connections.size + 1, node1, node2);

		if (this.all_connections.has(connectionGene.hashCode)) {
			connectionGene.innovation = this.all_connections.get(connectionGene.hashCode)!.innovation;
		} else {
			this.all_connections.set(connectionGene.hashCode, connectionGene);
		}

		return connectionGene;
	}

	getNode(id?: number): NodeGene {
		if (typeof id === "number" && id <= this.all_nodes.size) {
			return this.all_nodes.get(id - 1) as NodeGene;
		}

		const n = new NodeGene(this.all_nodes.size + 1, 0, 0);
		this.all_nodes.add(n);
		return n;
	}

	evolve(): void {
		this.genSpecies();
		this.kill();
		this.removeExtinctSpecies();
		this.reproduce();
		this.mutate();
		for (const client of this._clients.getData()) {
			client.generateCalculator();
		}
	}

	genSpecies(): void {
		for (let s of this._species.getData()) {
			s.reset();
		}

		for (const client of this._clients.getData()) {
			if (client.species !== undefined && client.species !== null) {
				continue;
			}
			let found = false;
			for (const species of this._species.getData()) {
				if (species.put(client)) {
					found = true;
					break;
				}
			}
			if (!found) {
				this._species.add(new Species(client));
			}
		}

		for (const species of this._species.getData()) {
			species.evaluate();
		}
	}

	kill(): void {
		for (const species of this._species.getData()) {
			species.kill(1 - this.SURVIVORS);
		}
	}

	removeExtinctSpecies(): void {
		for (let i = this._species.size - 1; i >= 0; i--) {
			if ((this._species.get(i) as Species).size <= 1) {
				(this._species.get(i) as Species).goExtinct();
				this._species.remove(i);
			}
		}
	}

	reproduce(): void {
		const selector: RandomSelector<Species> = new RandomSelector<Species>();

		for (const species of this._species.getData()) {
			selector.add(species, species.score);
		}

		for (let c of this._clients.getData()) {
			if (!c.species) {
				const s = selector.random() || undefined;
				if (s) {
					c.species = s;
					c.genome = s.breed();
					s.forcePut(c);
				}
			}
		}
	}

	mutate(): void {
		for (const client of this._clients.getData()) {
			client.mutate();
		}
	}

	printSpeacies(): void {
		console.log("##########################################");
		let i = 0;
		for (const s of this._species.getData()) {
			const minNodes = s.clients
				.getData()
				.reduce((min, c) => (c.genome.nodes.size === 0 ? min : Math.min(min, c.genome.nodes.size)), s.clients.getData().find((c) => c.genome.nodes.size > 0)?.genome.nodes.size || 0);
			const maxNodes = s.clients.getData().reduce((max, c) => Math.max(max, c.genome.nodes.size), 0);

			const minConnections = s.clients
				.getData()
				.reduce(
					(min, c) => (c.genome.connections.size === 0 ? min : Math.min(min, c.genome.connections.size)),
					s.clients.getData().find((c) => c.genome.connections.size > 0)?.genome.connections.size || 0,
				);
			const maxConnections = s.clients.getData().reduce((max, c) => Math.max(max, c.genome.connections.size), 0);

			console.log(`[${i}]-> ${s.score} ${s.size} ${minNodes}-${maxNodes} ${minConnections}-${maxConnections}`);
			i++;
		}
	}

	train(inputs: number[][], outputs: number[][], iterations: number = 100): void {
		for (let i = 0; i < iterations; i++) {
			for (let c of this._clients.getData()) {
				let mae = 0;

				for (let j = 0; j < inputs.length; j++) {
					const input = inputs[j];
					const output = outputs[j];
					const result = c.calculate(...input);

					mae +=
						result.reduce((sum, r, index) => {
							r = r === 0 ? 1 : r;
							return sum + output[index] / r;
						}, 0) / result.length;
				}

				c.score = 1 - mae / inputs.length;
			}

			this.evolve();
			this.printSpeacies();
		}
	}

	get C1(): number {
		return this.coefficients.c1;
	}

	get C2(): number {
		return this.coefficients.c2;
	}

	get C3(): number {
		return this.coefficients.c3;
	}

	get clients(): RandomHashSet<Client> {
		return this._clients;
	}
}
