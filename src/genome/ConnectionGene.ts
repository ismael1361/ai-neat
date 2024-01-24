import Gene from "./Gene";
import NodeGene from "./NodeGene";
import { Neat } from "../neat";

/**
 * Representa uma conexão genética entre dois nós em um genoma.
 * @extends {Gene}
 */
export default class ConnectionGene extends Gene {
	/** Nó de origem da conexão. */
	private from: NodeGene;
	/** Nó de destino da conexão. */
	private to: NodeGene;
	/** Peso da conexão. */
	private weight: number = Math.random() * 4 - 2;
	/** Indica se a conexão está habilitada. */
	private enabled: boolean = true;
	/** Índice de substituição usado durante a mutação. */
	private replaceIndex: number = 0;

	/**
	 * Cria uma instância de ConnectionGene.
	 * @param {NodeGene} from - Nó de origem da conexão.
	 * @param {NodeGene} to - Nó de destino da conexão.
	 */
	constructor(from: NodeGene, to: NodeGene) {
		super();
		this.from = from;
		this.to = to;
	}

	/**
	 * Obtém o nó de origem da conexão.
	 * @returns {NodeGene} O nó de origem.
	 */
	public getFrom(): NodeGene {
		return this.from;
	}

	/**
	 * Define o nó de origem da conexão.
	 * @param {NodeGene} from - O novo nó de origem.
	 */
	public setFrom(from: NodeGene): void {
		this.from = from;
	}

	/**
	 * Obtém o nó de destino da conexão.
	 * @returns {NodeGene} O nó de destino.
	 */
	public getTo(): NodeGene {
		return this.to;
	}

	/**
	 * Define o nó de destino da conexão.
	 * @param {NodeGene} to - O novo nó de destino.
	 */
	public setTo(to: NodeGene): void {
		this.to = to;
	}

	/**
	 * Obtém o peso da conexão.
	 * @returns {number} O peso da conexão.
	 */
	public getWeight(): number {
		return this.weight;
	}

	/**
	 * Define o peso da conexão.
	 * @param {number} weight - O novo peso da conexão.
	 */
	public setWeight(weight: number): void {
		this.weight = weight;
	}

	/**
	 * Verifica se a conexão está habilitada.
	 * @returns {boolean} true se a conexão estiver habilitada, false caso contrário.
	 */
	public isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Define o estado de habilitação da conexão.
	 * @param {boolean} enabled - O novo estado de habilitação.
	 */
	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	/**
	 * Verifica se esta conexão é igual a outra conexão.
	 * @param {Object} o - O objeto a ser comparado.
	 * @returns {boolean} true se as conexões são iguais, false caso contrário.
	 */
	public equals(o: any): boolean {
		if (!(o instanceof ConnectionGene)) return false;
		const c = o as ConnectionGene;
		return this.from.equals(c.from) && this.to.equals(c.to);
	}

	/**
	 * Obtém uma representação de string da conexão para fins de depuração.
	 * @returns {string} Uma representação de string da conexão.
	 */
	public toString(): string {
		return `ConnectionGene{from=${this.from.getInnovation_number()}, to=${this.to.getInnovation_number()}, weight=${this.weight}, enabled=${this.enabled}}`;
	}

	/**
	 * Calcula o código de hash da conexão.
	 * @returns {number} O código de hash.
	 */
	public hashCode(): number {
		return this.from.getInnovation_number() * Neat.MAX_NODES + this.to.getInnovation_number();
	}

	/**
	 * Obtém o índice de substituição.
	 * @returns {number} O índice de substituição.
	 */
	public getReplaceIndex(): number {
		return this.replaceIndex;
	}

	/**
	 * Define o índice de substituição.
	 * @param {number} replaceIndex - O novo índice de substituição.
	 */
	public setReplaceIndex(replaceIndex: number): void {
		this.replaceIndex = replaceIndex;
	}
}
