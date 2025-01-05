import { DYNAMIC_TAG_REGEX, FIELD_ID_REGEX } from '@/constants/regex';
import BusinessExceptions from '@/exceptions/business.exception';
import { FieldException } from '@/exceptions/field.exception';
import { IObject } from '@/interfaces/baseType.interface';
import {
	FieldTypeEnum,
	FilterConditionType,
	IBoardModel,
	IFieldDropdownParams,
	IFieldDropdownParamsReferenceValidator,
	IFieldFormulaParams,
	IFieldLastModifiedByParams,
	IFieldLastModifiedTimeParams,
	IFieldLookupParams,
	IFieldModel,
	IFieldReferenceParams,
} from '@/models';
import { BaseRepository } from '@/repositories/base.repository';
import { BoardRepository } from '@/repositories/board.repository';
import { FieldRepository } from '@/repositories/field.repository';
import { IGraph, TwoWayLinkSet } from '@/types/_base.type';
import { FILTER_COMPARE_TYPE } from '@cub/filter/dist/constants';
import _ from 'lodash';
import { ULID } from 'ulidx';
import { DependencyGraph } from './dependency-graph.helper';
import { Storage } from './storage.helper';

export class FieldDependencyResolver {
	private readonly workspaceID: string;
	private readonly _baseRepository: BaseRepository;
	private readonly _boardRepository: BoardRepository;
	private readonly _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of DependencyResolver.
	 * @param {string} workspaceID
	 */
	constructor(workspaceID: string) {
		this.workspaceID = workspaceID;
	}

	/**
	 * Method to add or update a field in the graph
	 * @param {ULID} boardIDOrBaseID - The ID of board or base
	 * @param {IFieldModel[]} fields - The new/updated fields
	 * @param {Object} params - Optional parameters
	 * @param {boolean} params.noThrow - Optional param to not throw error
	 * @param {IFieldModel} params.primaryField - Optional param to pass in primary field for reference
	 * @param {IFieldModel} params.isBaseID - Optional param to know if boardIDOrBaseID is baseID
	 * @returns {Promise<void>} - The generated dependency graph
	 */
	public async addOrUpdateFields(
		boardIDOrBaseID: string,
		fields: IFieldModel[],
		params: Partial<{ noThrow: boolean; primaryField?: IFieldModel; isBaseID?: boolean }> = { noThrow: false, isBaseID: false },
	): Promise<void> {
		let baseID: string;
		let currentBoard: IBoardModel | null = null;

		if (params.isBaseID) {
			baseID = boardIDOrBaseID;
		} else {
			currentBoard = await this._boardRepository.getOneByAttributes({ id: boardIDOrBaseID });
			if (!currentBoard) {
				throw BusinessExceptions.boardNotFound();
			}
			baseID = currentBoard.baseID;
		}

		const dependencyGraph = new DependencyGraph(this.workspaceID, baseID);
		const { graph } = await this.buildOrRetrieveDependencyGraph(baseID, dependencyGraph);

		// Remove all fields from dependencies
		for (const deps of graph.values()) {
			fields.forEach(field => deps.delete(field.id));
		}

		// Add new fields and dependencies
		await Promise.all(
			fields.map(async field => {
				if (!graph.has(field.id)) graph.set(field.id, new Set());
				if (field.params) {
					await this.addDependenciesToGraph(field, graph, { ...params });
				}
			}),
		);

		await this.validateGraphIntegrity(graph, dependencyGraph, params.noThrow);
		await this.saveDependencyGraph(graph, dependencyGraph);
	}

	/**
	 * delete fields from the graph
	 * @param {ULID} boardID - The ID of board
	 * @param {string} fieldIDs - The deleted fieldIDs
	 * @returns {Promise<IBoardModel>}
	 */
	public async deleteFields(boardID: string, fieldIDs: string[]): Promise<void> {
		const currentBoard = await this._boardRepository.getOneByAttributes({ id: boardID }, false);
		if (!currentBoard) {
			throw BusinessExceptions.boardNotFound();
		}

		const dependencyGraph = new DependencyGraph(this.workspaceID, currentBoard.baseID);
		const { graph } = await this.buildOrRetrieveDependencyGraph(currentBoard.baseID, dependencyGraph);
		const removedFields = new Set<string>();

		for (const fieldID of fieldIDs) {
			// Remove the field as a dependency from all other fields
			for (const [key, dependencies] of graph.entries()) {
				if (key !== fieldID && dependencies.has(fieldID)) {
					dependencies.delete(fieldID);
				}
			}

			// Remove the field itself
			removedFields.add(fieldID);
		}

		await this.saveDependencyGraph(graph, dependencyGraph, removedFields);
	}

