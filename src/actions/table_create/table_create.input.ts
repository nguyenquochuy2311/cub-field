import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	tableID: z.string().ulid(),
});

export const TableCreateInputValidator = rawSchema.schema;
export type TableCreateInputType = typeof rawSchema.context;
