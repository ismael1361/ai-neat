import Gene from "../genome/Gene";

/**
 * @template T
 * @description Uma classe para representar um conjunto (set) aleatório de elementos.
 */
export default class RandomHashSet<T> {
	/**
	 * @type {Array<T>}
	 * @description A matriz que mantém a ordem dos elementos para seleção aleatória.
	 */
	private _data: Array<T>;

	/**
	 * @description Construtor para inicializar o conjunto e a matriz.
	 */
	constructor() {
		this._data = [];
	}

	/**
	 * @param {T} object - O elemento a ser verificado se está presente no conjunto.
	 * @returns {boolean} - `true` se o elemento estiver presente, `false` caso contrário.
	 * @description Verifica se o conjunto contém um determinado elemento.
	 */
	contains(object: T): boolean {
		return this._data.indexOf(object) >= 0;
	}

	/**
	 * @returns {T | null}
	 * @description Retorna um elemento aleatório do conjunto, ou `null` se o conjunto estiver vazio.
	 */
	random_element(): T | null {
		if (this._data.length > 0) {
			return this._data[Math.floor(Math.random() * this.size)];
		}
		return null;
	}

	/**
	 * @returns {number}
	 * @description Retorna o número de elementos no conjunto.
	 */
	get size(): number {
		return this._data.length;
	}

	/**
	 * @param {T} object - O elemento a ser adicionado ao conjunto.
	 * @description Adiciona um elemento ao conjunto, se ainda não estiver presente.
	 */
	add(object: T): void {
		if (!this.contains(object)) {
			this._data.push(object);
		}
	}

	/**
	 * @param {T} object - O elemento a ser adicionado e ordenado no conjunto.
	 * @description Adiciona um elemento ao conjunto mantendo a ordem com base em uma propriedade específica (para objetos Gene).
	 */
	add_sorted(object: T): void {
		if (object instanceof Gene) {
			for (let i = 0; i < this.size; i++) {
				if (this._data[i] instanceof Gene) {
					const innovation = (this._data[i] as Gene).innovation;
					if (object.innovation < innovation) {
						this._data.splice(i, 0, object);
						return;
					}
				}
			}
		}
		this._data.push(object);
	}

	/**
	 * @description Limpa o conjunto, removendo todos os elementos.
	 */
	clear(): void {
		this._data = [];
	}

	/**
	 * @param {number} index - O índice do elemento a ser recuperado.
	 * @returns {T | null} - O elemento no índice fornecido, ou `null` se o índice estiver fora dos limites.
	 */
	get(index: number): T | null {
		if (index < 0 || index >= this.size) return null;
		return this._data[index];
	}

	/**
	 * @param {number | T} index - O índice ou o elemento a ser removido.
	 * @description Remove um elemento com base no índice ou no próprio elemento.
	 */
	remove(index: number | T): void {
		if (typeof index === "number") {
			if (index < 0 || index >= this.size) return;
			this._data.splice(index, 1);
		} else {
			this._data = this._data.filter((item) => item !== index);
		}
	}

	/**
	 * @returns {Array<T>}
	 * @description Retorna a matriz de dados (data).
	 */
	getData(): Array<T> {
		return this._data;
	}

	get data(): Array<T> {
		return this._data;
	}
}
