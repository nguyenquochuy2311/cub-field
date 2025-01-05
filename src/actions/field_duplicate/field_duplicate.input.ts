import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	id: z.string().ulid(),
	newFieldID: z.string().ulid(),
	name: z.string().min(0).max(80).optional(),
	isDuplicateValue: z.boolean().optional(),
});

export const FieldDuplicateInputValidator = rawSchema.schema;
export type FieldDuplicateInputType = typeof rawSchema.context;
