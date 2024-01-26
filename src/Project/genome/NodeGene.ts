import Gene from "./Gene";

/**
 * Representa um nó genético em um genoma.
 * @extends {Gene}
 */
export default class NodeGene extends Gene {
	/** Coordenada x do nó. */
	private x: number | undefined;
	/** Coordenada y do nó. */
	private y: number | undefined;

	/**
	 * Cria uma instância de NodeGene.
	 * @param {number} innovation_number - Número de inovação do nó.
	 */
	constructor(innovation_number: number) {
		super(innovation_number);
	}

	/**
	 * Obtém a coordenada x do nó.
	 * @returns {number} A coordenada x.
	 */
	public getX(): number {
		return this.x ?? 0;
	}

	/**
	 * Define a coordenada x do nó.
	 * @param {number} x - A nova coordenada x.
	 */
	public setX(x: number | undefined): void {
		this.x = x;
	}

	/**
	 * Obtém a coordenada y do nó.
	 * @returns {number} A coordenada y.
	 */
	public getY(): number {
		return this.y ?? 0;
	}

	/**
	 * Define a coordenada y do nó.
	 * @param {number} y - A nova coordenada y.
	 */
	public setY(y: number | undefined): void {
		this.y = y;
	}

	/**
	 * Verifica se este nó é igual a outro nó.
	 * @param {Object} o - O objeto a ser comparado.
	 * @returns {boolean} true se os nós são iguais, false caso contrário.
	 */
	public equals(o: any): boolean {
		if (!(o instanceof NodeGene)) return false;
		return this.getInnovation_number() === o.getInnovation_number();
	}

	/**
	 * Obtém uma representação de string do nó para fins de depuração.
	 * @returns {string} Uma representação de string do nó.
	 */
	public toString(): string {
		return `NodeGene{innovation_number=${this.getInnovation_number()}}`;
	}

	/**
	 * Calcula o código de hash do nó.
	 * @returns {number} O código de hash.
	 */
	public hashCode(): number {
		return this.getInnovation_number();
	}
}
