import { CONFIG } from '@/configs';
import { IObject } from '@/types/_base.type';
import _ from 'lodash';
import { RedisClientType, SetOptions, createClient } from 'redis';
import { MoleculerHelper } from './moleculer.helper';

export type RedisMultiType = ReturnType<RedisClientType['multi']>;

export class Storage {
	private static redisClient: RedisClientType;

	/**
	 * Description placeholder
	 * @date 3/5/2024 - 4:06:25 PM
	 *
	 * @public
	 * @static
	 * @returns {any}
	 */
	public static getConfig() {
		return {
			host: CONFIG.REDIS_HOST,
			port: Number(CONFIG.REDIS_PORT),
		};
	}

	/**
	 * Initialize caching
	 * @return {void}
	 */
	public static async init(): Promise<void> {
		Storage.redisClient = createClient({
			socket: Storage.getConfig(),
		});

		Storage.redisClient.on('ready', () => {
			MoleculerHelper.getLogger().info('Redis connected');
		});

		Storage.redisClient.on('error', err => {
			MoleculerHelper.getLogger().info('Redis error', err);
		});

		await Storage.redisClient?.connect();
	}

	/**
	 * Get storage client
	 * @return {RedisClientType}
	 */
	public static async getStorageClient(): Promise<RedisClientType> {
		if (!Storage.redisClient) {
			await Storage.init();
		}

		return Storage.redisClient;
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {IObject|IObject[]} cacheValue
	 * @param {SetOptions} options
	 * @returns {Promise<string | null>}
	 */
	public static async setCacheValueByKey(cacheKey: string, cacheValue: IObject | IObject[], options: SetOptions = {}): Promise<string | null> {
		if (!('EX' in options)) {
			_.assign(options, { KEEPTTL: true });
		}

		const data = (await Storage.getStorageClient()).set(cacheKey, JSON.stringify(cacheValue), options);

		return data;
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {number} seconds
	 * @param { 'NX' | 'XX' | 'GT' | 'LT'} [mode]
	 * @returns {Promise<string | null>}
	 */
	public static async setCacheExpire(cacheKey: string, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT') {
		return (await Storage.getStorageClient()).expire(cacheKey, seconds, mode);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @returns {Promise<any | null>}
	 */
	public static async getCacheValueByKey(cacheKey: string): Promise<any | null> {
		const cacheValue = await (await Storage.getStorageClient()).get(cacheKey);

		return cacheValue && JSON.parse(cacheValue);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @returns {Promise<number>}
	 */
	public static async checkCacheByKey(cacheKey: string) {
		return (await Storage.getStorageClient()).exists(cacheKey);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @returns {Promise<void>}
	 */
	public static async destroyCacheByKey(cacheKey: string): Promise<number> {
		return (await Storage.getStorageClient()).del(cacheKey);
	}

	/**
	 * Increment cache value by
	 * @param {string} cacheKey
	 * @param {number} increaseNumber
	 * @returns {Promise<number>}
	 */
	public static async incrementCacheValue(cacheKey: string, increaseNumber = 0) {
		return (await Storage.getStorageClient()).incrBy(cacheKey, increaseNumber);
	}

	/**
	 * Scan for exist key
	 * @param {string} pattern
	 * @returns {Promise<number>}
	 */
	public static async scanCacheKeys(pattern: string) {
		const keys = [];
		const options = {
			MATCH: pattern,
		};

		for await (const key of (await Storage.getStorageClient()).scanIterator(options)) {
			keys.push(key);
		}

		return keys;
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @returns {Promise<number>}
	 */
	public static async getAllHashField(cacheKey: string): Promise<IObject> {
		return (await Storage.getStorageClient()).hGetAll(cacheKey);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @returns {Promise<number>}
	 */
	public static async getAllHashKeys(cacheKey: string) {
		return (await Storage.getStorageClient()).hKeys(cacheKey);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} cacheField
	 * @returns {Promise<number>}
	 */
	public static async getValueHashField(cacheKey: string, cacheField: string): Promise<any | undefined> {
		const result = await (await Storage.getStorageClient()).hGet(cacheKey, cacheField);

		return result ? JSON.parse(result) : result;
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} cacheField
	 * @param {any} cacheValue
	 * @returns {Promise<number>}
	 */
	public static async setHashValue(cacheKey: string, cacheField: string, cacheValue: any): Promise<number> {
		return (await Storage.getStorageClient()).hSet(cacheKey, cacheField, JSON.stringify(cacheValue));
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} cacheField
	 * @returns {Promise<number>}
	 */
	public static async checkHashExists(cacheKey: string, cacheField: string): Promise<boolean> {
		return (await Storage.getStorageClient()).hExists(cacheKey, cacheField);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} cacheField
	 * @param {number} increaseNumber
	 * @returns {Promise<number>}
	 */
	public static async increaseHashValue(cacheKey: string, cacheField: string, increaseNumber: number): Promise<number> {
		return (await Storage.getStorageClient()).hIncrBy(cacheKey, cacheField, increaseNumber);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} cacheField
	 * @returns {Promise<number>}
	 */
	public static async isHashFieldExist(cacheKey: string, cacheField: string): Promise<boolean> {
		return (await Storage.getStorageClient()).hExists(cacheKey, cacheField);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} cacheField
	 * @returns {Promise<void>}
	 */
	public static async delHashField(cacheKey: string, cacheField: string): Promise<number> {
		return (await Storage.getStorageClient()).hDel(cacheKey, cacheField);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @returns {Promise<string[]>}
	 */
	public static async getAllHashValue(cacheKey: string): Promise<any[]> {
		const results = await (await Storage.getStorageClient()).hVals(cacheKey);

		const parseResult = results?.map(result => JSON.parse(result));

		return parseResult;
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {any} cacheValue
	 * @param {SetOptions} options
	 * @returns {Promise<string | null>}
	 */
	public static async increaseLastIndex(cacheKey: string, cacheValue: number): Promise<number> {
		return (await Storage.getStorageClient()).incrBy(cacheKey, cacheValue);
	}

	/**
	 * Description
	 * @param {string} cacheKey
	 * @param {string} numberReset
	 * @returns {Promise<string | null>}
	 */
	public static async resetLastIndex(cacheKey: string, numberReset = '0'): Promise<string | null> {
		return (await Storage.getStorageClient()).getSet(cacheKey, numberReset);
	}
}
