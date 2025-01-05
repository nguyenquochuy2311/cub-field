import { FieldException } from '@/exceptions/field.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { FieldRepository } from '@/repositories/field.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldDuplicateInputType } from './field_duplicate.input';

export class FieldDuplicateHandler extends ActionHandler<FieldDuplicateInputType> {
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldDuplicateHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);

		this._fieldRepository = new FieldRepository(locals.workspaceID);
	}

	/**
	 * Execute duplicate field
	 *
	 * @param {FieldDuplicateInputType} input
	 * @returns {Promise<void>}
	 */
	async execute(input: FieldDuplicateInputType): Promise<void> {
		const field = await this._fieldRepository.getOne({ id: input.id });

		if (!field) {
			throw FieldException.fieldNotFound();
		}

		const fieldDuplicateData = { ...field, ...input, id: input.newFieldID };

		await this._fieldRepository.create(fieldDuplicateData);
	}
}
