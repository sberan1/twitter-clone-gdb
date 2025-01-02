import * as db from '$lib/server/database';

export async function load() {
	return {
		posts: await db.getPosts()
	};
}