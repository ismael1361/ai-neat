import type Node from "./Node";

/**
 * @class
 * @description Representa uma conexão entre dois nós em uma rede neural.
 */
export default class Connection {
	/**
	 * @type {Node}
	 * @description O nó de origem da conexão.
	 */
	private from: Node;

	/**
	 * @type {Node}
	 * @description O nó de destino da conexão.
	 */
	private to: Node;

	/**
	 * @type {number}
	 * @description O peso da conexão.
	 */
	private weight: number = Math.random() * 2 - 1;

	/**
	 * @type {boolean}
	 * @description Indica se a conexão está habilitada.
	 */
	private enabled: boolean = true;

	/**
	 * @constructor
	 * @param {Node} from - O nó de origem da conexão.
	 * @param {Node} to - O nó de destino da conexão.
	 */
	constructor(from: Node, to: Node) {
		this.from = from;
		this.to = to;
	}

	/**
	 * @method
	 * @returns {Node}
	 * @description Obtém o nó de origem da conexão.
	 */
	getFrom(): Node {
		return this.from;
	}

	/**
	 * @method
	 * @param {Node} from - Define o nó de origem da conexão.
	 */
	setFrom(from: Node): void {
		this.from = from;
	}

	/**
	 * @method
	 * @returns {Node}
	 * @description Obtém o nó de destino da conexão.
	 */
	getTo(): Node {
		return this.to;
	}

	/**
	 * @method
	 * @param {Node} to - Define o nó de destino da conexão.
	 */
	setTo(to: Node): void {
		this.to = to;
	}

	/**
	 * @method
	 * @returns {number}
	 * @description Obtém o peso da conexão.
	 */
	getWeight(): number {
		return this.weight;
	}

	/**
	 * @method
	 * @param {number} weight - Define o peso da conexão.
	 */
	setWeight(weight: number): void {
		this.weight = weight;
	}

	/**
	 * @method
	 * @returns {boolean}
	 * @description Verifica se a conexão está habilitada.
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * @method
	 * @param {boolean} enabled - Define se a conexão está habilitada.
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}
}
