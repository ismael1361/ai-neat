import { Neat } from "../neat";
import ConnectionGene from "./ConnectionGene";
import NodeGene from "./NodeGene";
import { RandomHashSet } from "../data_structures";

export default class Genome {
	private connections: RandomHashSet<ConnectionGene>;
	private nodes: RandomHashSet<NodeGene>;
	private neat: Neat;

	constructor(neat: Neat) {
		this.connections = new RandomHashSet<ConnectionGene>();
		this.nodes = new RandomHashSet<NodeGene>();
		this.neat = neat;
	}

	/**
	 * Calcula a distância entre dois genomas.
	 * - g1 deve ter o maior número de inovação!
	 *
	 * @param g2 - O segundo genoma para calcular a distância.
	 * @returns A distância entre os genomas.
	 */
	public distance(g2: Genome): number {
		let g1: Genome = this;
		let highestInnovationGene1: number = 0;

		if (g1.getConnections().size !== 0) {
			highestInnovationGene1 = (g1.getConnections().get(g1.getConnections().size - 1) as ConnectionGene).getInnovation_number();
		}

		let highestInnovationGene2: number = 0;

		if (g2.getConnections().size !== 0) {
			highestInnovationGene2 = (g2.getConnections().get(g2.getConnections().size - 1) as ConnectionGene).getInnovation_number();
		}

		if (highestInnovationGene1 < highestInnovationGene2) {
			// Troca os genomas se g1 não tiver a maior inovação
			let temp: Genome = g1;
			g1 = g2;
			g2 = temp;
		}

		let indexG1: number = 0;
		let indexG2: number = 0;

		let disjoint: number = 0;
		let excess: number = 0;
		let weightDiff: number = 0;
		let similar: number = 0;

		while (indexG1 < g1.getConnections().size && indexG2 < g2.getConnections().size) {
			const gene1: ConnectionGene | null = g1.getConnections().get(indexG1);
			const gene2: ConnectionGene | null = g2.getConnections().get(indexG2);

			const in1: number = gene1?.getInnovation_number() ?? 0;
			const in2: number = gene2?.getInnovation_number() ?? 0;

			if (in1 === in2 && gene1 && gene2) {
				// Gene similar
				similar++;
				weightDiff += Math.abs(gene1.getWeight() - gene2.getWeight());
				indexG1++;
				indexG2++;
			} else if (in1 > in2) {
				// Gene disjoint de b
				disjoint++;
				indexG2++;
			} else {
				// Gene disjoint de a
				disjoint++;
				indexG1++;
			}
		}

		weightDiff /= Math.max(1, similar);
		excess = g1.getConnections().size - indexG1;

		let N: number = Math.max(g1.getConnections().size, g2.getConnections().size);
		if (N < 20) {
			N = 1;
		}

		return (this.neat.C1 * disjoint) / N + (this.neat.C2 * excess) / N + this.neat.C3 * weightDiff;
	}

	/**
	 * Cria um novo genoma resultante da combinação de dois genomas.
	 * g1 deve ter a pontuação mais alta.
	 * - Leva todos os genes de a
	 * - Se houver um gene em a que também está em b, escolhe aleatoriamente
	 * - Não leva genes disjoint de b
	 * - Leva genes excess de a, se existirem
	 *
	 * @param g1 - O primeiro genoma para a cruzada.
	 * @param g2 - O segundo genoma para a cruzada.
	 * @returns O novo genoma resultante da cruzada.
	 */
	public static crossOver(g1: Genome, g2: Genome): Genome {
		const neat: Neat = g1.getNeat();
		const genome: Genome = neat.emptyGenome();

		let indexG1: number = 0;
		let indexG2: number = 0;

		while (indexG1 < g1.getConnections().size && indexG2 < g2.getConnections().size) {
			const gene1: ConnectionGene = g1.getConnections().get(indexG1) as any;
			const gene2: ConnectionGene = g2.getConnections().get(indexG2) as any;

			const in1: number = gene1?.getInnovation_number();
			const in2: number = gene2?.getInnovation_number();

			if (in1 === in2 && gene1 && gene2) {
				// Gene similar
				if (Math.random() > 0.5) {
					genome.getConnections().add(Neat.getConnection(gene1));
				} else {
					genome.getConnections().add(Neat.getConnection(gene2));
				}
				indexG1++;
				indexG2++;
			} else if (in1 > in2) {
				// Gene disjoint de b
				indexG2++;
			} else {
				// Gene disjoint de a
				genome.getConnections().add(Neat.getConnection(gene1));
				indexG1++;
			}
		}

		while (indexG1 < g1.getConnections().size) {
			const gene1: ConnectionGene = g1.getConnections().get(indexG1) as any;
			genome.getConnections().add(Neat.getConnection(gene1));
			indexG1++;
		}

		for (const c of genome.getConnections().getData()) {
			genome.getNodes().add(c.getFrom());
			genome.getNodes().add(c.getTo());
		}

		return genome;
	}

