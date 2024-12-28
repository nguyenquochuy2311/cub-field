import { Table } from 'sequelize-typescript';
import { _RecordMetaModel } from 'table-sdk';

@Table({
	modelName: 'recordMeta',
	tableName: 'RecordMetas',
	paranoid: true,
})
export class RecordMetaModel extends _RecordMetaModel.RecordMetaModel {}
