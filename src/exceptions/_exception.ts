import { Errors } from 'moleculer';

export abstract class Exception {
	/**
	 * Throw common error
	 *
	 * @private
	 * @static
	 * @param {string} message
	 * @param {number} code
	 * @param {string} key
	 * @param {*} data
	 * @return {Errors.MoleculerError}
	 */
	private static _throwError(message: string, code: number, key: string, data: any) {
		return new Errors.MoleculerError(message, code, key, data);
	}

	/**
	 * Throw internal server error
	 *
	 * @protected
	 * @static
	 * @param {message} [key]
	 * @param {string} [message]
	 * @param {*} [data=undefined]
	 * @returns {*}
	 */
	protected static internalServerError(key = 'SERVER_INTERNAL_ERROR', message = 'Server Internal Error', data = undefined) {
		return Exception._throwError(message, 500, key, data);
	}

	/**
	 * Throw bad request error
	 *
	 * @protected
	 * @static
	 * @param {message} [key]
	 * @param {string} [message]
	 * @param {*} [data=undefined]
	 * @returns {*}
	 */
	protected static badRequest(key = 'BAD_REQUEST', message = 'Bad Request', data = undefined) {
		return Exception._throwError(message, 400, key, data);
	}

	/**
	 * Throw not found error
	 *
	 * @protected
	 * @static
	 * @param {message} [key]
	 * @param {string} [message]
	 * @param {*} [data=undefined]
	 * @returns {*}
	 */
	protected static notFound(key = 'NOT_FOUND', message = 'Not Found', data = undefined) {
		return Exception._throwError(message, 404, key, data);
	}

	/**
	 * Throw unauthorized error
	 *
	 * @protected
	 * @static
	 * @param {message} [key]
	 * @param {string} [message]
	 * @param {*} [data=undefined]
	 * @returns {*}
	 */
	protected static unauthorized(key = 'UNAUTHORIZED', message = 'Unauthorized', data = undefined) {
		return Exception._throwError(message, 401, key, data);
	}

	/**
	 * Throw permission error
	 *
	 * @protected
	 * @static
	 * @param {message} [key]
	 * @param {string} [message]
	 * @param {*} [data=undefined]
	 * @returns {*}
	 */
	protected static permissionDenied(key = 'PERMISSION_DENIED', message = 'Permission Denied', data = undefined) {
		return Exception._throwError(message, 403, key, data);
	}

	/**
	 * Throw business error
	 *
	 * @protected
	 * @static
	 * @param {message} [key]
	 * @param {string} [message]
	 * @param {*} [data=undefined]
	 * @returns {*}
	 */
	protected static businessException(key = 'BUSINESS_EXCEPTION', message = 'Business Exception', data = undefined) {
		return Exception._throwError(message, 420, key, data);
	}
}