	/**
	 * Realiza a mutação no genoma.
	 */
	public mutate(): void {
		if (this.neat.PROBABILITY_MUTATE_LINK > Math.random()) {
			this.mutate_link();
		}
		if (this.neat.PROBABILITY_MUTATE_NODE > Math.random()) {
			this.mutate_node();
		}
		if (this.neat.PROBABILITY_MUTATE_WEIGHT_SHIFT > Math.random()) {
			this.mutate_weight_shift();
		}
		if (this.neat.PROBABILITY_MUTATE_WEIGHT_RANDOM > Math.random()) {
			this.mutate_weight_random();
		}
		if (this.neat.PROBABILITY_MUTATE_TOGGLE_LINK > Math.random()) {
			this.mutate_link_toggle();
		}
	}

	/**
	 * Mutação de link no genoma.
	 * Adiciona uma nova conexão entre dois nós aleatórios.
	 */
	public mutate_link(): void {
		for (let i = 0; i < 100; i++) {
			const a: NodeGene | null = this.nodes.random_element();
			const b: NodeGene | null = this.nodes.random_element();

			if (!a || !b) continue;
			if (a.getX() === b.getX()) continue;

			let con: ConnectionGene;
			if (a.getX() < b.getX()) {
				con = new ConnectionGene(a, b);
			} else {
				con = new ConnectionGene(b, a);
			}

			if (this.connections.contains(con)) continue;

			con = this.neat.getConnection(con.getFrom(), con.getTo());
			con.setWeight((Math.random() * 2 - 1) * this.neat.WEIGHT_RANDOM_STRENGTH);

			this.connections.add_sorted(con);
			return;
		}
	}

	/**
	 * Mutação de nó no genoma.
	 * Substitui uma conexão existente por um novo nó e duas novas conexões.
	 */
	public mutate_node(): void {
		const con: ConnectionGene | null = this.connections.random_element();
		if (!con) return;

		const from: NodeGene = con.getFrom();
		const to: NodeGene = con.getTo();

		const replaceIndex: number = this.neat.getReplaceIndex(from, to);
		let middle: NodeGene;

		if (replaceIndex === 0) {
			middle = this.neat.getNode((from.getX() + to.getX()) / 2, (from.getY() + to.getY()) / 2 + Math.random() * 0.1 - 0.05);
			this.neat.setReplaceIndex(from, to, middle.getInnovation_number());
		} else {
			middle = this.neat.getNode(null, null, replaceIndex);
		}

		const con1: ConnectionGene = this.neat.getConnection(from, middle);
		const con2: ConnectionGene = this.neat.getConnection(middle, to);

		con1.setWeight(1);
		con2.setWeight(con.getWeight());
		con2.setEnabled(con.isEnabled());

		this.connections.remove(con);
		this.connections.add(con1);
		this.connections.add(con2);

		this.nodes.add(middle);
	}

	/**
	 * Mutação de deslocamento de peso em uma conexão no genoma.
	 * Adiciona um valor aleatório ao peso da conexão dentro de um intervalo específico.
	 */
	public mutate_weight_shift(): void {
		const con: ConnectionGene | null = this.connections.random_element();
		if (con) {
			con.setWeight(con.getWeight() + (Math.random() * 2 - 1) * this.neat.WEIGHT_SHIFT_STRENGTH);
		}
	}

	/**
	 * Mutação de peso aleatório em uma conexão no genoma.
	 * Define o peso da conexão como um valor aleatório dentro de um intervalo específico.
	 */
	public mutate_weight_random(): void {
		const con: ConnectionGene | null = this.connections.random_element();
		if (con) {
			con.setWeight((Math.random() * 2 - 1) * this.neat.WEIGHT_RANDOM_STRENGTH);
		}
	}

	/**
	 * Alternância do estado de uma conexão no genoma.
	 * Ativa ou desativa uma conexão aleatória.
	 */
	public mutate_link_toggle(): void {
		const con: ConnectionGene | null = this.connections.random_element();
		if (con) {
			con.setEnabled(!con.isEnabled());
		}
	}

	/**
	 * Obtém as conexões do genoma.
	 * @returns As conexões do genoma.
	 */
	public getConnections(): RandomHashSet<ConnectionGene> {
		return this.connections;
	}

	/**
	 * Obtém os nós do genoma.
	 * @returns Os nós do genoma.
	 */
	public getNodes(): RandomHashSet<NodeGene> {
		return this.nodes;
	}

	/**
	 * Obtém o objeto Neat associado ao genoma.
	 * @returns O objeto Neat associado ao genoma.
	 */
	public getNeat(): Neat {
		return this.neat;
	}
}
