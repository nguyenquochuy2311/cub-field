import { FieldModel, IFieldModel } from '@/models';
import { IRepository, ITransaction } from '@/types/sequelize.type';
import { WhereOptions } from 'sequelize';
import { Repository } from './_repository';

export class FieldRepository extends Repository<IFieldModel> {
	/**
	 * Creates an instance of FieldRepository.
	 *
	 * @constructor
	 * @param {string} workspaceID
	 */
	constructor(workspaceID: string) {
		super(workspaceID);
	}

	/**
	 * Get repository
	 *
	 * @override
	 * @returns {IRepository<FieldModel>}
	 */
	protected override _getRepository(): IRepository<FieldModel> {
		return this.connection.getRepository(FieldModel);
	}

	/**
	 * Get all fields by where conditions
	 *
	 * @async
	 * @param {WhereOptions<IFieldModel>} where
	 * @returns {Promise<IFieldModel[]>}
	 */
	async getAll(where: WhereOptions<IFieldModel>): Promise<IFieldModel[]> {
		return super._getAll({ where });
	}

	/**
	 * Create field
	 *
	 * @async
	 * @param {Partial<IFieldModel>} field
	 * @param {ITransaction} transaction
	 * @returns {Promise<IFieldModel>}
	 */
	async create(field: Partial<IFieldModel>, transaction?: ITransaction): Promise<IFieldModel> {
		return super._create(field, { transaction });
	}

	/**
	 * Delete fields
	 *
	 * @param {WhereOptions<IFieldModel>} where
	 * @param {ITransaction} transaction
	 * @returns {Promise<void>}
	 */
	async delete(where: WhereOptions<IFieldModel>, transaction: ITransaction): Promise<void> {
		await this._delete({ force: true, where, transaction });
	}
}
