import { IContext } from '@/types/moleculer.type';
import { ServiceActionsSchema } from 'moleculer';
import { FieldCreateHandler } from './field_create/field_create.handler';
import { FieldCreateInputValidator } from './field_create/field_create.input';
import { FieldDeleteHandler } from './field_delete/field_delete.handler';
import { FieldDeleteInputValidator } from './field_delete/field_delete.input';

export const FieldActions: ServiceActionsSchema = {
	'field.create': {
		params: FieldCreateInputValidator,
		handler: (ctx: IContext) => new FieldCreateHandler(ctx.locals).execute(ctx.params),
	},

	'field.delete': {
		params: FieldDeleteInputValidator,
		handler: (ctx: IContext) => new FieldDeleteHandler(ctx.locals).execute(ctx.params),
	},
};
