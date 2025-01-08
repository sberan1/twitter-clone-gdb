import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import Discord from "@auth/sveltekit/providers/discord"
import Credentials from "@auth/sveltekit/providers/credentials"
import { AUTH_SECRET, AUTH_GITHUB_SECRET, AUTH_GITHUB_ID, AUTH_DISCORD_ID, AUTH_DISCORD_SECRET} from "$env/static/private"
import { driver } from "$lib/server/database"
import { Neo4jAdapter} from '@auth/neo4j-adapter'
import { v4 as uuid } from 'uuid'
import * as bcrypt from 'bcrypt'


const neo4jSession = driver.session();
const adapter = Neo4jAdapter(neo4jSession);

export const { handle, signIn, signOut } = SvelteKitAuth(async () => {
	const authOptions = {
		adapter: adapter,
		providers: [
			GitHub({
				clientId: AUTH_GITHUB_ID,
				clientSecret: AUTH_GITHUB_SECRET
			}),
			Discord({
				clientId: AUTH_DISCORD_ID,
				clientSecret: AUTH_DISCORD_SECRET
			}),
			Credentials({
				credentials: {
					email: { label: "Email", type: "email" },
					password: { label: "Password", type: "password" }
				},
				authorize: async (credentials) => {
					if (!credentials) {
						throw new Error("No credentials provided");
					}

					const { email, password } = credentials;

					if (!email || !password) {
						throw new Error('Email and password are required');
					}


					const user = await getUserFromDb(email, password);

					if (!user) {
						throw new Error("Invalid credentials");
					}

					return user;
				},
			}),
		],
		callbacks:{

		},
		jwt: {
			//@ts-expect-error - too lazy tot type this
			encode: async (params)=> {
					console.log(params);
					const sessionToken = uuid();

					if (!params.token.sub) {
						throw new Error("No user id provided");
					}

					const createdSession = await adapter.createSession({
						sessionToken: sessionToken,
						userId: params.token.sub,
						expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
					});

					console.log(createdSession);

					if (!createdSession) {
						throw new Error("Failed to create session");
					}

					return sessionToken;
			}
		},
		secret: AUTH_SECRET,
		trustHost: true
	}
	return authOptions
})


async function getUserFromDb(email, pwHash) {
	// logic to verify if the user exists

	const result = await driver.executeQuery(
		'MATCH (u:User {email: $email}) RETURN u',
		{ email }
	);
	if (result.records.length === 0) {
		return null;
	}
	const user = result.records[0].get('u').properties;
	if (!await bcrypt.compare(pwHash, user.pwHash)) {
		return null;
	}
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		pwHash: user.pwHash
	}

}