import { fail, json } from '@sveltejs/kit';
import * as db from '$lib/server/database';

export async function POST({ request }) {
	const { email, password, name } = await request.json();

	if (!email || !password || !name) {
		// @ts-expect-error - TS wants more than necessary
		return fail(400, { error: 'All fields are required' });
	}

	try {
		await db.createUser({ email, password, name });
		return json({ success: true }, { status: 201 });
	} catch (error) {
		console.error(error);
		// @ts-expect-error - TS wants more than necessary
		return fail(500, { error: 'Failed to create user' });
	}
}