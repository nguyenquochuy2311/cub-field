import { Exception } from './_exception';

export class TableException extends Exception {
	/**
	 * Table is already existed
	 *
	 * @static
	 * @returns {*}
	 */
	static tableExisted() {
		return super.badRequest('TABLE_EXISTED');
	}

	/**
	 * Table is not found
	 *
	 * @static
	 * @returns {*}
	 */
	static tableNotFound() {
		return super.badRequest('TABLE_NOT_FOUND');
	}
}
