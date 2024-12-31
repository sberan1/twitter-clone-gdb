import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import { AUTH_SECRET, AUTH_GITHUB_SECRET, AUTH_GITHUB_ID, NEO4J_PASSWORD, NEO4J_USER, NEO4J_URI} from "$env/static/private"
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
			})
		],
		secret: AUTH_SECRET,
		trustHost: true
	}
	return authOptions
})