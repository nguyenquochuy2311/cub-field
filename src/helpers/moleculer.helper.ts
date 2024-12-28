import { CONFIG } from '@/configs';
import { MOLECULER_CONFIG } from '@/configs/moleculer';
import { ORCHESTRATOR_V3 } from '@/constants/services';
import { ApiGatewayService, BullGatewayService, makeServerAdapter } from '@/services/api.gateway';
import { FieldService } from '@/services/field.service';
import type { IObject } from '@/types/_base.type';
import type { ILocals } from '@/types/moleculer.type';
import type { LoggerInstance } from 'moleculer';
import { ServiceBroker } from 'moleculer';

export class MoleculerHelper {
	private static _broker: ServiceBroker; // !IMPORTANT: This is a singleton, do not create a new instance, and must PRIVATE

	/**
	 * @return {ServiceBroker}
	 */
	static init(): void {
		MoleculerHelper._broker = new ServiceBroker(MOLECULER_CONFIG);
		MoleculerHelper._broker.createService(FieldService);

		// For dev
		if (CONFIG.NODE_ENV === 'development') {
			MoleculerHelper._broker.createService(ApiGatewayService);

			const bullGateway = MoleculerHelper._broker.createService(BullGatewayService);
			const express = require('express')();

			express.use('/', bullGateway.express());
			express.use('/queues', makeServerAdapter().getRouter());
			express.listen(+CONFIG.DEBUG_PORT + 1000);
		}
	}

	/**
	 * @return {Promise<void>}
	 */
	static async start(): Promise<void> {
		await MoleculerHelper._broker.start();
	}

	/**
	 * @return {Promise<void>}
	 */
	static async stop(): Promise<void> {
		await MoleculerHelper._broker.stop();
		MoleculerHelper._broker = undefined as any;
	}

	/**
	 * @param {string} channelName
	 * @param {IObject} payload
	 * @param {*} opts
	 * @return {void}
	 */
	static sendToQueue(channelName: string, payload: IObject, opts?: any) {
		return MoleculerHelper._broker.sendToChannel(channelName, payload, opts);
	}

	/**
	 * @return {LoggerInstance}
	 */
	static getLogger(): LoggerInstance {
		return MoleculerHelper._broker.logger;
	}

	/**
	 * @param {string} actionName
	 * @param {?*} [params]
	 * @param {?*} [opts]
	 * @returns {Promise<any>}
	 */
	static call(actionName: string, params?: any, opts?: any): Promise<any> {
		return MoleculerHelper._broker.call(actionName, params, opts);
	}

	/**
	 * @param {string} eventName
	 * @param {?*} [params]
	 * @param {?*} [opts]
	 * @returns {Promise<any>}
	 */
	static emit(eventName: string, params: any, opts?: any): any {
		return MoleculerHelper._broker.emit(eventName, params, opts);
	}
}

export class MoleculerCaller {
	private locals: Partial<ILocals>;

	/**
	 * @constructor
	 * @param {Partial<ILocals>} locals
	 */
	constructor(locals: Partial<ILocals>) {
		this.locals = locals;
	}

	/**
	 * @param {string} actionName
	 * @param {*} params
	 * @returns {Promise<any>}
	 */
	call(actionName: string, params?: any): Promise<any> {
		return MoleculerHelper.call(actionName, params, {
			meta: {
				workspaceID: this.locals.workspaceID,
				userID: this.locals.userID,
			},
		});
	}

	/**
	 * @param {string} eventName
	 * @param {*} params
	 * @param {SERVICE_NAME[]} [groups]
	 * @returns {Promise<any>}
	 */
	emit(eventName: string, params: any, groups: string[] = []): any {
		return MoleculerHelper.emit(eventName, params, {
			meta: { workspaceID: this.locals.workspaceID },
			groups: [...groups, ORCHESTRATOR_V3],
		});
	}

	/**
	 * @param {string} broadcastName
	 * @param {*} params
	 * @returns {Promise<any>}
	 */
	broadcast(broadcastName: string, params: any = {}): any {
		return MoleculerHelper.emit(broadcastName, params, {
			meta: { workspaceID: this.locals.workspaceID },
			groups: [ORCHESTRATOR_V3],
		});
	}
}
