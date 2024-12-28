import type { ILocals } from '@/types/moleculer.type';

export abstract class ActionHandler<Input, Output = void> {
	protected locals: ILocals;

	/**
	 * Creates an instance of Handler.
	 *
	 * @constructor
	 * @param {ILocals} locals
	 */
	constructor(locals: ILocals) {
		this.locals = locals;
	}

	abstract execute(input: Input): Promise<Output>;
}
