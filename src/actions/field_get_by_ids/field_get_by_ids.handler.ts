import { TableException } from '@/exceptions/table.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { IFieldModel } from '@/models';
import { FieldRepository } from '@/repositories/field.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldGetByIDsInputType } from './field_get_by_ids.input';

export class FieldGetByIDsHandler extends ActionHandler<FieldGetByIDsInputType, IFieldModel[]> {
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldGetByIDsHandler.
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
	async execute(input: FieldGetByIDsInputType): Promise<IFieldModel[]> {
		const { fieldIDs } = input;

		const fields = await this._fieldRepository.getAll({ id: fieldIDs });
		if (!fields.length) throw TableException.tableNotFound();

		return fields;
	}
}
