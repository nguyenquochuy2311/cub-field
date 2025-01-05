import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	id: z.string().ulid(),
	name: z.string().min(0).max(80).optional(),
	description: z.string().min(0).max(255).nullable().optional(),
	isRequired: z.boolean().optional(),
	initialData: z.any().optional(),
	params: z.any().optional(),
});

export const FieldUpdateInputValidator = rawSchema.schema;
export type FieldUpdateInputType = typeof rawSchema.context;
