
export type SimpleTransaction = {
	date: string;
	title: string;
	amount: number;
};

export const defaultKeywordCategoryMap: Record<string, string> = {
	'ifood': 'food',
	'supermerc': 'food',
	'atacadista': 'food',
	'spotify': 'subscriptions',
	'amazon': 'subscriptions',
	'mercadolivre': 'leisure',
	'posto': 'transport',
	'airbnb': 'leisure',
	'colchoes': 'housing',
	'fort': 'food',
	'bobs': 'food',
	'park': 'transport',
	'conta vivo': 'subscriptions',
	'latam': 'transport',
	'dm*spotify': 'subscriptions',
	'black box': 'leisure',
	'engenho': 'food',
	'restaurant': 'food',
	'pizza': 'food',
	'gelatiera': 'food',
	// Add more as needed
};

export function categorizeTransactions(
	transactions: SimpleTransaction[],
	keywordCategoryMap: Record<string, string> = defaultKeywordCategoryMap
): Array<SimpleTransaction & { categoryKey: string }> {
	return transactions.map(tx => {
		const titleLower = tx.title.toLowerCase();
		const found = Object.entries(keywordCategoryMap).find(([keyword]) => titleLower.includes(keyword));
		const matchedCategoryKey = found ? found[1] : 'other';
		return { ...tx, categoryKey: matchedCategoryKey };
	});
}
