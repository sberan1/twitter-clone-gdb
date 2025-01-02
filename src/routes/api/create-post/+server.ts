import { json } from '@sveltejs/kit';
import * as db from '$lib/server/database';

export async function POST({ request }) {
	const { userEmail, title, content } = await request.json();
	const post = await db.createPost(userEmail, { title, content });
	return json({post}, {status: 201});
}