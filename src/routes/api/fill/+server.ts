import { json } from '@sveltejs/kit';
import { fillDatabaseWithDummyData } from '$lib/server/fillDatabase';

export async function POST() {
	try {
		await fillDatabaseWithDummyData();
		return json({ message: 'Database filled with dummy data successfully' });
	} catch (error) {
		return json({ error: 'Failed to fill database with dummy data', details: error.message }, { status: 500 });
	}
}