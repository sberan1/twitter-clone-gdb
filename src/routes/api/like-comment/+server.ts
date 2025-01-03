import * as db from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { userEmail, commentId, like } = await request.json();
	const likeStatus = await db.toggleCommentLike(commentId, userEmail, like);
	return json({likeStatus}, {status: 201});
}