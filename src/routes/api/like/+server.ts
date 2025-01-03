import * as db from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { userEmail, postId, like } = await request.json();
	const likeStatus = await db.toggleLike(postId, userEmail, like);
	return json({likeStatus}, {status: 201});
}