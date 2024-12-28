import { Storage } from '@/helpers/storage.helper';
import { CacheUtil } from '@/utils/cache.util';
import { isEmpty, pick } from 'lodash';
import { BulkCreateOptions, CreateOptions, DestroyOptions, FindOptions, Identifier, UpdateOptions, UpsertOptions, WhereOptions } from 'sequelize';
import { Repository } from './_repository';

export abstract class RepositoryCache<I> extends Repository<I> {
	protected workspaceID: string;

	/**
	 * @param  {string} workspaceID
	 */
	constructor(workspaceID: string) {
		super(workspaceID);
		this.workspaceID = workspaceID;
	}

	/**
	 * @private
	 * @param {string} key
	 * @returns {Promise<string>}
	 */
	private async _parseKey(key: string): Promise<string> {
		return `db:${this.workspaceID}:${(await super._getModel()).name}:${key}`;
	}

	/**
	 * @private
	 * @param {string} key
	 * @param {?FindOptions} [options]
	 * @param {string} [customPrefix]
	 * @returns {string}
	 */
	private _generateKeyFromOptions(key: string, options?: FindOptions, customPrefix?: string): string {
		const keyOptions = CacheUtil._generateKeyFromObject(pick(options, ['where', 'limit', 'offset', 'order']));

		return `${key}:${customPrefix ? `${customPrefix}:` : ''}${keyOptions}`;
	}

	/**
	 * @private
	 * @param {string} generateKey
	 * @param {I|I[]} data
	 * @returns {Promise<void>}
	 */
	private async _setCache(generateKey: string, data: I[] | I | null): Promise<void> {
		await Storage.setCacheValueByKey(await this._parseKey(generateKey), data || {}, { EX: 60 });
	}

	/**
	 * @private
	 * @param {string} generateKey
	 * @returns {Promise<I[]|I|{}>}
	 */
	private async _getCache(generateKey: string): Promise<I[] | I | {}> {
		return Storage.getCacheValueByKey(await this._parseKey(generateKey));
	}

	/**
	 * @private
	 * @returns {Promise<void>}
	 */
	protected async _delCache(): Promise<void> {
		const keyScans = await Storage.scanCacheKeys('*');
		if (!keyScans?.length) return;

		await Promise.all(keyScans.map((key: string) => Storage.destroyCacheByKey(key)));
	}

	/**
	 * @protected
	 * @async
	 * @param {string} key
	 * @param {FindOptions} options?
	 * @returns {Promise<I[]>}
	 */
	protected async _getAllByCache(key: string, options?: FindOptions): Promise<I[]> {
		const generateKey = this._generateKeyFromOptions(key, options);

		let result = (await this._getCache(generateKey)) as I[];

		if (!result) {
			result = await super._getAll(options);
			await this._setCache(generateKey, result);
		}

		return result;
	}

	/**
	 * @protected
	 * @async
	 * @param {string} key
	 * @param {Identifier} pk
	 * @param {FindOptions} options?
	 * @returns {Promise<I | null>}
	 */
	protected async _getByPkByCache(key: string, pk: Identifier, options?: FindOptions): Promise<I | null> {
		const generateKey = this._generateKeyFromOptions(key, options, `${pk}`);

		let result = (await this._getCache(generateKey)) as I | null;

		if (!result) {
			result = await super._getByPk(pk, options);
			await this._setCache(generateKey, result);
		}

		return isEmpty(result) ? null : result;
	}

	/**
	 * @protected
	 * @async
	 * @param {string} key
	 * @param {FindOptions} options?
	 * @returns {Promise<I | null>}
	 */
	protected async _getOneByCache(key: string, options?: FindOptions): Promise<I | null> {
		const generateKey = this._generateKeyFromOptions(key, options);

		let result = (await this._getCache(generateKey)) as I | null;

		if (!result) {
			result = await super._getOne(options);
			await this._setCache(generateKey, result);
		}

		return isEmpty(result) ? null : result;
	}

	/**
	 * @protected
	 * @async
	 * @param {*} data
	 * @param {CreateOptions} options?
	 * @returns {Promise<I>}
	 */
	protected async _createByCache(data: any, options?: CreateOptions): Promise<I> {
		const result = await super._create(data, options);

		await this._delCache();

		return result;
	}

	/**
	 * @protected
	 * @async
	 * @param {any[]} data
	 * @param {BulkCreateOptions} options?
	 * @returns {Promise<I[]>}
	 */
	protected async _bulkCreateByCache(data: any[], options?: BulkCreateOptions): Promise<I[]> {
		const result = await super._bulkCreate(data, options);

		await this._delCache();

		return result;
	}

	/**
	 * @protected
	 * @param {*} data
	 * @param {UpdateOptions} [options={ where: {} }]
	 * @returns {Promise<number>}
	 */
	protected async _updateByCache(data: any, options: UpdateOptions = { where: {} }): Promise<[affectedCount: number]> {
		const result = await super._update(data, options);

		await this._delCache();

		return result;
	}

	/**
	 * @protected
	 * @async
	 * @param {*} data
	 * @param {UpsertOptions} options?
	 * @returns {Promise<I>}
	 */
	protected async _upsertByCache(data: any, options?: UpsertOptions): Promise<I> {
		const result = await super._upsert(data, options);

		await this._delCache();

		return result;
	}

	/**
	 * @protected
	 * @param {DestroyOptions} options
	 * @returns {Promise<number>}
	 */
	protected async _deleteByCache(options: DestroyOptions & { where: WhereOptions }): Promise<number> {
		const result = await super._delete(options);

		await this._delCache();

		return result;
	}
}
