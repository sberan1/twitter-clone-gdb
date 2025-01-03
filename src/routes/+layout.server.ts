import type { LayoutServerLoad } from './$types';
import * as db from '$lib/server/database';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		session: session,
		posts: await db.getPosts(session?.user?.email),
		post: await db.getPost(event.params.id, session?.user?.email)
	};
};

