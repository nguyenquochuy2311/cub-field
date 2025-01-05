import { IFieldModel } from '@/models';
import { ITransaction } from '@/types/sequelize.type';

export interface IFieldFactory<T extends IFieldModel> {
	create(fieldData: Partial<T>, transaction?: ITransaction): Promise<IFieldModel>;
	update(oldFieldData: Readonly<T>, fieldData: T, transaction?: ITransaction): Promise<void>;
	validateCreateData(fieldData: Partial<T>): Partial<T> | Promise<Partial<T>> | any;
	validateUpdateData(oldFieldData: Readonly<T>, fieldData: Partial<T>): Partial<T> | Promise<Partial<T>> | any;
	healingCells?(oldField: Readonly<T>, newField: Partial<T>, transaction?: ITransaction): Promise<void>;
}
