import neo4j from 'neo4j-driver';
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USER } from '$env/static/private';
import { v7 as uuid } from 'uuid';

export const driver = neo4j.driver(
	NEO4J_URI,
	neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
)

export type PostAndUser = {
	post: Post;
	user: User;
}

export type Post = {
	id?: string;
	title: string;
	content: string;
	createdAt?: string;
}

export type User = {
	id: string;
	name: string;
	email: string;
	image: string;
	pwHash?: string;
}

export const session = driver.session();

export async function getPosts(): Promise<{ post: Post, user: User }[]> {
	const result = await session.run(
		`MATCH (u:User)-[:POSTED]->(p:Post) RETURN p, u`
	);
	return result.records.map(record => ({
		post: record.get('p').properties,
		user: record.get('u').properties
	}));
}

export async function createPost(userEmail:string|undefined, data:Post){
	if(!userEmail){
		throw new Error('User not authenticated');
	}
	data.id = uuid();
	data.createdAt = Date.now().toLocaleString('cs-CZ');
	const result = await session.run(
		`
    MATCH (u:User {email: $userId})
    CREATE (p:Post $postData)
    CREATE (u)-[:POSTED]->(p)
    RETURN p
    `,
		{ userId: userEmail, postData: data }
	);
	return result.records[0].get('p').properties;
}