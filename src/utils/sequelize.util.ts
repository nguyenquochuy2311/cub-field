import { DataType } from 'sequelize-typescript';
import { isValid, ulid } from 'ulidx';

export const primaryUlidID = {
	type: DataType.STRING(26),
	defaultValue: (): string => ulid(),
	validate: {
		isValidULID(value: any): boolean {
			return isValid(value);
		},
	},
};
