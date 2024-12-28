import { type Model, ModelAttributeColumnOptions } from 'sequelize';
import { _RecordDataModel } from 'table-sdk';

export const RecordDataColumn = (fieldIDs: string[]): Record<string, ModelAttributeColumnOptions<Model<any, any>>> => {
	return _RecordDataModel.RecordDataColumn(fieldIDs);
};
