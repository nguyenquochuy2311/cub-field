import { FieldException } from '@/exceptions/field.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { FieldRepository } from '@/repositories/field.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldUpdateInputType } from './field_update.input';

export class FieldUpdateHandler extends ActionHandler<FieldUpdateInputType> {
	private _fieldRepository: FieldRepository;

	/**
	 * Creates an instance of FieldUpdateHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);

		this._fieldRepository = new FieldRepository(locals.workspaceID);
	}

	/**
	 * Execute update field
	 *
	 * @param {FieldUpdateInputType} input
	 * @returns {Promise<void>}
	 */
	async execute(input: FieldUpdateInputType): Promise<void> {
		const field = await this._fieldRepository.getOne({ id: input.id });

		if (!field) {
			throw FieldException.fieldNotFound();
		}

		await this._fieldRepository.update(input, { id: field.id });
	}
}
