import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { NormalizedTransactionInputSchema, TransactionSchema } from '../src/schemas';

function unwrapZodEffects(schema: any) {
	// If schema is a ZodEffects, unwrap to get the base schema
	if (schema._def && schema._def.schema) {
		return schema._def.schema;
	}
	return schema;
}

const outDir = join(__dirname, '../../../apps/api/src/generated-schemas');
mkdirSync(outDir, { recursive: true });

const normalizedTxSchema = zodToJsonSchema(unwrapZodEffects(NormalizedTransactionInputSchema));
const transactionSchema = zodToJsonSchema(unwrapZodEffects(TransactionSchema));

writeFileSync(join(outDir, 'NormalizedTransactionInput.schema.json'), JSON.stringify(normalizedTxSchema, null, 2));
writeFileSync(join(outDir, 'Transaction.schema.json'), JSON.stringify(transactionSchema, null, 2));

console.log('JSON schemas generated in', outDir);
