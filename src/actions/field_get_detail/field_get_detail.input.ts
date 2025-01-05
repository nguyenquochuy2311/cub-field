import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	fieldID: z.string().ulid(),
});

export const FieldGetDetailInputValidator = rawSchema.schema;
export type FieldGetDetailInputType = typeof rawSchema.context;
