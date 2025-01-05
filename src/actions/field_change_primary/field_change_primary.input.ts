import { ZodParams } from 'moleculer-zod-validator';
import { z } from 'zod';

const rawSchema = new ZodParams({
	id: z.string().ulid(),
});

export const FieldChangePrimaryInputValidator = rawSchema.schema;
export type FieldChangePrimaryInputType = typeof rawSchema.context;
