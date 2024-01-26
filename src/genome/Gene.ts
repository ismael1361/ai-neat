export default class Gene {
	protected _innovation_number: number;

	constructor(innovation_number: number) {
		this._innovation_number = innovation_number;
	}

	get innovation(): number {
		return this._innovation_number;
	}

	set innovation(innovation_number: number) {
		this._innovation_number = innovation_number;
	}
}
