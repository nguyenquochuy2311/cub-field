import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	tableID: z.string().ulid(),
});

export const TableDeleteInputValidator = rawSchema.schema;
export type TableDeleteInputType = typeof rawSchema.context;
