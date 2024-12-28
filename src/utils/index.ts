import { ULID } from 'ulidx';

export const parseTableID = (tableID: ULID) => `Table_${tableID}`;

export const catchError = async <T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> => {
	return promise
		.then(data => {
			return [undefined, data] as [undefined, T];
		})
		.catch(error => {
			return [error];
		});
};
