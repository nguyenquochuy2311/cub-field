import { FieldException } from '@/exceptions/field.exception';
import { ZodParams } from 'moleculer-zod-validator';
import { FieldDataType } from 'table-sdk';
import { z } from 'zod';

const rawSchema = new ZodParams({
	tableID: z.string().ulid(),
	name: z.string().min(1).max(255),
	dataType: z
		.number()
		.int()
		.refine(d => {
			if (!Object.values(FieldDataType).includes(d)) {
				throw FieldException.fieldInvalid('Field dataType is invalid');
			}

			return true;
		}),
	description: z.string().max(1000).optional(),
	isRequired: z.boolean().optional(),
	initialData: z.any().optional(),
	params: z.record(z.string(), z.any()).nullable().optional(),
});

export const FieldCreateInputValidator = rawSchema.schema;
export type FieldCreateInputType = typeof rawSchema.context;
