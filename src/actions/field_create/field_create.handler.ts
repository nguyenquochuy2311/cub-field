import { TableException } from '@/exceptions/table.exception';
import { ConnectionHelper } from '@/helpers/connection.helper';
import { ActionHandler } from '@/helpers/handler.helper';
import { IFieldModel } from '@/models';
import { FieldRepository } from '@/repositories/field.repository';
import { TableRepository } from '@/repositories/table.repository';
import { ILocals } from '@/types/moleculer.type';
import { ISequelize, ITransaction } from '@/types/sequelize.type';
import { FieldCreateInputType } from './field_create.input';

export class FieldCreateHandler extends ActionHandler<FieldCreateInputType, IFieldModel> {
	private connection: ISequelize;
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldCreateHandler.
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
	 * Create a field
	 *
	 * @param {FieldCreateInputType} input
	 * @returns {Promise<IFieldModel>}
	 */
	async execute(input: FieldCreateInputType): Promise<IFieldModel> {
		const tableRepository = new TableRepository(this.locals.workspaceID, input.tableID);

		if (!(await tableRepository.checkTableExisted())) {
			throw TableException.tableNotFound();
		}

		let transaction!: ITransaction;

		try {
			transaction = await this.connection.createTransaction();

			const field = await this._fieldRepository.create(input, transaction);

			await new TableRepository(this.locals.workspaceID, input.tableID).createField(field.id, transaction);

			await transaction.safeCommit();

			return field;
		} catch (error) {
			transaction && (await transaction.safeRollback());
			throw error;
		}
	}
}
