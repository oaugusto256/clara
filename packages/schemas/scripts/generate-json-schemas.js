const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const { zodToJsonSchema } = require('zod-to-json-schema');
const { NormalizedTransactionInputSchema, TransactionSchema } = require('../dist/schemas');

const outDir = join(__dirname, '../../../apps/api/src/generated-schemas');
mkdirSync(outDir, { recursive: true });

const normalizedTxSchema = zodToJsonSchema(NormalizedTransactionInputSchema);
const transactionSchema = zodToJsonSchema(TransactionSchema);

writeFileSync(join(outDir, 'NormalizedTransactionInput.schema.json'), JSON.stringify(normalizedTxSchema, null, 2));
writeFileSync(join(outDir, 'Transaction.schema.json'), JSON.stringify(transactionSchema, null, 2));

console.log('JSON schemas generated in', outDir);
