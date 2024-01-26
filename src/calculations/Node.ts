import Connection from "./Connection";

export default class Node {
	private _x: number;
	private _output: number = 0;
	private _connections: Array<Connection> = [];
	private _activationFunction: (x: number) => number = (x: number) => 1 / (1 + Math.exp(-x));

	constructor(x: number) {
		this._x = x;
	}

	calculate(): void {
		let s: number = 0;
		for (const c of this._connections) {
			if (c.isEnabled) {
				s += c.weight * c.from.output;
			}
		}
		this._output = this._activationFunction(s);
	}

	set x(x: number) {
		this._x = x;
	}

	get x(): number {
		return this._x;
	}

	get output(): number {
		return this._output;
	}

	set output(output: number) {
		this._output = output;
	}

	get connections(): Array<Connection> {
		return this._connections;
	}

	set connections(connections: Array<Connection>) {
		this._connections = connections;
	}

	set activationFunction(activationFunction: (x: number) => number) {
		this._activationFunction = activationFunction;
	}

	compareTo(o: Node): number {
		if (this._x > o._x) return -1;
		if (this._x < o._x) return 1;
		return 0;
	}
}
