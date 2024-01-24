import { RandomSelector } from "../data_structures";
import ConnectionGene from "../genome/ConnectionGene";
import Genome from "../genome/Genome";
import NodeGene from "../genome/NodeGene";
import Client from "./Client";
import Species from "./Species";

/**
 * Class representing the NEAT (NeuroEvolution of Augmenting Topologies) algorithm.
 */
export default class Neat {
	/**
	 * The maximum number of nodes.
	 * @type {number}
	 */
	public static MAX_NODES: number = Math.pow(2, 20);

	/**
	 * Coefficient for adjusting disjoint genes in the distance calculation.
	 * @type {number}
	 * @readonly
	 */
	readonly C1: number = 1;

	/**
	 * Coefficient for adjusting excess genes in the distance calculation.
	 * @type {number}
	 * @readonly
	 */
	readonly C2: number = 1;

	/**
	 * Coefficient for adjusting the average weight differences in the distance calculation.
	 * @type {number}
	 * @readonly
	 */
	readonly C3: number = 1;

	/**
	 * Threshold for speciation in the genetic algorithm.
	 * @type {number}
	 * @readonly
	 */
	readonly CP: number = 4;

	/**
	 * Strength of weight shift mutation.
	 * @type {number}
	 * @readonly
	 */
	readonly WEIGHT_SHIFT_STRENGTH: number = 0.3;

	/**
	 * Strength of weight random mutation.
	 * @type {number}
	 * @readonly
	 */
	readonly WEIGHT_RANDOM_STRENGTH: number = 1;

	/**
	 * Percentage of top-performing genomes to survive to the next generation.
	 * @type {number}
	 * @readonly
	 */
	readonly SURVIVORS: number = 0.8;

	/**
	 * Probability of mutating a link (connection) in the genetic algorithm.
	 * @type {number}
	 * @readonly
	 */
	readonly PROBABILITY_MUTATE_LINK: number = 0.01;

	/**
	 * Probability of mutating a node in the genetic algorithm.
	 * @type {number}
	 * @readonly
	 */
	readonly PROBABILITY_MUTATE_NODE: number = 0.1;

	/**
	 * Probability of mutating the weight shift in the genetic algorithm.
	 * @type {number}
	 * @readonly
	 */
	readonly PROBABILITY_MUTATE_WEIGHT_SHIFT: number = 0.02;

	/**
	 * Probability of mutating the weight randomly in the genetic algorithm.
	 * @type {number}
	 * @readonly
	 */
	readonly PROBABILITY_MUTATE_WEIGHT_RANDOM: number = 0.02;

	/**
	 * Probability of toggling a link (connection) in the genetic algorithm.
	 * @type {number}
	 * @readonly
	 */
	readonly PROBABILITY_MUTATE_TOGGLE_LINK: number = 0;

	/**
	 * Map of all connections in the NEAT algorithm.
	 * @type {Map<ConnectionGene, ConnectionGene>}
	 * @private
	 */
	private all_connections: Map<ConnectionGene, ConnectionGene> = new Map();

	/**
	 * Set of all nodes in the NEAT algorithm.
	 * @type {Set<NodeGene>}
	 * @private
	 */
	private all_nodes: Set<NodeGene> = new Set();

	/**
	 * Set of all clients in the NEAT algorithm.
	 * @type {Set<Client>}
	 * @private
	 */
	private clients: Set<Client> = new Set();

	/**
	 * Set of all species in the NEAT algorithm.
	 * @type {Set<Species>}
	 * @private
	 */
	private species: Set<Species> = new Set();

	/**
	 * Maximum number of clients in the NEAT algorithm.
	 * @type {number}
	 * @private
	 */
	private max_clients: number = 100;

	/**
	 * Number of output nodes in the NEAT algorithm.
	 * @type {number}
	 * @private
	 */
	private output_size: number = 0;

	/**
	 * Number of input nodes in the NEAT algorithm.
	 * @type {number}
	 * @private
	 */
	private input_size: number = 0;

	/**
	 * Create a NEAT instance.
	 * @param {number} input_size - The number of input nodes.
	 * @param {number} output_size - The number of output nodes.
	 * @param {number} clients - The number of clients.
	 */
	constructor(input_size: number, output_size: number, clients: number) {
		this.reset(input_size, output_size, clients);
	}

	/**
	 * Generate an empty genome.
	 * @returns {Genome} - The generated genome.
	 */
	public emptyGenome(): Genome {
		const g: Genome = new Genome(this);
		for (let i = 0; i < this.input_size + this.output_size; i++) {
			const x = i < this.input_size ? 0.1 : 0.9;
			const y = (i + 1) / ((i < this.input_size ? this.input_size : this.output_size) + 1);
			g.getNodes().add(this.getNode(x, y, i + 1));
		}
		return g;
	}

	/**
	 * Reset NEAT with new parameters.
	 * @param {number} input_size - The number of input nodes.
	 * @param {number} output_size - The number of output nodes.
	 * @param {number} clients - The number of clients.
	 */
	public reset(input_size: number, output_size: number, clients: number): void {
		this.input_size = input_size;
		this.output_size = output_size;
		this.max_clients = clients;

		this.all_connections.clear();
		this.all_nodes.clear();
		this.clients.clear();

		for (let i = 0; i < input_size; i++) {
			this.getNode(0.1, (i + 1) / (input_size + 1));
		}

		for (let i = 0; i < output_size; i++) {
			this.getNode(0.9, (i + 1) / (output_size + 1));
		}

		for (let i = 0; i < this.max_clients; i++) {
			const c: Client = new Client(this.emptyGenome());
			c.generateCalculator();
			this.clients.add(c);
		}
	}

