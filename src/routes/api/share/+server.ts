import * as db from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { userEmail, postId } = await request.json();
	const shareStatus = await db.toggleShare(postId, userEmail);
	return json({ shareStatus }, { status: 201 });
}