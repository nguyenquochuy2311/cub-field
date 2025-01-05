import { Exception } from './_exception';

export class FieldException extends Exception {
	/**
	 * Field not found
	 *
	 * @param {string} [message='Field not found']
	 * @returns {*}
	 */
	static fieldNotFound(message = 'Field not found') {
		return super.notFound('FIELD_NOT_FOUND', message);
	}

	/**
	 * Field is invalid
	 *
	 * @param {string} [message='Field is invalid']
	 * @returns {*}
	 */
	static fieldInvalid(message = 'Field is invalid') {
		return super.badRequest('FIELD_INVALID', message);
	}

	/**
	 * Field change primary denied
	 *
	 * @returns {*}
	 */
	static changePrimaryDenied() {
		return super.businessException('CHANGE_PRIMARY_DENIED', 'Change primary denied');
	}
}
