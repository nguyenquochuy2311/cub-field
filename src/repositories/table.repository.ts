import { TableException } from '@/exceptions/table.exception';
import { IRecordDataModel, RecordDataColumn, RecordMetaModel } from '@/models';
import { IRepository, ITransaction } from '@/types/sequelize.type';
import { catchError, parseTableID } from '@/utils';
import { reduce, startsWith } from 'lodash';
import { DataTypes, ModelAttributeColumnOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { isValid } from 'ulidx';
import { Repository } from './_repository';

export class TableRepository extends Repository<IRecordDataModel> {
	private parseTableID: string;

	/**
	 * Creates an instance of TableRepository.
	 *
	 * @constructor
	 * @param {string} workspaceID
	 * @param {string} tableID
	 */
	constructor(workspaceID: string, tableID: string) {
		super(workspaceID);
		this.parseTableID = parseTableID(tableID);
	}

	/**
	 * Get repository
	 *
	 * @protected
	 * @override
	 * @returns {Promise<IRepository<Model>>}
	 */
	protected override async _getRepository(): Promise<IRepository<Model>> {
		const model = await this.checkTableExisted();
		if (!model) throw TableException.tableNotFound();

		return model;
	}

	/**
	 * Create table
	 *
	 * @param {string} primaryFieldID
	 * @returns {Promise<void>}
	 */
	async createTable(primaryFieldID: string): Promise<void> {
		let model!: ModelCtor;

		try {
			model = this._defineModel(RecordDataColumn([primaryFieldID]));

			await model.sync();
		} catch (error) {
			delete this.connection.models[this.parseTableID];

			model && (await model.drop());

			throw error;
		}
	}

	/**
	 * Check table is existed
	 *
	 * @returns {Promise<any>}
	 */
	async checkTableExisted(): Promise<ModelCtor | undefined> {
		const tableModel = this.connection.models[this.parseTableID];
		if (tableModel) return tableModel as ModelCtor;

		const [error, attributes] = await catchError(this.connection.getQueryInterface().describeTable(this.parseTableID));

		if (startsWith(error?.message, 'No')) return;

		const fieldIDs = reduce(attributes, (res: string[], __, colName) => (isValid(colName) ? res.concat(colName) : res), []);
		const fieldAttributes = RecordDataColumn(fieldIDs);

		return this._defineModel(fieldAttributes);
	}

	/**
	 * Drop a table
	 *
	 * @param {ITransaction} transaction
	 * @returns {Promise<void>}
	 */
	async dropTable(transaction: ITransaction): Promise<void> {
		try {
			await this.connection.getQueryInterface().dropTable(this.parseTableID, { transaction });
		} catch (error) {
			throw error;
		} finally {
			this._undefineModel();
		}
	}

	/**
	 * Create a field
	 *
	 * @param {string} fieldID
	 * @param {ITransaction} transaction
	 * @returns {Promise<void>}
	 */
	async createField(fieldID: string, transaction: ITransaction): Promise<void> {
		try {
			await this.connection.getQueryInterface().addColumn(this.parseTableID, fieldID, { type: DataTypes.JSON }, { transaction });
		} catch (error) {
			throw error;
		} finally {
			this._undefineModel();
		}
	}

	/**
	 * Delete fields
	 *
	 * @param {string[]} fieldIDs
	 * @param {ITransaction} transaction
	 * @returns {Promise<void>}
	 */
	async deleteFields(fieldIDs: string[], transaction: ITransaction): Promise<void> {
		try {
			for (const fieldID of fieldIDs) {
				await this.connection.getQueryInterface().removeColumn(this.parseTableID, fieldID, { transaction });
			}
		} catch (error) {
			throw error;
		} finally {
			this._undefineModel();
		}
	}

	/**
	 * Define model
	 *
	 * @param {Record<string, ModelAttributeColumnOptions<Model<any, any>>>} fieldAttributes
	 * @returns {ModelCtor}
	 */
	private _defineModel(fieldAttributes: Record<string, ModelAttributeColumnOptions<Model<any, any>>>): ModelCtor {
		this.connection.define(this.parseTableID, fieldAttributes, {
			indexes: [{ name: 'idx_deletedAt', fields: ['deletedAt'] }],
			modelName: this.parseTableID,
			tableName: this.parseTableID,
			timestamps: true,
			paranoid: true,
		});

		this.connection.models[this.parseTableID].belongsTo(this.connection.getRepository(RecordMetaModel), {
			as: 'recordMeta',
			foreignKey: 'id',
			onDelete: 'CASCADE',
		});

		return this.connection.models[this.parseTableID] as ModelCtor;
	}

	/**
	 * Undefined void
	 *
	 * @returns {void}
	 */
	private _undefineModel(): void {
		delete this.connection.models[this.parseTableID];
	}
}
