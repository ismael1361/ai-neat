import Neat from "../neat/Neat";
import Gene from "./Gene";
import NodeGene from "./NodeGene";

export default class ConnectionGene extends Gene {
	private _from: NodeGene;
	private _to: NodeGene;

	private _weight: number = 0;
	private _enabled: boolean = true;

	constructor(innovation_number: number, from: NodeGene, to: NodeGene) {
		super(innovation_number);
		this._from = from;
		this._to = to;
	}

	get from(): NodeGene {
		return this._from;
	}

	set from(from: NodeGene) {
		this._from = from;
	}

	get to(): NodeGene {
		return this._to;
	}

	set to(to: NodeGene) {
		this._to = to;
	}

	get weight(): number {
		return this._weight;
	}

	set weight(weight: number) {
		this._weight = weight;
	}

	get isEnabled(): boolean {
		return this._enabled;
	}

	set isEnabled(enabled: boolean) {
		this._enabled = enabled;
	}

	equals(other: Object): other is this {
		if (!(other instanceof ConnectionGene)) {
			return false;
		}
		return this.from.equals(other.from) && this.to.equals(other.to);
	}

	get hashCode(): number {
		return this.from.hashCode * Neat.MAX_NODES + this.to.hashCode;
	}
}
