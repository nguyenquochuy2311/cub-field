import { Table } from 'sequelize-typescript';
import { _RecordMetaModel } from 'table-sdk';

@Table({
	modelName: 'recordMeta',
	tableName: 'RecordMetas',
	timestamps: false,
	paranoid: true,
})
export class RecordMetaModel extends _RecordMetaModel.RecordMetaModel {}
