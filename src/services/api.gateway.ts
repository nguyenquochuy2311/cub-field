import { CONFIG } from '@/configs';
import { QueueHelper } from '@/helpers/queue.helper';
import { LanguageEnum } from '@/types/language.type';
import { IContext } from '@/types/moleculer.type';
import { map } from 'lodash';
import { ServiceSchema } from 'moleculer';
import { ULID } from 'ulidx';

export const makeServerAdapter = () => {
	const bullBoard = require('bull-board');

	const serverAdapter = new bullBoard.ExpressAdapter();

	bullBoard.createBullBoard({
		queues: map(QueueHelper.QUEUES, queue => new bullBoard.BullMQAdapter(queue)),
		serverAdapter,
	});

	serverAdapter.setBasePath('/queues');
	return serverAdapter;
};

export const BullGatewayService: ServiceSchema = {
	name: 'queues',

	mixins: [require('moleculer-web')],

	settings: {
		server: false,
		routes: [
			{
				autoAliases: true,
			},
		],
	},
};

export const ApiGatewayService: ServiceSchema = {
	name: CONFIG.NAMESPACE,

	mixins: [require('moleculer-web')],

	settings: {
		port: CONFIG.DEBUG_PORT,

		routes: [
			{
				autoAliases: true,

				onBeforeCall(ctx: IContext, route: any, req: any): void {
					const { workspaceid, userid, lang } = req.headers;

					ctx.meta.workspaceID = workspaceid as string;
					ctx.meta.userID = userid as ULID;
					ctx.meta.lang = lang as LanguageEnum;
				},
			},
		],
	},
};
