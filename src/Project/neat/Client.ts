import { Calculator } from "../calculations";
import { Genome } from "../genome";
import Species from "./Species";

/**
 * Class representing a client in the NEAT algorithm.
 */
export default class Client {
	/**
	 * The calculator associated with the client's genome.
	 * @type {Calculator | undefined}
	 * @private
	 */
	private calculator?: Calculator;

	/**
	 * The genome of the client.
	 * @type {Genome}
	 * @private
	 */
	private genome: Genome;

	/**
	 * The score of the client.
	 * @type {number}
	 * @private
	 */
	private score: number = 0;

	/**
	 * The species to which the client belongs.
	 * @type {Species | undefined}
	 * @private
	 */
	private species?: Species;

	constructor(genome: Genome) {
		this.genome = genome;
	}

	/**
	 * Generate a calculator for the client's genome.
	 */
	public generateCalculator(): void {
		this.calculator = new Calculator(this.genome);
	}

	/**
	 * Calculate the output for the given input using the client's genome.
	 * @param {...number} input - The input values.
	 * @returns {number[]} - The calculated output values.
	 */
	public calculate(...input: number[]): number[] {
		if (!(this.calculator instanceof Calculator)) this.generateCalculator();
		return (this.calculator as Calculator).calculate(...input);
	}

	/**
	 * Calculate the genetic distance between this client and another client.
	 * @param {Client} other - The other client for distance calculation.
	 * @returns {number} - The genetic distance between the two clients' genomes.
	 */
	public distance(other: Client): number {
		return this.genome.distance(other.genome);
	}

	/**
	 * Mutate the client's genome.
	 */
	public mutate(): void {
		this.genome.mutate();
	}

	/**
	 * Get the calculator associated with the client.
	 * @returns {Calculator | undefined} - The calculator object.
	 */
	public getCalculator(): Calculator | undefined {
		return this.calculator;
	}

	/**
	 * Get the genome of the client.
	 * @returns {Genome} - The genome object.
	 */
	public getGenome(): Genome {
		return this.genome;
	}

	/**
	 * Set the genome for the client.
	 * @param {Genome} genome - The new genome for the client.
	 */
	public setGenome(genome: Genome): void {
		this.genome = genome;
	}

	/**
	 * Get the score of the client.
	 * @returns {number} - The score value.
	 */
	public getScore(): number {
		return this.score;
	}

	/**
	 * Set the score for the client.
	 * @param {number} score - The new score for the client.
	 */
	public setScore(score: number): void {
		this.score = score;
	}

	/**
	 * Get the species to which the client belongs.
	 * @returns {Species | undefined} - The species object.
	 */
	public getSpecies(): Species | undefined {
		return this.species;
	}

	/**
	 * Set the species for the client.
	 * @param {Specie|null} species - The new species for the client.
	 */
	public setSpecies(species: Species | null): void {
		this.species = species ?? undefined;
	}
}
