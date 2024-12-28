import { Exception } from './_exception';

export class FieldException extends Exception {
	/**
	 * Field is invalid
	 *
	 * @param {string} [message='Field is invalid']
	 * @returns {*}
	 */
	static fieldInvalid(message = 'Field is invalid') {
		return super.badRequest('FIELD_INVALID', message);
	}
}
