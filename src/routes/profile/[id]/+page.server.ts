import * as db from '$lib/server/database';

export const load = async ({ params, locals, parent}) => {
	const isLoaded = await parent();
	const session = await locals.auth();
	const userEmail = session?.user?.email;


	return {
		userInfo: await db.getUserInfo(userEmail, params.id)
	}
}