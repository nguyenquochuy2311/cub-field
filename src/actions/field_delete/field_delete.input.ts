import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	tableID: z.string().ulid(),
	fieldIDs: z.array(z.string().ulid()).min(1).max(100),
});

export const FieldDeleteInputValidator = rawSchema.schema;
export type FieldDeleteInputType = typeof rawSchema.context;
