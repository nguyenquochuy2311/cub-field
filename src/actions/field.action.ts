import { IContext } from '@/types/moleculer.type';
import { ServiceActionsSchema } from 'moleculer';
import { FieldChangePrimaryHandler } from './field_change_primary/field_change_primary.handler';
import { FieldChangePrimaryInputValidator } from './field_change_primary/field_change_primary.input';
import { FieldCreateHandler } from './field_create/field_create.handler';
import { FieldCreateInputValidator } from './field_create/field_create.input';
import { FieldDeleteHandler } from './field_delete/field_delete.handler';
import { FieldDeleteInputValidator } from './field_delete/field_delete.input';
import { FieldDuplicateHandler } from './field_duplicate/field_duplicate.handler';
import { FieldDuplicateInputValidator } from './field_duplicate/field_duplicate.input';
import { FieldGetByIDsHandler } from './field_get_by_ids/field_get_by_ids.handler';
import { FieldGetByIDsInputValidator } from './field_get_by_ids/field_get_by_ids.input';
import { FieldGetDetailHandler } from './field_get_detail/field_get_detail.handler';
import { FieldGetDetailInputValidator } from './field_get_detail/field_get_detail.input';
import { FieldGetListHandler } from './field_get_list/field_get_list.handler';
import { FieldGetListInputValidator } from './field_get_list/field_get_list.input';
import { FieldUpdateHandler } from './field_update/field_update.handler';
import { FieldUpdateInputValidator } from './field_update/field_update.input';

export const FieldActions: ServiceActionsSchema = {
	'field.get-list': {
		rest: 'POST /field/get-list/:tableID',
		params: FieldGetListInputValidator,
		handler: (ctx: IContext) => new FieldGetListHandler(ctx.locals).execute(ctx.params),
	},

	'field.get-by-ids': {
		rest: 'GET /field/get-by-ids',
		params: FieldGetByIDsInputValidator,
		handler: (ctx: IContext) => new FieldGetByIDsHandler(ctx.locals).execute(ctx.params),
	},

	'field.get-detail': {
		rest: 'GET /field/get-detail/:fieldID',
		params: FieldGetDetailInputValidator,
		handler: (ctx: IContext) => new FieldGetDetailHandler(ctx.locals).execute(ctx.params),
	},

	'field.create': {
		rest: 'POST /field/create/:tableID',
		params: FieldCreateInputValidator,
		handler: (ctx: IContext) => new FieldCreateHandler(ctx.locals).execute(ctx.params),
	},

	'field.update': {
		rest: 'PUT /field/update/:id',
		params: FieldUpdateInputValidator,
		handler: (ctx: IContext) => new FieldUpdateHandler(ctx.locals).execute(ctx.params),
	},

	'field.delete': {
		rest: 'DELETE /field/delete/:tableID',
		params: FieldDeleteInputValidator,
		handler: (ctx: IContext) => new FieldDeleteHandler(ctx.locals).execute(ctx.params),
	},

	'field.duplicate': {
		rest: 'POST /field/duplicate',
		params: FieldDuplicateInputValidator,
		handler: (ctx: IContext) => new FieldDuplicateHandler(ctx.locals).execute(ctx.params),
	},

	'field.change-primary': {
		rest: 'PATCH /field/change-primary/:id',
		params: FieldChangePrimaryInputValidator,
		handler: (ctx: IContext) => new FieldChangePrimaryHandler(ctx.locals).execute(ctx.params),
	},
};
