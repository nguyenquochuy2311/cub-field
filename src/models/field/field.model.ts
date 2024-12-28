import { Table } from 'sequelize-typescript';
import { _FieldModel } from 'table-sdk';

@Table({
	modelName: 'field',
	tableName: 'Fields',
	paranoid: true,
})
export class FieldModel extends _FieldModel.FieldModel {}
