import { ActionHandler } from '@/helpers/handler.helper';
import { ILocals } from '@/types/moleculer.type';
import { TableDeleteInputType } from './table_delete.input';

export class TableDeleteHandler extends ActionHandler<TableDeleteInputType> {
	/**
	 * Creates an instance of TableDeleteHandler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		super(locals);
	}

	/**
	 * Execute delete table
	 *
	 * @param {TableDeleteInputType} input
	 * @returns {Promise<void>}
	 */
	async execute(input: TableDeleteInputType): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
