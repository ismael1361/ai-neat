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
