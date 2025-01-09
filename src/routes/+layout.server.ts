import type { LayoutServerLoad } from './$types';
import * as db from '$lib/server/database';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const userEmail = session?.user?.email || null;


	try {
		const posts = await db.getPosts(userEmail);
		const allPosts = await db.getAllPosts();

		return {
			session: session,
			posts,
			allPosts
		};
	} catch (error) {
		console.error(error);
		return {
			session: session,
			posts: null,
			allPosts: null
		};
	}
};