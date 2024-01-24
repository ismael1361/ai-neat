/**
 * @template T
 * @description Uma classe para seleção aleatória de elementos com base em pontuações.
 */
export default class RandomSelector<T> {
	private objects: T[] = [];
	private scores: number[] = [];
	private total_score: number = 0;

	/**
	 * @param {T} element - O elemento a ser adicionado à seleção aleatória.
	 * @param {number} score - A pontuação associada ao elemento.
	 * @description Adiciona um elemento à seleção aleatória com uma pontuação específica.
	 */
	add(element: T, score: number): void {
		this.objects.push(element);
		this.scores.push(score);
		this.total_score += score;
	}

	/**
	 * @returns {T | null}
	 * @description Retorna um elemento aleatório com base nas pontuações associadas.
	 */
	random(): T | null {
		const v = Math.random() * this.total_score;
		let c = 0;

		for (let i = 0; i < this.objects.length; i++) {
			c += this.scores[i];
			if (c >= v) {
				return this.objects[i];
			}
		}

		return null;
	}

	/**
	 * @description Limpa a seleção aleatória, removendo todos os elementos e pontuações.
	 */
	reset(): void {
		this.objects = [];
		this.scores = [];
		this.total_score = 0;
	}
}
