import { FieldException } from '@/exceptions/field.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { IFieldModel } from '@/models';
import { FieldRepository } from '@/repositories/field.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldGetDetailInputType } from './field_get_detail.input';

export class FieldGetDetailHandler extends ActionHandler<FieldGetDetailInputType, IFieldModel> {
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldGetDetailHandler.
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
	 * @param {FieldGetDetailInputType} input
	 * @returns {Promise<IFieldModel[]>}
	 */
	async execute(input: FieldGetDetailInputType): Promise<IFieldModel> {
		const { fieldID } = input;

		const field = await this._fieldRepository.getOne({ id: fieldID });

		if (!field) throw FieldException.fieldInvalid();

		return field;
	}
}
