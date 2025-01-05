import { FieldException } from '@/exceptions/field.exception';
import { ActionHandler } from '@/helpers/handler.helper';
import { FieldRepository } from '@/repositories/field.repository';
import { RecordMetaRepository } from '@/repositories/record_meta.repository';
import { ILocals } from '@/types/moleculer.type';
import { FieldChangePrimaryInputType } from './field_change_primary.input';

export class FieldChangePrimaryHandler extends ActionHandler<FieldChangePrimaryInputType> {
	private _fieldRepository: FieldRepository;
	private _recordMetaRepository: RecordMetaRepository;

	/**
	 * Creates an instance of FieldDuplicateHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);

		this._fieldRepository = new FieldRepository(locals.workspaceID);
		this._recordMetaRepository = new RecordMetaRepository(locals.workspaceID);
	}

	/**
	 * Execute change primary field
	 *
	 * @param {FieldChangePrimaryInputType} input
	 * @returns {Promise<void>}
	 */
	async execute(input: FieldChangePrimaryInputType): Promise<void> {
		const field = await this._fieldRepository.getByPk(input.id);

		if (!field || field.isPrimary || field.isInvalid) {
			throw FieldException.changePrimaryDenied();
		}

		const recordMeta = await this._recordMetaRepository.getOne({ tableID: field.tableID });

		if (recordMeta) {
			throw FieldException.changePrimaryDenied();
		}

		const oldPrimaryField = await this._fieldRepository.getOne({ isPrimary: true, tableID: field.tableID });

		await this._fieldRepository.update({ isPrimary: false }, { id: oldPrimaryField?.id });
		await this._fieldRepository.update({ isPrimary: true }, { id: field.id });
	}
}
