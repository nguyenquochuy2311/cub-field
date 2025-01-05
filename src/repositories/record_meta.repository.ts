import { IRecordMetaModel, RecordMetaModel } from '@/models';
import { IRepository } from '@/types/sequelize.type';
import { WhereOptions } from 'sequelize';
import { Repository } from './_repository';

export class RecordMetaRepository extends Repository<IRecordMetaModel> {
	/**
	 * Creates an instance of RecordMetaRepository.
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
	 * @returns {IRepository<RecordMetaModel>}
	 */
	protected override _getRepository(): IRepository<RecordMetaModel> {
		return this.connection.getRepository(RecordMetaModel);
	}

	/**
	 * Get one record meta
	 *
	 * @param {WhereOptions<IRecordMetaModel>} where
	 * @returns {Promise<IRecordMetaModel | null>}
	 */
	async getOne(where: WhereOptions<IRecordMetaModel>): Promise<IRecordMetaModel | null> {
		return super._getOne({ where });
	}
}
