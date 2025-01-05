import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	tableID: z.string().ulid(),
	fieldIDs: z.array(z.string().ulid()).min(1).optional(),
});

export const FieldGetListInputValidator = rawSchema.schema;
export type FieldGetListInputType = typeof rawSchema.context;