	/**
	 * Get topological sort order based on the given fields
	 *
	 * @param {ULID} baseID - get the topological sort order for the base
	 * @param {ULID[]} changedFields - The fields that have changed
	 * @returns {Promise<string>}
	 */
	public async getTopSortOrder(baseID: ULID, changedFields: ULID[]): Promise<string[]> {
		const dependencyGraph = new DependencyGraph(this.workspaceID, baseID);

		const { graph } = await this.buildOrRetrieveDependencyGraph(baseID, dependencyGraph);

		let fieldsToRecalculate = new Set<string>();

		for (const field of changedFields) {
			fieldsToRecalculate.add(field);

			// Add all descendants of this field
			const allDescendants = this.getAllDescendants(graph, field);
			fieldsToRecalculate = new Set([...fieldsToRecalculate, ...allDescendants]);
		}

		const sortedFields = await dependencyGraph.getSortedField(graph);
		return sortedFields.filter(field => fieldsToRecalculate.has(field));
	}

	/**
	 * Get all descendants of the given fields
	 * @param {ULID} boardID - board ID to get descendants
	 * @param {ULID[]} fields - fields to get descendants
	 * @returns {Promise<string>} - All descendants of the given fields
	 */
	public async getDirectAndAllDescendantsFromFields(boardID: string, fields: string[]): Promise<{ direct: string[]; all: string[] }> {
		const currentBoard = await this._boardRepository.getOneByAttributes({ id: boardID }, false);
		if (!currentBoard) {
			throw BusinessExceptions.boardNotFound();
		}
		const dependencyGraph = new DependencyGraph(this.workspaceID, currentBoard.baseID);
		const { graph } = await this.buildOrRetrieveDependencyGraph(currentBoard.baseID, dependencyGraph);

		const directDescendants = new Set<string>();
		const allDescendants = new Set<string>();

		fields.forEach(field => {
			const direct = this.getDirectDescendants(graph, field);
			const all = this.getAllDescendants(graph, field);
			direct.forEach(d => directDescendants.add(d));
			all.forEach(d => allDescendants.add(d));
		});

		return {
			direct: Array.from(directDescendants),
			all: Array.from(allDescendants),
		};
	}

	/**
	 * Get direct descendants of the given field
	 * @param {IGraph} graph - The generated dependency graph
	 * @param {string} field - Field to get descendants
	 * @returns {Set<string>} - Direct descendants of the given field
	 */
	private getDirectDescendants(graph: IGraph, field: string): Set<string> {
		return graph.get(field) || new Set();
	}

	/**
	 * Get all descendants of the given field
	 * @param {IGraph} graph - The generated dependency graph
	 * @param {string} field - Field to get descendants
	 * @param {string} visited - Visited set
	 * @returns {Set<string>} - All descendants of the given field
	 */
	private getAllDescendants(graph: IGraph, field: string, visited: Set<string> = new Set()): Set<string> {
		const descendants = new Set<string>();
		const directDescendants = graph.get(field) || new Set();

		for (const descendant of directDescendants) {
			if (!visited.has(descendant)) {
				descendants.add(descendant);
				visited.add(descendant);
				const furtherDescendants = this.getAllDescendants(graph, descendant, visited);
				furtherDescendants.forEach(d => descendants.add(d));
			}
		}

		return descendants;
	}

