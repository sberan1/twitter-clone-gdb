import * as db from '$lib/server/database';

export const load = async ({ params, locals, parent}) => {
	const isLoaded = await parent();
	const session = await locals.auth();
	const userEmail = session?.user?.email;
	console.log('userEmail v 2' , userEmail);

	return {
		post: await db.getPost(params.id, userEmail)
	}
}