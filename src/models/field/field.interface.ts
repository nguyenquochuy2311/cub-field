import { _FieldModel, FieldDataType } from 'table-sdk';

export type IFieldModel = _FieldModel.IFieldModel;
export type IFieldData = _FieldModel.IFieldData;

export enum FieldTypeEnum {
	TEXT = FieldDataType.TEXT,
	CHECKBOX = FieldDataType.CHECKBOX,
	PARAGRAPH = FieldDataType.PARAGRAPH,
	ATTACHMENT = FieldDataType.ATTACHMENT,
	DROPDOWN = FieldDataType.DROPDOWN,
	NUMBER = FieldDataType.NUMBER,
	DATE = FieldDataType.DATE,
	PHONE = FieldDataType.PHONE,
	WEBSITE = FieldDataType.WEBSITE,
	EMAIL = FieldDataType.EMAIL,
	CURRENCY = FieldDataType.CURRENCY,
	PEOPLE = FieldDataType.PEOPLE,
	RATING = FieldDataType.RATING,
	PROGRESS = FieldDataType.PROGRESS,
	REFERENCE = FieldDataType.REFERENCE,
	FORMULA = FieldDataType.FORMULA,
	LOOKUP = FieldDataType.LOOKUP,
	LAST_MODIFIED_BY = FieldDataType.LAST_MODIFIED_BY,
	LAST_MODIFIED_TIME = FieldDataType.LAST_MODIFIED_TIME,
	CREATED_BY = FieldDataType.CREATED_BY,
	CREATED_TIME = FieldDataType.CREATED_TIME,
	AUTO_NUMBER = FieldDataType.AUTO_NUMBER,
}