	/**
	 * Removes fields from their dependencies
	 * @param {IGraph} graph - The generated dependency graph
	 * @param {DependencyGraph} dependencyGraph - The helper for dependency graph
	 * @param {boolean} noThrow - Optional param to not throw error
	 * @returns {IObject} - The result of the validation
	 */
	private async validateGraphIntegrity(graph: IGraph, dependencyGraph: DependencyGraph, noThrow?: boolean) {
		const cycleResult = await dependencyGraph.topologicalSortWithCycleDetection(graph);
		const validationResult: IObject = {
			isValid: true,
			error: {},
		};

		if (cycleResult.hasCycle && cycleResult.cyclePath) {
			const cycleFields = await this._fieldRepository.getAllIncludeBoard(cycleResult.cyclePath);
			validationResult.isValid = false;
			validationResult.error = {
				message: `A cycle was detected: ${cycleResult.cyclePath?.join(' -> ')}`,
				cycleFields,
			};

			if (!noThrow) {
				throw FieldException.fieldCycleDetected(validationResult.error.message, validationResult.error.cycleFields);
			}
		}

		return validationResult;
	}
	/**
	 * Resolves and builds a dependency graph for all fields across all boards in a base.
	 * @param {string} baseID - The ID of the base.
	 * @param {DependencyGraph} dependencyGraph  - the dependency graph helper
	 * @returns {Promise<IGraph>} - The generated dependency graph.
	 * @throws {BusinessExceptions} - If no primary field is found in any board.
	 */
	private async buildOrRetrieveDependencyGraph(
		baseID: string,
		dependencyGraph: DependencyGraph,
	): Promise<{ graph: IGraph; twoWayLink?: TwoWayLinkSet }> {
		if (await dependencyGraph.hasGraph()) {
			await dependencyGraph.setGraphExpire();
			return { graph: await dependencyGraph.getGraph() };
		}

		const base = await this._baseRepository.getAllFieldsByBase(baseID);
		if (!base) {
			throw BusinessExceptions.baseNotFound();
		}

		const graph = new Map<string, Set<string>>();
		const fieldsToProcess: Array<{ field: IFieldModel }> = [];

		for (const board of base.boards) {
			for (const field of board.fields) {
				graph.set(field.id, new Set());

				if (field.params) {
					fieldsToProcess.push({ field });
				}
			}
		}

		await Promise.all(fieldsToProcess.map(({ field }) => this.addDependenciesToGraph(field, graph)));

		return { graph };
	}

	/**
	 * Save dependency graph to redis
	 * @param {IGraph} graph - The graph to which dependencies are added.
	 * @param {DependencyGraph} dependencyGraph  - The helper for the dependency graph
	 * @param {Set<string>} removedFields - The removed fields
	 * @returns {Promise<void>}
	 */
	private async saveDependencyGraph(graph: IGraph, dependencyGraph: DependencyGraph, removedFields?: Set<string>): Promise<void> {
		const multi = await (await Storage.getStorageClient()).multi();
		const setOperations = Array.from(graph.entries()).map(([fieldID, dependencies]) => {
			dependencyGraph.setField(fieldID, dependencies, multi);

			if (removedFields) {
				removedFields.has(fieldID) && dependencyGraph.deleteField(fieldID, multi);
			}
		});
		await Promise.all(setOperations);
		await multi.exec();
	}

	/**
	 * Adds dependencies for a field to the dependency graph.
	 * @param {IFieldModel} field - The field for which to add dependencies.
	 * @param {IGraph} dependencyGraph - The graph to which dependencies are added.
	 * @param {Object} params - Optional parameters for the dependency processing.
	 * @returns {Promise<void>}
	 */
	private async addDependenciesToGraph(field: IFieldModel, dependencyGraph: IGraph, params?: { primaryField?: IFieldModel }): Promise<void> {
		switch (field.dataType) {
			case FieldTypeEnum.LOOKUP:
				this.processLookupDependency(field, dependencyGraph);
				break;
			case FieldTypeEnum.DROPDOWN:
				this.processDropDownDependency(field, dependencyGraph);
				break;
			case FieldTypeEnum.REFERENCE:
				await this.processReferenceDependency(field, dependencyGraph, params?.primaryField);
				break;
			case FieldTypeEnum.FORMULA:
				this.processFormulaDependency(field, dependencyGraph);
				break;
			case FieldTypeEnum.LAST_MODIFIED_BY:
				this.processLastModifiedByDependency(field, dependencyGraph);
				break;
			case FieldTypeEnum.LAST_MODIFIED_TIME:
				this.processLastModifiedTimeDependency(field, dependencyGraph);
				break;
			default:
				break;
			// Handle other field types if necessary
		}
	}

	/**
	 * Adds a lookup dependency to the dependency graph.
	 * @param {IFieldModel} field - The lookup field.
	 * @param {DependencyGraph} graph - The graph to which the dependency is added.
	 * @returns {void}
	 */
	private processLookupDependency(field: IFieldModel, graph: IGraph): void {
		const { lookup } = field.params as IFieldLookupParams;

		if (lookup?.sourceFieldID) {
			const dependencies = graph.get(lookup.sourceFieldID);

			dependencies?.add(field.id);
		}

		if (lookup?.filter) {
			const fieldIDs = this.getFieldIDs(lookup.filter?.conditions as FilterConditionType);

			fieldIDs.forEach(id => graph.get(id)?.add(field.id));
		}
	}

