import Client from "./Client";
import { Genome } from "../genome";

/**
 * Class representing a species in the NEAT algorithm.
 */
export default class Species {
	/**
	 * The set of clients belonging to the species.
	 * @type {Set<Client>}
	 * @private
	 */
	private clients: Set<Client> = new Set();

	/**
	 * The representative client of the species.
	 * @type {Client}
	 * @private
	 */
	private representative: Client;

	/**
	 * The score of the species.
	 * @type {number}
	 * @private
	 */
	private score: number = 0;

	/**
	 * Create a species with a representative client.
	 * @param {Client} representative - The representative client for the species.
	 */
	constructor(representative: Client) {
		this.representative = representative;
		this.representative.setSpecies(this);
		this.clients.add(representative);
	}

	/**
	 * Add a client to the species if it is within the compatibility threshold.
	 * @param {Client} client - The client to add to the species.
	 * @returns {boolean} - `true` if the client was added, `false` otherwise.
	 */
	public put(client: Client): boolean {
		if (client.distance(this.representative) < this.representative.getGenome().getNeat().CP) {
			client.setSpecies(this);
			this.clients.add(client);
			return true;
		}
		return false;
	}

	/**
	 * Forcefully add a client to the species.
	 * @param {Client} client - The client to add to the species.
	 */
	public forcePut(client: Client): void {
		client.setSpecies(this);
		this.clients.add(client);
	}

	/**
	 * Mark the species as extinct, removing all clients.
	 */
	public goExtinct(): void {
		for (const c of this.clients) {
			c.setSpecies(null);
		}
	}

	/**
	 * Evaluate the average score of the species.
	 */
	public evaluateScore(): void {
		let totalScore = 0;
		for (const c of this.clients) {
			totalScore += c.getScore();
		}
		this.score = totalScore / this.clients.size;
	}

	/**
	 * Reset the species by selecting a new representative client.
	 */
	public reset(): void {
		this.representative = this.clients.values().next().value;
		for (const c of this.clients) {
			c.setSpecies(null);
		}
		this.clients.clear();
		this.clients.add(this.representative);
		this.representative.setSpecies(this);
		this.score = 0;
	}

	/**
	 * Kill a certain percentage of the worst-performing clients in the species.
	 * @param {number} percentage - The percentage of clients to kill.
	 */
	public kill(percentage: number): void {
		const sortedClients = Array.from(this.clients).sort((a, b) => a.getScore() - b.getScore());
		const amount = percentage * this.clients.size;

		for (let i = 0; i < amount; i++) {
			sortedClients[i].setSpecies(null);
			this.clients.delete(sortedClients[i]);
		}
	}

	/**
	 * Breed two clients from the species to create a new genome.
	 * @returns {Genome} - The offspring genome.
	 */
	public breed(): Genome {
		const c1 = Array.from(this.clients)[Math.floor(Math.random() * this.clients.size)];
		const c2 = Array.from(this.clients)[Math.floor(Math.random() * this.clients.size)];

		return c1.getScore() > c2.getScore() ? Genome.crossOver(c1.getGenome(), c2.getGenome()) : Genome.crossOver(c2.getGenome(), c1.getGenome());
	}

	/**
	 * Get the size (number of clients) of the species.
	 * @returns {number} - The size of the species.
	 */
	get size(): number {
		return this.clients.size;
	}

	/**
	 * Get the set of clients belonging to the species.
	 * @returns {Set<Client>} - The set of clients.
	 */
	public getClients(): Set<Client> {
		return this.clients;
	}

	/**
	 * Get the representative client of the species.
	 * @returns {Client} - The representative client.
	 */
	public getRepresentative(): Client {
		return this.representative;
	}

	/**
	 * Get the score of the species.
	 * @returns {number} - The score of the species.
	 */
	public getScore(): number {
		return this.score;
	}
}
