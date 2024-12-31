import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import Discord from "@auth/sveltekit/providers/discord"
import Credentials from "@auth/sveltekit/providers/credentials"
import { AUTH_SECRET, AUTH_GITHUB_SECRET, AUTH_GITHUB_ID, NEO4J_PASSWORD, NEO4J_USER, NEO4J_URI, AUTH_DISCORD_ID, AUTH_DISCORD_SECRET} from "$env/static/private"
import neo4j from "neo4j-driver"
import { Neo4jAdapter} from '@auth/neo4j-adapter'


const driver = neo4j.driver(
	NEO4J_URI,
	neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
)

const neo4jSession = driver.session();
export const { handle, signIn, signOut } = SvelteKitAuth(async () => {
	const authOptions = {
		adapter: Neo4jAdapter(neo4jSession),
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
					name: {},
					email: {},
					password: {},
				},
				authorize: async (credentials) => {
					if (!credentials) {
						throw new Error("No credentials provided");
					}

					const { email, password, name } = credentials;

					if (!email || !password) {
						throw new Error("Email and password are required");
					}

					const pwHash = saltAndHashPassword(password);

					let user = await getUserFromDb(email, pwHash);

					if (!user) {
						user = await registerUser(email, name, pwHash);
					}

					if (!user) {
						throw new Error("Invalid credentials");
					}

					return user;
				}
			})
		],
		secret: AUTH_SECRET,
		trustHost: true
	}
	return authOptions
})

function saltAndHashPassword(password: string) {
	// logic to salt and hash password
	return password
}

async function getUserFromDb(email, pwHash) {
	// logic to verify if the user exists
	const result = await neo4jSession.run(
		'MATCH (u:User {email: $email, pwHash: $pwHash}) RETURN u',
		{ email, pwHash }
	);
	if (result.records.length === 0) {
		return null;
	}
	const user = result.records[0].get('u').properties;
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	}
}

async function registerUser(email, name, pwHash) {
	// logic to create a new user
	const result = await neo4jSession.run(
		'CREATE (u:User {email: $email, name: $name, pwHash: $pwHash}) RETURN u',
		{ email, name, pwHash }
	);

	if (result.records.length === 0) {
		throw new Error('User registration failed');
	}

	const user = result.records[0].get('u').properties;
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	}
}