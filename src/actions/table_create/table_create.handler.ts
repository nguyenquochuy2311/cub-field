import { ActionHandler } from '@/helpers/handler.helper';
import { ILocals } from '@/types/moleculer.type';
import { TableCreateInputType } from './table_create.input';

export class TableCreateHandler extends ActionHandler<TableCreateInputType> {
	/**
	 * Creates an instance of TableCreateHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);
	}

	/**
	 * Execute create table
	 *
	 * @param {TableCreateInputType} input
	 * @returns {Promise<void>}
	 */
	async execute(input: TableCreateInputType): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
