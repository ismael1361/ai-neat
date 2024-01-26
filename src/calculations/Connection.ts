import Node from "./Node";

export default class Connection {
	private _from: Node;
	private _to: Node;

	private _weight: number = 0;
	private _enabled: boolean = true;

	constructor(from: Node, to: Node) {
		this._from = from;
		this._to = to;
	}

	get from(): Node {
		return this._from;
	}

	set from(from: Node) {
		this._from = from;
	}

	get to(): Node {
		return this._to;
	}

	set to(to: Node) {
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
}
