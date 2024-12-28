import { Context } from 'moleculer';
import { ULID } from 'ulidx';
import { LanguageEnum } from './language.type';

export interface IMeta {
	workspaceID: string;
	teamIDs: ULID[];
	userID: ULID;
	lang: LanguageEnum;
}

export interface ICompensationStore {
	meta?: string[] | Object;
	params?: string[] | Object;
	response?: string[] | Object;
}

export interface IMetaCompensate {
	compensationStore: ICompensationStore;
}

export type ILocals = {
	workspaceID: string;
	teamIDs: ULID[];
	userID: ULID;
	tokenID?: ULID;
};

export type IContext<T = undefined> = Context<T> & {
	meta: IMeta & IMetaCompensate;
	params: any;
	locals: ILocals;
};
