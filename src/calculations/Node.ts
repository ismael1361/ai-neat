import Connection from "./Connection";
const activations = {
	step: function (x: number) {
		return x >= 0 ? 1 : 0;
	},
	linear: function (x: number) {
		return x;
	},
	gaussian: function (x: number) {
		return Math.exp(-Math.pow(x, 2));
	},
	sigmoid: function (x: number) {
		return 1.0 / (1.0 + Math.exp(-x));
	},
	rational_sigmoid: function (x: number) {
		return x / (1.0 + Math.sqrt(1.0 + x * x));
	},
	tanh: function (x: number) {
		return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
	},
	relu: function (x: number) {
		return Math.max(0, x);
	},
	leaky_relu: function (x: number, alpha: number = 0.01) {
		return Math.max((alpha ?? 0.01) * x, x);
	},
	elu: function (x: number, alpha: number = 0.01) {
		return x < 0 ? (alpha ?? 0.01) * (Math.exp(x) - 1) : x;
	},
};

const activations_derivative = {
	step: function (x: number) {
		return 0;
	},
	linear: function (x: number) {
		return 1;
	},
	gaussian: function (x: number) {
		return -2.0 * x * activations.gaussian(x);
	},
	sigmoid: function (x: number) {
		return x * (1 - x);
	},
	rational_sigmoid: function (x: number) {
		var val = Math.sqrt(1.0 + x * x);
		return 1.0 / (val * (1 + val));
	},
	tanh: function (x: number) {
		return 1 - Math.pow(activations.tanh(x), 2);
	},
	relu: function (x: number) {
		return x < 0 ? 0 : 1;
	},
	leaky_relu: function (x: number, alpha: number = 0.01) {
		return x > 0 ? 1 : alpha ?? 0.01;
	},
	elu: function (x: number, alpha: number = 0.01) {
		return x <= 0 ? (alpha ?? 0.01) * Math.exp(x) : 1;
	},
};

export type ActivationFunction = keyof typeof activations;

export default class Node {
	private _innovation: number;
	private _x: number;
	private _output: number = 0;
	private _error: number = 0;
	private _delta: number = 0;
	private _connections: Array<Connection> = [];
	private _type_activation: keyof typeof activations = "sigmoid";

	constructor(innovation: number, x: number) {
		this._innovation = innovation;
		this._x = x;
	}

	calculate(): void {
		let s: number = 0;
		for (const c of this._connections) {
			if (c.isEnabled) {
				s += c.weight * c.from.output;
			}
		}
		this._output = activations[this._type_activation](s);
	}

	calculateError(target: number | undefined = undefined): void {
		for (const c of this._connections) {
			if (c.isEnabled) {
				c.from.error = 0;
				c.to.error = typeof target === "number" ? target - c.to.output : c.to.error;
				c.to.delta = c.to.error * activations_derivative[this._type_activation](c.to.output);
			}
		}

		for (const c of this._connections) {
			if (c.isEnabled) {
				c.from.error += c.to.delta * c.weight;
			}
		}
	}

	applyDelta(learningRate: number = 0.1): void {
		for (const c of this._connections) {
			if (c.isEnabled) {
				// console.log(c.from.innovation, c.to.innovation);
				// console.table([c.to.delta, c.to.error, c.from.output, c.to.output, c.weight]);
				c.weight += learningRate * c.to.delta * c.from.output;
			}
		}
	}

	get innovation(): number {
		return this._innovation;
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

	set typeActivation(type: keyof typeof activations) {
		this._type_activation = type;
	}

	set delta(delta: number) {
		this._delta = delta;
	}

	get delta(): number {
		return this._delta;
	}

	set error(error: number) {
		this._error = error;
	}

	get error(): number {
		return this._error;
	}

	compareTo(o: Node): number {
		if (this._x > o._x) return -1;
		if (this._x < o._x) return 1;
		return 0;
	}
}
