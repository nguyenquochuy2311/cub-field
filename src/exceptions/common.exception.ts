import { Exception } from './_exception';

export class CommonException extends Exception {
	/**
	 * Unauthorized
	 *
	 * @static
	 * @returns {*}
	 */
	static unauthorized() {
		return super.unauthorized();
	}
}
