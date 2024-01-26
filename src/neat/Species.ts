import { RandomHashSet } from "../data_structures";
import { Genome } from "../genome";
import Client from "./Client";

export default class Species {
	private _clients: RandomHashSet<Client> = new RandomHashSet<Client>();
	private _representative: Client;
	private _score: number = 0;

	constructor(representative: Client) {
		this._representative = representative;
		this._representative.species = this;
		this._clients.add(this._representative);
	}

	put(client: Client): boolean {
		if (client.distance(this._representative) < this._representative.genome.neat.CP) {
			client.species = this;
			this._clients.add(client);
			return true;
		}
		return false;
	}

	forcePut(client: Client): void {
		client.species = this;
		this._clients.add(client);
	}

	goExtinct(): void {
		for (const client of this._clients.getData()) {
			client.species = undefined;
		}
	}

	evaluate(): void {
		this._score = 0;
		for (const client of this._clients.getData()) {
			this._score += client.score;
		}
		this._score /= this._clients.size;
	}

	reset(): void {
		this._representative = this._clients.random_element() as Client;
		for (const client of this._clients.getData()) {
			client.species = undefined;
		}
		this._clients.clear();
		this._representative.species = this;
		this._clients.add(this._representative);
		this._score = 0;
	}

	kill(percentage: number): void {
		this._clients.getData().sort((a, b) => a.score - b.score);

		const amount = percentage * this.clients.size;

		for (let i = 0; i < amount; i++) {
			(this._clients.get(0) as Client).species = undefined;
			this._clients.remove(this._clients.get(0) as Client);
		}
	}

	breed(): Genome {
		const parent1: Client = this._clients.random_element() as Client;
		const parent2: Client = this._clients.random_element() as Client;

		if (parent1.score > parent2.score) return Genome.crossover(parent1.genome, parent2.genome);
		return Genome.crossover(parent2.genome, parent1.genome);
	}

	get size(): number {
		return this._clients.size;
	}

	get clients(): RandomHashSet<Client> {
		return this._clients;
	}

	get score(): number {
		return this._score;
	}
}
