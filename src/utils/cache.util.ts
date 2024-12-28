import { get, isArray, isDate, isObject } from 'lodash';

export class CacheUtil {
	/**
	 * Generate key from object
	 *
	 * @static
	 * @param {*} obj
	 * @returns {string}
	 */
	static _generateKeyFromObject(obj: any): string {
		if (isArray(obj)) {
			return '[' + obj.map(o => this._generateKeyFromObject(o)).join('|') + ']';
		} else if (isDate(obj)) {
			return obj.valueOf().toString();
		} else if (isObject(obj)) {
			return Object.keys(obj)
				.map(key => [key, this._generateKeyFromObject(get(obj, key))].join('|'))
				.join('|');
		} else if (obj != null) {
			return obj.toString();
		} else {
			return 'null';
		}
	}
}
