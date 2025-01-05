import { ITransaction } from '@/interfaces/database.interface';
import { IFieldFactory } from '@/interfaces/field.interface';
import { ILocals } from '@/interfaces/moleculer.interface';
import { FieldTextInitialDataValidator, FieldTextParamsValidator, IFieldModel, IFieldTextModel } from '@/models';
import { FieldRepository } from '@/repositories/field.repository';
import _ from 'lodash';

export class FieldTextFactory implements IFieldFactory<IFieldTextModel> {
	private _fieldRepository: FieldRepository;

	/**
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		this._fieldRepository = new FieldRepository(locals.workspaceID);
	}

	/**
	 * @param {Partial<IFieldTextModel>} fieldData
	 * @param {ITransaction} transaction
	 * @return {Promise}
	 */
	public create(fieldData: Partial<IFieldTextModel>, transaction: ITransaction): Promise<IFieldModel> {
		this.validateCreateData(fieldData);

		return this._fieldRepository.create(fieldData, transaction);
	}

	/**
	 * @param {Readonly<IFieldTextModel>} oldFieldData
	 * @param {Partial<IFieldTextModel>} fieldData
	 * @param {ITransaction} transaction
	 * @return {Promise}
	 */
	public async update(oldFieldData: Readonly<IFieldTextModel>, fieldData: IFieldTextModel, transaction: ITransaction): Promise<void> {
		this.validateUpdateData(fieldData);

		await this._fieldRepository.update(oldFieldData.id, fieldData, transaction);
	}

	/**
	 * @param {Partial<IFieldTextModel>} fieldData
	 * @return {Partial}
	 */
	public validateCreateData(fieldData: Partial<IFieldTextModel>): Partial<IFieldTextModel> {
		[fieldData.initialData, fieldData.params] = [
			FieldTextInitialDataValidator.parse(fieldData.initialData),
			FieldTextParamsValidator.parse(fieldData.params),
		];

		return fieldData;
	}

	/**
	 * @param {Partial<IFieldTextModel>} fieldData
	 * @return {Partial}
	 */
	public validateUpdateData(fieldData: Partial<IFieldTextModel>): Partial<IFieldTextModel> {
		if (_.has(fieldData, 'initialData')) {
			fieldData.initialData = FieldTextInitialDataValidator.parse(fieldData.initialData);
		}

		if (_.has(fieldData, 'params')) {
			fieldData.params = FieldTextParamsValidator.parse(fieldData.params);
		}

		return fieldData;
	}
}

