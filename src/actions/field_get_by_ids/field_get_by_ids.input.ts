import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	fieldIDs: z.array(z.string().ulid()).min(1).optional(),
});

export const FieldGetByIDsInputValidator = rawSchema.schema;
export type FieldGetByIDsInputType = typeof rawSchema.context;
