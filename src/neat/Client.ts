import { Calculator } from "../calculations";
import { Genome } from "../genome";
import Species from "./Species";

export default class Client {
	private _calculator: Calculator;

	private _genome: Genome;
	private _score: number = 0;
	private _species: Species | undefined;

	constructor(genome: Genome) {
		this._genome = genome;
		this._calculator = new Calculator(this._genome);
	}

	generateCalculator(): void {
		this._calculator = new Calculator(this._genome);
	}

	calculate(...inputs: number[]): number[] {
		return this._calculator.calculate(...inputs);
	}

	calculateError(input: number[], target: number[]): number[] {
		return this._calculator.calculateError(input, target);
	}

	backpropagation(input: number[], target: number[]): void {
		this._calculator.calculateError(input, target);
		for (const con of this._genome.connections.getData()) {
			con.weight = this._calculator.getWeightBy(con);
		}
		this.generateCalculator();
	}

	distance(other: Client): number {
		return this._genome.distance(other._genome);
	}

	mutate(): void {
		this._genome.mutate();
	}

	get genome(): Genome {
		return this._genome;
	}

	set genome(genome: Genome) {
		this._genome = genome;
	}

	get score(): number {
		return this._score;
	}

	set score(score: number) {
		this._score = score;
	}

	get species(): Species | undefined {
		return this._species;
	}

	set species(species: Species | undefined) {
		this._species = species;
	}
}
