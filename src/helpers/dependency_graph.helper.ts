import { IGraph } from '@/types/_base.type';
import { RedisMultiType, Storage } from './storage.helper';

export class DependencyGraph {
	private workspaceID: string;
	private baseID: string;

	/**
	 * Creates an instance of DependencyGraph.
	 *
	 * @param {string} workspaceID
	 * @param {string} baseID
	 * @constructor
	 */
	constructor(workspaceID: string, baseID: string) {
		this.baseID = baseID;
		this.workspaceID = workspaceID;
	}

	/**
	 * Get the redis key for the graph.
	 *
	 * @returns {string}
	 */
	private getRedisKey(): string {
		return `graph:${this.workspaceID}:${this.baseID}`;
	}

	/**
	 * Check if the graph exists
	 *
	 * @public
	 * @returns {Promise<boolean>}
	 */
	async hasGraph(): Promise<boolean> {
		return (await Storage.checkCacheByKey(this.getRedisKey())) === 1;
	}

	/**
	 * Returns the current graph.
	 *
	 * @public
	 * @returns {Promise<IGraph>}
	 */
	async getGraph(): Promise<IGraph> {
		const graphJson = await Storage.getAllHashField(this.getRedisKey());

		const graph = new Map<string, Set<string>>();

		for (const [key, value] of Object.entries(graphJson)) {
			graph.set(key, new Set(JSON.parse(value)));
		}

		return graph;
	}

	/**
	 * Create the graph with expire time
	 *
	 * @public
	 * @returns {Promise<IGraph>}
	 */
	setGraphExpire() {
		return Storage.setCacheExpire(this.getRedisKey(), 60 * 60 * 24);
	}

	/**
	 * Adds a field to the graph if it doesn't already exist.
	 *
	 * @public
	 * @param {string} fieldId
	 * @param {Set<string>} dependencies
	 * @param {RedisClientMultiCommandType} multi
	 * @return {Promise<number>}
	 */
	async setField(fieldId: string, dependencies: Set<string>, multi: RedisMultiType) {
		const serializedDependencies = JSON.stringify(Array.from(dependencies));

		return multi.hSet(this.getRedisKey(), fieldId, serializedDependencies);
	}

	/**
	 * Check a field  if it exist.
	 *
	 * @public
	 * @param {string} fieldId
	 * @param {RedisClientMultiCommandType} multi
	 * @return {Promise<number>}
	 */
	async hasField(fieldId: string, multi: RedisMultiType): Promise<boolean> {
		return ((await multi.hExists(this.getRedisKey(), fieldId)) as unknown as number) === 1;
	}

	/**
	 * Delete a field  if it exist.
	 *
	 * @public
	 * @param {string} fieldId
	 * @param {RedisClientMultiCommandType} multi
	 * @return {Promise<number>}
	 */
	async deleteField(fieldId: string, multi: RedisMultiType) {
		return multi.hDel(this.getRedisKey(), fieldId);
	}

	/**
	 * Get the redis key for the graph sorted.
	 *
	 * @returns {string}
	 */
	private getSortKey(): string {
		return `topSort:${this.workspaceID}:${this.baseID}`;
	}

	/**
	 * Set sorted field graph to redis
	 *
	 * @param {string[]} sortedFields
	 * @returns {string}
	 */
	private setSortedField(sortedFields: string[]) {
		return Storage.setCacheValueByKey(this.getSortKey(), sortedFields, { EX: 60 * 60 * 24 });
	}

	/**
	 * Get sorted field list from redis
	 *
	 * @param {IGraph} graph
	 * @returns {Promise<string>}
	 */
	public async getSortedField(graph: IGraph): Promise<string[]> {
		const cachedSortedFields = await Storage.getCacheValueByKey(this.getSortKey());

		if (!cachedSortedFields) {
			const { sortedFields } = (await this.topologicalSortWithCycleDetection(graph)) as {
				sortedFields: string[];
				hasCycle: false;
			};
			return sortedFields;
		}

		return cachedSortedFields;
	}

	/**
	 * Check if the graph is sorted
	 *
	 * @returns {Promise<string>}
	 */
	public async hasSortedField() {
		return (await Storage.checkCacheByKey(this.getRedisKey())) === 1;
	}

	/**
	 * Performs topological sort on the graph while checking for cycles
	 *
	 * @public
	 * @param {IGraph} graph - The graph to check and sort.
	 * @return {object} - Result with sorted fields, cycle detection status, and cycle path if any.
	 */
	async topologicalSortWithCycleDetection(graph: IGraph): Promise<{
		sortedFields?: string[];
		hasCycle: boolean;
		cyclePath?: string[];
	}> {
		const visited = new Set<string>();
		const stack: string[] = [];
		const sortedFields: string[] = [];
		let cyclePath: string[] | undefined;

		// Helper function for DFS
		const dfs = (node: string): boolean => {
			if (stack.includes(node)) {
				// Cycle detected: extract the cycle path
				const cycleStartIndex = stack.indexOf(node);
				cyclePath = stack.slice(cycleStartIndex);
				return true;
			}
			if (visited.has(node)) {
				return false; // Already processed
			}

			visited.add(node);
			stack.push(node);

			// Explore neighbors (using Set iteration)
			for (const neighbor of graph.get(node) || new Set<string>()) {
				if (dfs(neighbor)) {
					return true; // Propagate cycle detection
				}
			}

			stack.pop(); // Backtrack
			sortedFields.unshift(node); // Add to sorted fields in reverse order
			return false;
		};

		// Process all nodes in the graph
		for (const node of graph.keys()) {
			if (!visited.has(node) && dfs(node)) {
				return {
					sortedFields: [],
					hasCycle: true,
					cyclePath,
				};
			}
		}

		// Save sorted fields to storage
		await this.setSortedField(sortedFields);

		return { sortedFields, hasCycle: false };
	}
}
