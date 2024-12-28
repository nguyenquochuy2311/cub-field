import { CONFIG } from '@/configs';
import { MoleculerHelper } from '@/helpers/moleculer.helper';
import { Storage } from '@/helpers/storage.helper';
import moment from 'moment-timezone';

export class App {
	/**
	 * Init dependencies
	 *
	 * @returns {void}
	 */
	private static async _initDependencies(): Promise<void> {
		moment.tz.setDefault(CONFIG.DEFAULT_TIMEZONE_MOMENT);

		await Storage.init();
	}

	/**
	 * Init table broker
	 *
	 * @returns {Promise<void>}
	 */
	static async init(): Promise<void> {
		MoleculerHelper.init();

		await this._initDependencies();

		await MoleculerHelper.start();
	}
}
