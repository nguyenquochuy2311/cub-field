import { TableException } from '@/exceptions/table.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { IFieldModel } from '@/models';
import { FieldRepository } from '@/repositories/field.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldListInputType } from './field_list.input';

export class FieldListHandler extends ActionHandler<FieldListInputType, IFieldModel[]> {
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldListHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);

		this._fieldRepository = new FieldRepository(locals.workspaceID);
	}

	/**
	 * Execute get field list
	 *
	 * @param {FieldListInputType} input
	 * @returns {Promise<IFieldModel[]>}
	 */
	async execute(input: FieldListInputType): Promise<IFieldModel[]> {
		const { tableID, fieldIDs } = input;

		const fields = await this._fieldRepository.getAll({ tableID, ...(fieldIDs?.length ? { id: fieldIDs } : {}) });
		if (!fields.length) throw TableException.tableNotFound();

		return fields;
	}
}
