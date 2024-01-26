import Gene from "./Gene";

export default class NodeGene extends Gene {
	private pos: {
		x: number;
		y: number;
	};

	constructor(innovation_number: number, x: number, y: number) {
		super(innovation_number);
		this.pos = {
			x,
			y,
		};
	}

	get x(): number {
		return this.pos.x;
	}

	get y(): number {
		return this.pos.y;
	}

	set x(x: number) {
		this.pos.x = x;
	}

	set y(y: number) {
		this.pos.y = y;
	}

	equals(other: Object): other is this {
		if (!(other instanceof NodeGene)) {
			return false;
		}
		return this.innovation === other.innovation;
	}

	get hashCode(): number {
		return this.innovation;
	}
}
