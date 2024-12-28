import { IContext } from '@/types/moleculer.type';
import { ServiceActionsSchema } from 'moleculer';
import { FieldCreateHandler } from './field_create/field_create.handler';
import { FieldCreateInputValidator } from './field_create/field_create.input';
import { FieldDeleteHandler } from './field_delete/field_delete.handler';
import { FieldDeleteInputValidator } from './field_delete/field_delete.input';
import { FieldListHandler } from './field_list/field_list.handler';
import { FieldListInputValidator } from './field_list/field_list.input';

export const FieldActions: ServiceActionsSchema = {
	'field.list': {
		rest: 'POST /field/list/:tableID',
		params: FieldListInputValidator,
		handler: (ctx: IContext) => new FieldListHandler(ctx.locals).execute(ctx.params),
	},

	'field.create': {
		rest: 'POST /field/create/:tableID',
		params: FieldCreateInputValidator,
		handler: (ctx: IContext) => new FieldCreateHandler(ctx.locals).execute(ctx.params),
	},

	'field.delete': {
		rest: 'DELETE /field/delete/:tableID',
		params: FieldDeleteInputValidator,
		handler: (ctx: IContext) => new FieldDeleteHandler(ctx.locals).execute(ctx.params),
	},
};
