import { TableActions } from '@/actions/table.action';
import { CommonException } from '@/exceptions/common.exception';
import { ConnectionHelper } from '@/helpers/connection.helper';
import { DefaultLanguage } from '@/types/language.type';
import { IContext } from '@/types/moleculer.type';
import { ServiceSchema } from 'moleculer';
import { ULID } from 'ulidx';

export const FieldService: ServiceSchema = {
	name: 'FIELD_3',

	hooks: {
		before: {
			'*': async (ctx: IContext) => {
				if (!ctx.meta.workspaceID) {
					throw CommonException.unauthorized();
				}

				await ConnectionHelper.setConnection(ctx.meta.workspaceID);

				ctx.locals = {
					workspaceID: ctx.meta.workspaceID,
					teamIDs: ctx.meta.teamIDs as ULID[],
					userID: ctx.meta.userID as ULID,
					lang: ctx.meta.lang || DefaultLanguage,
				};
			},
		},
	},

	actions: {
		...TableActions,
	},
};
