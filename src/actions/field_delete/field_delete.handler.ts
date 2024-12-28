import { FieldException } from '@/exceptions/field.exception';
import { ConnectionHelper } from '@/helpers/connection.helper';
import { ActionHandler } from '@/helpers/handler.helper';
import { FieldRepository } from '@/repositories/field.repository';
import { TableRepository } from '@/repositories/table.repository';
import { ILocals } from '@/types/moleculer.type';
import { ISequelize, ITransaction } from '@/types/sequelize.type';
import { FieldDeleteInputType } from './field_delete.input';

export class FieldDeleteHandler extends ActionHandler<FieldDeleteInputType> {
	private connection: ISequelize;
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldDeleteHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);

		this.connection = ConnectionHelper.getConnection(locals.workspaceID);
		this._fieldRepository = new FieldRepository(locals.workspaceID);
	}

	/**
	 * Get list of fields
	 *
	 * @param {FieldGetListInputType} input
	 * @returns {Promise<FieldGetListOutputType>}
	 */
	async execute(input: FieldDeleteInputType): Promise<void> {
		const { tableID, fieldIDs } = input;

		const fields = await this._fieldRepository.getAll({ tableID, id: fieldIDs });

		if (fields.length !== fieldIDs.length || fields.some(field => field.isPrimary)) {
			throw FieldException.fieldInvalid('Some fields are invalid');
		}

		let transaction!: ITransaction;

		try {
			transaction = await this.connection.createTransaction();

			await this._fieldRepository.delete({ id: fieldIDs }, transaction);
			await new TableRepository(this.locals.workspaceID, tableID).deleteFields(fieldIDs, transaction);

			await transaction.safeCommit();
		} catch (error) {
			await transaction.safeRollback();
			throw error;
		}
	}
}
