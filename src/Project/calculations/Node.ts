import type Connection from "./Connection";

/**
 * @interface
 * @description Interface para objetos comparáveis.
 */
interface Comparable<T> {
	compareTo(o: T): number;
}

/**
 * @class
 * @implements {Comparable<Node>}
 * @description Representa um nó em uma rede neural.
 */
export default class Node implements Comparable<Node> {
	/**
	 * @type {number}
	 * @description A posição x do nó.
	 */
	private x: number;

	/**
	 * @type {number}
	 * @description Saída do nó.
	 */
	private output: number = 0;

	/**
	 * @type {Array<Connection>}
	 * @description Conexões de saída do nó.
	 */
	private connections: Array<Connection> = [];

	/**
	 * @constructor
	 * @param {number} x - A posição x do nó.
	 */
	constructor(x: number) {
		this.x = x;
	}

	/**
	 * @method
	 * @description Calcula a saída do nó.
	 */
	calculate(): void {
		let s: number = 0;
		for (const c of this.connections) {
			if (c.isEnabled()) {
				s += c.getWeight() * c.getFrom().getOutput();
			}
		}
		this.output = this.activationFunction(s);
	}

	/**
	 * @private
	 * @method
	 * @param {number} x - O valor de entrada para a função de ativação.
	 * @returns {number} - O resultado da função de ativação.
	 * @description Função de ativação do nó.
	 */
	private activationFunction(x: number): number {
		return 1 / (1 + Math.exp(-x));
	}

	/**
	 * @method
	 * @param {double} x - A posição x a ser definida para o nó.
	 * @description Define a posição x para o nó.
	 */
	setX(x: number): void {
		this.x = x;
	}

	/**
	 * @method
	 * @param {number} output - O valor de saída a ser definido para o nó.
	 * @description Define o valor de saída para o nó.
	 */
	setOutput(output: number): void {
		this.output = output;
	}

	/**
	 * @method
	 * @param {Array<Connection>} connections - As conexões a serem definidas para o nó.
	 * @description Define as conexões para o nó.
	 */
	setConnections(connections: Array<Connection>): void {
		this.connections = connections;
	}

	/**
	 * @method
	 * @returns {number}
	 * @description Obtém a posição x do nó.
	 */
	getX(): number {
		return this.x;
	}

	/**
	 * @method
	 * @returns {number}
	 * @description Obtém a saída do nó.
	 */
	getOutput(): number {
		return this.output;
	}

	/**
	 * @method
	 * @returns {Array<Connection>}
	 * @description Obtém as conexões de saída do nó.
	 */
	getConnections(): Array<Connection> {
		return this.connections;
	}

	/**
	 * @method
	 * @param {Connection} connection - A conexão a ser adicionada.
	 * @description Adiciona uma conexão de saída ao nó.
	 */
	pushConnection(connection: Connection): void {
		this.connections.push(connection);
	}

	/**
	 * @method
	 * @param {Node} o - O nó a ser comparado.
	 * @returns {number}
	 * @description Compara este nó com outro nó.
	 */
	compareTo(o: Node): number {
		if (this.x > o.x) return -1;
		if (this.x < o.x) return 1;
		return 0;
	}
}
