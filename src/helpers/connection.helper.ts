import { CONFIG } from '@/configs';
import { Models } from '@/models';
import { ISequelize, ITransaction } from '@/types/sequelize.type';
import _ from 'lodash';
import mysql, { Connection } from 'mysql2/promise';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export class ConnectionHelper {
	private static CONNECTIONS = {} as Record<string, ISequelize>;

	private static defaultConfig: Readonly<SequelizeOptions> = {
		dialect: 'mysql',
		username: CONFIG.DB_USER,
		password: CONFIG.DB_PASSWORD,
		host: CONFIG.DB_HOST,
		port: CONFIG.DB_PORT,
		timezone: CONFIG.DEFAULT_TIMEZONE_SQL,
		define: {
			charset: 'utf8mb4',
			collate: 'utf8mb4_general_ci',
		},
		pool: {
			min: 0,
			max: 5,
		},
		dialectOptions: {
			ssl: {
				rejectUnauthorized: true,
			},
		},
		logging: CONFIG.NODE_ENV === 'development' ? console.log : false,
		benchmark: true,
		logQueryParameters: false,
		repositoryMode: true,
	};

	/**
	 * Parse database name
	 * @param {string} workspaceID
	 * @returns {string}
	 */
	private static _parseDBName(workspaceID: string): string {
		return `${CONFIG.DB_NAME}_${workspaceID}`;
	}

	/**
	 * Set database connection
	 * @param {string} workspaceID
	 * @returns {Promise<void>}
	 */
	static async setConnection(workspaceID: string): Promise<void> {
		const dbName = `${CONFIG.DB_NAME}_${workspaceID}`;

		if (ConnectionHelper.CONNECTIONS[dbName]) return;

		let client!: Connection;
		let sequelizeConnection!: ISequelize;

		try {
			client = await mysql.createConnection({
				host: CONFIG.DB_HOST,
				port: CONFIG.DB_PORT,
				user: CONFIG.DB_USER,
				password: CONFIG.DB_PASSWORD,
				ssl: {
					rejectUnauthorized: true,
				},
			});

			await client.connect();

			const dbExist: any = await client.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}' LIMIT 1`);

			if (dbExist[0]?.length) {
				sequelizeConnection = this._connect(dbName);
			} else {
				await client.query(`CREATE DATABASE ${dbName}`);
				sequelizeConnection = await this._connect(dbName).sync();
			}
		} catch (error) {
			sequelizeConnection?.disconnect();
			throw error;
		} finally {
			await client?.end();
		}
	}

	/**
	 * Get database connection
	 * @param {string} workspaceID
	 * @return {connection}
	 */
	static getConnection(workspaceID: string): ISequelize {
		const dbName = this._parseDBName(workspaceID);

		const conn = ConnectionHelper.CONNECTIONS[dbName];

		return conn || this._connect(dbName);
	}

	/**
	 * Connect database
	 * @param {string} dbName - Database to connect
	 * @return {connection}
	 */
	private static _connect(dbName: string): ISequelize {
		try {
			const username = this.defaultConfig.username as string;
			const password = this.defaultConfig.password as string;

			const conn = new Sequelize(dbName, username, password, this.defaultConfig) as ISequelize;

			// Declare disconnect fn
			conn.disconnect = function (): void {
				this.close();
				delete ConnectionHelper.CONNECTIONS[dbName];
			};

			// Declare create transaction fn
			conn.createTransaction = async function (options = undefined, callBack = undefined): Promise<ITransaction> {
				try {
					const transaction = (await this.transaction(options, callBack)) as ITransaction;

					transaction.safeCommit = function (): Promise<void> {
						return this.finished !== 'commit' && this.finished !== 'rollback' && this.commit();
					};

					transaction.safeRollback = function (): Promise<void> {
						return this.finished !== 'commit' && this.finished !== 'rollback' && this.rollback();
					};

					return transaction;
				} catch (error) {
					throw error;
				}
			};

			conn.addModels(_.values(Models));

			// Stored connection in global caches
			ConnectionHelper.CONNECTIONS[dbName] = conn;

			return conn;
		} catch (error) {
			throw error;
		}
	}
}