	/**
	 * Get a client by index.
	 * @param {number} index - The index of the client.
	 * @returns {Client | undefined} - The client object.
	 */
	public getClient(index: number): Client | undefined {
		const clientsArray: Client[] = Array.from(this.clients);
		return clientsArray[index];
	}

	/**
	 * Creates a new ConnectionGene instance based on an existing one.
	 * @param {ConnectionGene} con - The existing connection gene.
	 * @returns {ConnectionGene} A new connection gene instance.
	 */
	public static getConnection(con: ConnectionGene): ConnectionGene {
		const c: ConnectionGene = new ConnectionGene(con.getFrom(), con.getTo());
		c.setInnovation_number(con.getInnovation_number());
		c.setWeight(con.getWeight());
		c.setEnabled(con.isEnabled());
		return c;
	}

	/**
	 * Gets or creates a connection gene between two nodes.
	 * @param {NodeGene} node1 - The first node.
	 * @param {NodeGene} node2 - The second node.
	 * @returns {ConnectionGene} The connection gene between the nodes.
	 */
	public getConnection(node1: NodeGene, node2: NodeGene): ConnectionGene {
		const connectionGene: ConnectionGene = new ConnectionGene(node1, node2);

		if (this.all_connections.has(connectionGene)) {
			connectionGene.setInnovation_number((this.all_connections.get(connectionGene) as ConnectionGene).getInnovation_number());
		} else {
			connectionGene.setInnovation_number(this.all_connections.size + 1);
			this.all_connections.set(connectionGene, connectionGene);
		}

		return connectionGene;
	}

	/**
	 * Sets the replacement index for a connection gene between two nodes.
	 * @param {NodeGene} node1 - The first node.
	 * @param {NodeGene} node2 - The second node.
	 * @param {number} index - The replacement index to be set.
	 */
	public setReplaceIndex(node1: NodeGene, node2: NodeGene, index: number): void {
		this.all_connections.get(new ConnectionGene(node1, node2))?.setReplaceIndex(index);
	}

	/**
	 * Gets the replacement index for a connection gene between two nodes.
	 * @param {NodeGene} node1 - The first node.
	 * @param {NodeGene} node2 - The second node.
	 * @returns {number} The replacement index, or 0 if not found.
	 */
	public getReplaceIndex(node1: NodeGene, node2: NodeGene): number {
		const con: ConnectionGene = new ConnectionGene(node1, node2);
		const data: ConnectionGene | undefined = this.all_connections.get(con);
		if (!data) return 0;
		return data.getReplaceIndex();
	}

	public getNode(x: number | null, y: number | null, innovation_number?: number): NodeGene {
		const node: NodeGene = new NodeGene(innovation_number || this.all_nodes.size + 1);
		node.setX(x ?? undefined);
		node.setY(y ?? undefined);
		this.all_nodes.add(node);
		return node;
	}

	/**
	 * Evolve the NEAT algorithm by generating species, removing weak individuals, reproducing, mutating, and regenerating calculators.
	 */
	public evolve(): void {
		this.generateSpecies();
		this.kill();
		this.removeExtinctSpecies();
		this.reproduce();
		this.mutate();
		for (const c of this.clients.values()) {
			c.generateCalculator();
		}
	}

	/**
	 * Print information about each species, including its score and size.
	 */
	public printSpecies(): void {
		console.log("##########################################");
		for (const s of this.species.values()) {
			console.log(`${s}  ${s.getScore()}  ${s.size}`);
		}
	}

	private reproduce(): void {
		const selector: RandomSelector<Species> = new RandomSelector<Species>();
		for (const s of this.species.values()) {
			selector.add(s, s.getScore());
		}

		for (const c of this.clients.values()) {
			if (c.getSpecies() === null) {
				const s: Species | null = selector.random();
				if (s instanceof Species) {
					c.setGenome(s.breed());
					s.forcePut(c);
				}
			}
		}
	}

	/**
	 * Perform mutation on each client in the NEAT algorithm.
	 */
	public mutate(): void {
		for (const c of this.clients.values()) {
			c.mutate();
		}
	}

	private removeExtinctSpecies(): void {
		for (let i = this.species.size - 1; i >= 0; i--) {
			if (this.species[i].size <= 1) {
				this.species[i].goExtinct();
				this.species.delete(this.species[i]);
			}
		}
	}

	private generateSpecies(): void {
		for (const s of this.species.values()) {
			s.reset();
		}

		for (const c of this.clients.values()) {
			if (c.getSpecies() !== null) continue;

			let found = false;
			for (const s of this.species.values()) {
				if (s.put(c)) {
					found = true;
					break;
				}
			}
			if (!found) {
				this.species.add(new Species(c));
			}
		}

		for (const s of this.species.values()) {
			s.evaluateScore();
		}
	}

	/**
	 * Eliminate weak individuals in each species based on the survival rate.
	 */
	private kill(): void {
		for (const s of this.species.values()) {
			s.kill(1 - this.SURVIVORS);
		}
	}

	/**
	 * Main method to run the NEAT algorithm.
	 */
	public static main(): void {
		const neat: Neat = new Neat(10, 1, 1000);

		const inValues: number[] = new Array(10).fill(0).map(() => Math.random());

		for (let i = 0; i < 100; i++) {
			for (const c of neat.clients.values()) {
				const score: number = c.calculate(...inValues)[0];
				c.setScore(score);
			}
			neat.evolve();
			// neat.printSpecies();
		}

		// for (const c of neat.clients.values()) {
		// 	for (const g of c.getGenome().getConnections().getData()) {
		// 		console.log(g.getInnovation_number(), g.toString());
		// 	}
		// }

		console.log(neat.all_nodes.values());
	}

	public getOutput_size(): number {
		return this.output_size;
	}

	public getInput_size(): number {
		return this.input_size;
	}
}
