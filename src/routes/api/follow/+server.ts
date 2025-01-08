import * as db from '$lib/server/database';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { followerEmail, followeeEmail, follow } = await request.json();
	const followStatus = await db.followUser(followerEmail, followeeEmail, follow);
	return json({ followStatus }, { status: 201 });
}