	/**
	 * Gets all field IDs in a filter condition.
	 * @param {FilterConditionType} condition - The filter condition to recursively get field IDs.
	 * @returns {string[]} - The field IDs in the filter condition.
	 */
	private getFieldIDs = (condition: FilterConditionType): string[] => {
		if ('fieldID' in condition) {
			const { fieldID, data } = condition;
			const fieldIDs: ULID[] = [fieldID];
			if (data?.compareType === FILTER_COMPARE_TYPE.DYNAMIC) {
				fieldIDs.push(data?.fieldID || data?.targetField?.fieldID);
			}
			return fieldIDs;
		}

		const [operator, conditions] = Object.entries(condition)[0] as ['and' | 'or', FilterConditionType[]];

		return conditions.flatMap(this.getFieldIDs);
	};

	/**
	 * Adds a formula dependency to the dependency graph.
	 * @param {IFieldModel} field - The formula field.
	 * @param {IGraph} graph - The graph to which the dependency is added.
	 * @returns {void}
	 */
	private processFormulaDependency(field: IFieldModel, graph: IGraph): void {
		const { value: formula } = field.params as NonNullable<IFieldFormulaParams>;
		const extractedIdentifiers = formula.match(DYNAMIC_TAG_REGEX);

		if (extractedIdentifiers) {
			for (const identifier of extractedIdentifiers) {
				const match = identifier.split(FIELD_ID_REGEX);
				const fieldID = match[match.length - 1];

				if (match[0] === 'field') {
					const dependencies = graph.get(fieldID);

					dependencies?.add(field.id);
				}
			}
		}
	}

	/**
	 * Adds a drop down dependency to the dependency graph.
	 * @param {IFieldModel} field - The reference field.
	 * @param {IGraph} graph - The graph to which the dependency is added.
	 * @returns {void}
	 */
	private async processDropDownDependency(field: IFieldModel, graph: IGraph): Promise<void> {
		const params = field.params as IFieldDropdownParams;

		if (_.has(params, 'reference.fieldID')) {
			const dependencies = graph.get((params as IFieldDropdownParamsReferenceValidator).reference.fieldID);
			dependencies?.add(field.id);
		}
	}

	/**
	 * Adds a reference dependency to the dependency graph.
	 * @param {IFieldModel} field - The reference field.
	 * @param {IGraph} graph - The graph to which the dependency is added.
	 * @param {IFieldModel} primaryField - Optional pass in primary field.
	 * @returns {void}
	 */
	private async processReferenceDependency(field: IFieldModel, graph: IGraph, primaryField?: IFieldModel): Promise<void> {
		const { reference } = field.params as IFieldReferenceParams;

		const currentPrimary = primaryField ?? (await this._fieldRepository.getOneByAttributes({ boardID: reference?.boardID, isPrimary: true }));
		if (!currentPrimary) {
			throw BusinessExceptions.internalServerError(`Primary field not found in board ${reference?.boardID}`);
		}

		const dependencies = graph.get(currentPrimary.id);
		dependencies?.add(field.id);
	}

	/**
	 * Adds a last modified by dependency to the dependency graph.
	 * @param {IFieldModel} field - The last modified by field.
	 * @param {IGraph} graph - The graph to which the dependency is added.
	 * @returns {void}
	 */
	private async processLastModifiedByDependency(field: IFieldModel, graph: IGraph): Promise<void> {
		const { targetFieldID } = field.params as IFieldLastModifiedByParams;
		if (targetFieldID) {
			const dependencies = graph.get(targetFieldID);

			dependencies?.add(field.id);
		}
	}

	/**
	 * Adds a last modified time dependency to the dependency graph.
	 * @param {IFieldModel} field - The last modified time field.
	 * @param {IGraph} graph - The graph to which the dependency is added.
	 * @returns {void}
	 */
	private async processLastModifiedTimeDependency(field: IFieldModel, graph: IGraph): Promise<void> {
		const { targetFieldID } = field.params as IFieldLastModifiedTimeParams;
		if (targetFieldID) {
			const dependencies = graph.get(targetFieldID);

			dependencies?.add(field.id);
		}
	}
}
