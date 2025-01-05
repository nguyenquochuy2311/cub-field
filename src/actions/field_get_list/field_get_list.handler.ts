import { TableException } from '@/exceptions/table.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { IFieldModel } from '@/models';
import { FieldRepository } from '@/repositories/field.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldGetListInputType } from './field_get_list.input';

export class FieldGetListHandler extends ActionHandler<FieldGetListInputType, IFieldModel[]> {
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldGetListHandler.
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
	 * @param {FieldGetListInputType} input
	 * @returns {Promise<IFieldModel[]>}
	 */
	async execute(input: FieldGetListInputType): Promise<IFieldModel[]> {
		const { tableID, fieldIDs } = input;

		const fields = await this._fieldRepository.getAll({ tableID, ...(fieldIDs?.length ? { id: fieldIDs } : {}) });
		if (!fields.length) throw TableException.tableNotFound();

		return fields;
	}
}
