import { IObject } from '@/types/_base.type';
import { Job, JobsOptions, Queue, QueueOptions, Worker, WorkerOptions } from 'bullmq';
import { merge } from 'lodash';
import { Storage } from './storage.helper';

export class QueueHelper {
	static QUEUES: Record<string, Queue> = {};
	static WORKERS: Record<string, Worker> = {};

	/**
	 * Description placeholder
	 * @date 3/5/2024 - 4:08:45 PM
	 *
	 * @param {string} name
	 * @param {QueueOptions} [opts={}]
	 * @returns {*}
	 */
	static addQueue(name: string, opts?: Partial<QueueOptions>): Queue {
		const queueOptions = {
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
				removeOnComplete: true,
				removeOnFail: true,
			},
			streams: {
				events: { maxLen: 100 },
			},
		};

		const mergedOptions = merge({}, queueOptions, opts);

		QueueHelper.QUEUES[name] = new Queue(name, { ...mergedOptions, connection: Storage.getConfig() });
		QueueHelper.QUEUES[name].setGlobalConcurrency(1);

		return QueueHelper.QUEUES[name];
	}

	/**
	 * Description placeholder
	 * @date 3/6/2024 - 2:40:12 PM
	 *
	 * @static
	 * @param {string} name
	 * @param {Partial<QueueOptions>} opts
	 * @returns {*}
	 */
	static getQueue(name: string, opts?: Partial<QueueOptions>): Queue {
		if (!QueueHelper.QUEUES[name]) return QueueHelper.addQueue(name, opts);

		return QueueHelper.QUEUES[name];
	}

	/**
	 * Description placeholder
	 * @date 3/6/2024 - 10:13:49 AM
	 *
	 * @static
	 * @param {string} queueName
	 * @param {*} jobName
	 * @param {*} data
	 * @param {*} opts
	 * @returns {*}
	 */
	static addJob(queueName: string, jobName: string, data?: IObject, opts: JobsOptions = {}) {
		return QueueHelper.getQueue(queueName).add(jobName, data, {
			removeOnComplete: true,
			removeOnFail: true,
			...opts,
		});
	}

	/**
	 * Description placeholder
	 * @date 3/6/2024 - 2:46:54 PM
	 *
	 * @static
	 * @param {string} queueName
	 * @param {any} handler
	 * @param {?*} [opts]
	 * @returns {*}
	 */
	static checkWorkerRunning(queueName: string, handler: any, opts: Partial<WorkerOptions> = {}) {
		if (QueueHelper.WORKERS[queueName]) {
			return QueueHelper.WORKERS[queueName];
		}

		const worker = new Worker(queueName, (job: Job) => handler(job), {
			removeOnFail: { count: 0 },
			removeOnComplete: { count: 0 },
			...opts,
			connection: Storage.getConfig(),
		});

		QueueHelper.WORKERS[queueName] = worker;

		return worker;
	}
}
