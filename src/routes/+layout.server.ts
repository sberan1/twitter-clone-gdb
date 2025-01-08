import type { LayoutServerLoad } from './$types';
import * as db from '$lib/server/database';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const userEmail = session?.user?.email || null;
	console.log('userEmail', userEmail);

	try {
		const posts = await db.getPosts(userEmail);

		return {
			session: session,
			posts,
		};
	} catch (error) {
		console.error(error);
		return {
			session: session,
			posts: null,
		};
	}
};