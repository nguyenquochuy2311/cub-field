import { _RecordDataModel } from 'table-sdk';
import { IRecordMetaModel } from '../record_meta';

export type IRecordDataModel = _RecordDataModel.IRecordDataModel & {
	recordMeta: IRecordMetaModel;
};
