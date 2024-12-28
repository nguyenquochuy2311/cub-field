import { Transaction } from 'sequelize';
import { Model, Sequelize, type Repository } from 'sequelize-typescript';

export interface ITransaction extends Transaction {
	safeCommit(): Promise<void>;
	safeRollback(): Promise<void>;
}

export interface ISequelize extends Sequelize {
	disconnect(): void;
	createTransaction(options?: object, callBack?: object): Promise<ITransaction>;
}

export type IRepository<M extends Model> = Repository<M>;

export interface IContextMigration {
	context: ISequelize;
}
