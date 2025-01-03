import neo4j from 'neo4j-driver';
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USER } from '$env/static/private';
import { v7 as uuid } from 'uuid';

export const driver = neo4j.driver(
	NEO4J_URI,
	neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

export type PostAndUser = {
	post: Post;
	user: User;
	likes?: number;
	commentCount?: number;
	liked?: boolean;
	shares?: number;
	comments?: Comment[];
};

export type Post = {
	id?: string;
	title: string;
	content: string;
	createdAt?: string;
};

export type User = {
	id: string;
	name: string;
	email: string;
	image: string;
	pwHash?: string;
};

export type Comment = {
	id?: string;
	content: string;
	createdAt?: string;
	likes?: number;
	liked?: boolean;
	user: User;
};

export async function getPosts(userEmail: string | null | undefined): Promise<
	{
		post: Post;
		user: User;
		likes: number;
		liked: boolean;
	}[]
> {
	const session = driver.session();
	try {
		const result = await session.run(
			`
      MATCH (u:User)-[:POSTED]->(p:Post)
      OPTIONAL MATCH (p)<-[l:LIKED]-()
      OPTIONAL MATCH (p)-[:HAS_COMMENT]->(c:Comment)
      OPTIONAL MATCH (p)<-[userLike:LIKED]-(currentUser:User {email: $userEmail})
      RETURN p, u, COUNT(l) AS likes, COUNT(userLike) > 0 AS liked, COUNT(c) AS commentCount
      `,
			{ userEmail }
		);
		return result.records.map((record) => ({
			post: record.get('p').properties,
			user: record.get('u').properties,
			likes: record.get('likes').toNumber(),
			liked: record.get('liked'),
			commentCount: record.get('commentCount').toNumber()
		}));
	} finally {
		await session.close();
	}
}

export async function createPost(userEmail: string | undefined, data: Post) {
	if (!userEmail) {
		throw new Error('User not authenticated');
	}
	data.id = uuid();
	data.createdAt = new Date().toLocaleString('cs-CZ');
	const session = driver.session();
	try {
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
	} finally {
		await session.close();
	}
}

export async function toggleLike(postId: string, userEmail: string, like: boolean): Promise<{ liked: boolean }> {
	const session = driver.session();
	try {
		if (like) {
			// Create a like if it doesn't exist and add the createdAt property
			await session.run(
				`
        MATCH (u:User {email: $userEmail}), (p:Post {id: $postId})
        MERGE (u)-[l:LIKED]->(p)
        ON CREATE SET l.createdAt = timestamp()
        `,
				{ userEmail, postId }
			);
			return { liked: true };
		} else {
			// Delete the like if it exists
			await session.run(
				`
        MATCH (u:User {email: $userEmail})-[l:LIKED]->(p:Post {id: $postId})
        DELETE l
        `,
				{ userEmail, postId }
			);
			return { liked: false };
		}
	} finally {
		await session.close();
	}
}

export async function getPost(postId: string | undefined, userEmail: string | null | undefined): Promise<PostAndUser | null > {
	const session = driver.session();
	if (!postId){
		return null;
	}
	try {
		const result = await session.run(
			`
      MATCH (u:User)-[:POSTED]->(p:Post {id: $postId})
      OPTIONAL MATCH (p)<-[l:LIKED]-()
      OPTIONAL MATCH (p)-[:HAS_COMMENT]->(c:Comment)
      OPTIONAL MATCH (p)<-[userLike:LIKED]-(currentUser:User {email: $userEmail})
      RETURN p, u, COUNT(l) AS likes, COUNT(userLike) > 0 AS liked, COUNT(c) AS commentCount
      `,
			{ postId, userEmail }
		);

		if (result.records.length === 0) {
			return null;
		}

		const record = result.records[0];
		return {
			post: record.get('p').properties,
			user: record.get('u').properties,
			likes: record.get('likes').toNumber(),
			liked: record.get('liked'),
			commentCount: record.get('commentCount').toNumber(),
			comments: await getComments(postId, userEmail)
		};
	} finally {
		await session.close();
	}
}

export async function createComment(postId: string, userEmail: string, content: string): Promise<Comment> {
	const session = driver.session();
	const commentId = uuid();
	const createdAt = new Date().toISOString();
	try {
		const result = await session.run(
			`
      MATCH (u:User {email: $userEmail}), (p:Post {id: $postId})
      CREATE (c:Comment {id: $commentId, content: $content, createdAt: $createdAt})
      CREATE (u)-[:COMMENTED]->(c)
      CREATE (p)-[:HAS_COMMENT]->(c)
      RETURN c, u
      `,
			{ userEmail, postId, commentId, content, createdAt }
		);
		const record = result.records[0];
		return {
			id: record.get('c').properties.id,
			content: record.get('c').properties.content,
			createdAt: record.get('c').properties.createdAt,
			user: record.get('u').properties
		};
	} finally {
		await session.close();
	}
}

export async function toggleCommentLike(commentId: string, userEmail: string, like: boolean): Promise<{ liked: boolean }> {
	const session = driver.session();
	try {
		if (like) {
			// Create a like if it doesn't exist and add the createdAt property
			await session.run(
				`
        MATCH (u:User {email: $userEmail}), (c:Comment {id: $commentId})
        MERGE (u)-[l:LIKED]->(c)
        ON CREATE SET l.createdAt = timestamp()
        `,
				{ userEmail, commentId }
			);
			return { liked: true };
		} else {
			// Delete the like if it exists
			await session.run(
				`
        MATCH (u:User {email: $userEmail})-[l:LIKED]->(c:Comment {id: $commentId})
        DELETE l
        `,
				{ userEmail, commentId }
			);
			return { liked: false };
		}
	} finally {
		await session.close();
	}
}

export async function getComments(postId: string, userEmail: string | null | undefined): Promise<Comment[]> {
	const session = driver.session();
	try {
		const result = await session.run(
			`
      MATCH (p:Post {id: $postId})-[:HAS_COMMENT]->(c:Comment)
      MATCH (u:User)-[:COMMENTED]->(c)
      OPTIONAL MATCH (c)<-[l:LIKED]-()
      OPTIONAL MATCH (c)<-[userLike:LIKED]-(currentUser:User {email: $userEmail})
      RETURN c, u, COUNT(l) AS likes, COUNT(userLike) > 0 AS liked
      ORDER BY c.createdAt DESC
      `,
			{ postId, userEmail }
		);
		return result.records.map((record) => ({
			id: record.get('c').properties.id,
			content: record.get('c').properties.content,
			createdAt: record.get('c').properties.createdAt,
			user: record.get('u').properties,
			likes: record.get('likes').toNumber(),
			liked: record.get('liked')
		}));
	} finally {
		await session.close();
	}
}