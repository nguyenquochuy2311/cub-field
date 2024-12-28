import { IContext } from '@/types/moleculer.type';
import { ServiceActionsSchema } from 'moleculer';
import { TableCreateHandler } from './table_create/table_create.handler';
import { TableCreateInputValidator } from './table_create/table_create.input';
import { TableDeleteHandler } from './table_delete/table_delete.handler';
import { TableDeleteInputValidator } from './table_delete/table_delete.input';

export const TableActions: ServiceActionsSchema = {
	'table.create': {
		rest: 'POST /table/create',
		params: TableCreateInputValidator,
		handler: (ctx: IContext) => new TableCreateHandler(ctx.locals).execute(ctx.params),
	},

	'table.delete': {
		rest: 'DELETE /table/delete/:tableID',
		params: TableDeleteInputValidator,
		handler: (ctx: IContext) => new TableDeleteHandler(ctx.locals).execute(ctx.params),
	},
};
