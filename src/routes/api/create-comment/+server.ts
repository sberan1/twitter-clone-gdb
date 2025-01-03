import * as db from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	console.log(request.body);
	const { postId, userEmail, content } = await request.json();
	const comment = await db.createComment(postId, userEmail, content);
	return json({comment}, {status: 201});
}