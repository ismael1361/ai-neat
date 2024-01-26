/**
 * @class
 * @description Representa um gene com um número de inovação associado.
 */
export default class Gene {
	/**
	 * @type {number}
	 * @description Número de inovação associado ao gene.
	 */
	private innovation_number: number;

	/**
	 * @constructor
	 * @param {number} innovation_number - O número de inovação associado ao gene.
	 */
	constructor(innovation_number: number = 1) {
		this.innovation_number = innovation_number;
	}

	/**
	 * @returns {number}
	 * @description Obtém o número de inovação associado ao gene.
	 */
	getInnovation_number(): number {
		return this.innovation_number;
	}

	/**
	 * @param {number} innovation_number - O número de inovação a ser atribuído ao gene.
	 * @description Define o número de inovação associado ao gene.
	 */
	setInnovation_number(innovation_number: number): void {
		this.innovation_number = innovation_number;
	}
}
