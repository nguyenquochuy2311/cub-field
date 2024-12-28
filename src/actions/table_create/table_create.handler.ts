import { TableException } from '@/exceptions/table.exception';
import { ConnectionHelper } from '@/helpers/connection.helper';
import { ActionHandler } from '@/helpers/handler.helper';
import { FieldTypeEnum } from '@/models/field/field.interface';
import { FieldRepository } from '@/repositories/field.repository';
import { TableRepository } from '@/repositories/table.repository';
import { ILocals } from '@/types/moleculer.type';
import { ISequelize, ITransaction } from '@/types/sequelize.type';
import { ulid } from 'ulidx';
import { TableCreateInputType } from './table_create.input';

export class TableCreateHandler extends ActionHandler<TableCreateInputType> {
	private connection: ISequelize;
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of TableCreateHandler.
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
	 * Create a table
	 *
	 * @param {TableCreateInputType} input
	 * @returns {Promise<void>}
	 */
	async execute(input: TableCreateInputType): Promise<void> {
		const { tableID } = input;
		const tableRepository = new TableRepository(this.locals.workspaceID, tableID);

		if (await tableRepository.checkTableExisted()) {
			throw TableException.tableExisted();
		}

		let transaction!: ITransaction;

		try {
			transaction = await this.connection.createTransaction();

			const field = await this._fieldRepository.create(
				{
					id: ulid(),
					name: 'Text',
					dataType: FieldTypeEnum.TEXT as any,
					isPrimary: true,
					tableID,
				},
				transaction,
			);

			await tableRepository.createTable(field.id);

			await transaction.safeCommit();
		} catch (error) {
			await transaction.safeRollback();
			throw error;
		}
	}
}
