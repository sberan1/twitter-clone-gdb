import neo4j from 'neo4j-driver';
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USER } from '$env/static/private';
import { v7 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';


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
	shared?: boolean;
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
		shares: number;
		shared: boolean;
		commentCount: number;
	}[] | null
> {
	if (!userEmail) {
		return null;
	}
	const result = await driver.executeQuery(
`
	MATCH (n:User {email: $userEmail})-[:FOLLOWS]->(followed)-[:FOLLOWS]->(recommended)     
	WHERE NOT exists((n)-[:FOLLOWS]->(recommended)) AND n <> recommended     
	WITH n, recommended, collect(followed) AS recommendedBy, count(*) AS numberOfRecommendations    
	 ORDER BY numberOfRecommendations DESC     
	 MATCH (recommended)-[:POSTED|SHARED]->(p:Post)     
	 OPTIONAL MATCH (p)<-[l:LIKED]-()     
	 OPTIONAL MATCH (p)-[:HAS_COMMENT]->(c:Comment)     
	 OPTIONAL MATCH (p)<-[userLike:LIKED]-(currentUser:User {email: $userEmail})     
	 OPTIONAL MATCH (p)<-[s:SHARED]-()     
	 OPTIONAL MATCH (p)<-[userShare:SHARED]-(currentUser:User {email: $userEmail})     
	 RETURN p, recommended, COUNT(DISTINCT(l)) AS likes, COUNT(userLike) > 0 AS liked, COUNT(DISTINCT(c)) AS commentCount, COUNT(DISTINCT(s)) AS shares, COUNT(userShare) > 0 AS shared   `,
  { userEmail }
);

return result.records.map((record) => ({
  post: record.get('p').properties,
  user: record.get('recommended').properties,
  likes: record.get('likes').toNumber(),
  liked: record.get('liked'),
  commentCount: record.get('commentCount').toNumber(),
  shares: record.get('shares').toNumber(),
  shared: record.get('shared')
}));
}

export async function createPost(userEmail: string | undefined, data: Post) {
	if (!userEmail) {
		throw new Error('User not authenticated');
	}
	data.id = uuid();
	data.createdAt = new Date().toLocaleString('cs-CZ');

		const result = await driver.executeQuery(
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

export async function toggleLike(postId: string, userEmail: string, like: boolean): Promise<{ liked: boolean }> {
		if (like) {
			// Create a like if it doesn't exist and add the createdAt property
			await driver.executeQuery(
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
			await driver.executeQuery(
				`
        MATCH (u:User {email: $userEmail})-[l:LIKED]->(p:Post {id: $postId})
        DELETE l
        `,
				{ userEmail, postId }
			);
			return { liked: false };
		}
}

export async function getPost(postId: string | undefined, userEmail: string | null | undefined): Promise<PostAndUser | null>  {
	if (!postId){
		return null;
	}

	if (!userEmail){
		userEmail = null;
	}
	const result = await driver.executeQuery(
		`
      MATCH (u:User)-[:POSTED]->(p:Post {id: $postId})
      OPTIONAL MATCH (p)<-[l:LIKED]-()
      OPTIONAL MATCH (p)-[:HAS_COMMENT]->(c:Comment)
      OPTIONAL MATCH (p)<-[userLike:LIKED]-(currentUser:User {email: $userEmail})
      OPTIONAL MATCH (p)<-[s:SHARED]-()
      OPTIONAL MATCH (p)<-[userShare:SHARED]-(currentUser:User {email: $userEmail})
      RETURN p, u, COUNT(DISTINCT(l)) AS likes, COUNT(userLike) > 0 AS liked, COUNT(DISTINCT(c)) AS commentCount, COUNT(DISTINCT(s)) AS shares, COUNT(userShare) > 0 AS shared
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
		shares: record.get('shares').toNumber(),
		shared: record.get('shared'),
		comments: await getComments(postId, userEmail)
	};
}

export async function createComment(postId: string, userEmail: string, content: string): Promise<Comment> {
	const commentId = uuid();
	const createdAt = new Date().toISOString();
		const result = await driver.executeQuery(
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

}

export async function toggleCommentLike(commentId: string, userEmail: string, like: boolean): Promise<{ liked: boolean }> {
		if (like) {
			// Create a like if it doesn't exist and add the createdAt property
			await driver.executeQuery(
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
			await driver.executeQuery(
				`
        MATCH (u:User {email: $userEmail})-[l:LIKED]->(c:Comment {id: $commentId})
        DELETE l
        `,
				{ userEmail, commentId }
			);
			return { liked: false };
		}
}

export async function getComments(postId: string, userEmail: string | null | undefined): Promise<Comment[]> {

		const result = await driver.executeQuery(
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
}

	export async function createUser({ email, password, name }: { email: string; password: string; name: string }) {
		const hashedPassword = await bcrypt.hash(password, 10);
		const result = await driver.executeQuery(
				`
      CREATE (u:User {id: $id, email: $email, name: $name, pwHash: $pwHash})
      RETURN u
      `,
				{ id: uuid(), email, name, pwHash: hashedPassword }
			);
			return result.records[0].get('u').properties;

	}

export async function toggleShare(postId: string, userEmail: string): Promise<{ shared: boolean }> {
	const result = await driver.executeQuery(
		`
        MATCH (u:User {email: $userEmail}), (p:Post {id: $postId})
        OPTIONAL MATCH (u)-[s:SHARED]->(p)
        WITH u, p, s
        WHERE s IS NULL
        CREATE (u)-[:SHARED]->(p)
        RETURN COUNT(s) = 0 AS shared
        `,
		{ userEmail, postId }
	);

	return { shared: result.records[0].get('shared') };
}

export async function followUser(followerEmail: string, followeeEmail: string, follow: boolean): Promise<{ followed: boolean }> {
	if (follow) {
		// Create a follow relationship if it doesn't exist
		await driver.executeQuery(
			`
            MATCH (follower:User {email: $followerEmail}), (followee:User {email: $followeeEmail})
            MERGE (follower)-[r:FOLLOWS]->(followee)
            `,
			{ followerEmail, followeeEmail }
		);
		return { followed: true };
	} else {
		// Delete the follow relationship if it exists
		await driver.executeQuery(
			`
            MATCH (follower:User {email: $followerEmail})-[r:FOLLOWS]->(followee:User {email: $followeeEmail})
            DELETE r
            `,
			{ followerEmail, followeeEmail }
		);
		return { followed: false };
	}
}

export async function getUserInfo(
	currentUserEmail: string | null | undefined,
	userId: string | null | undefined
): Promise<{
	user: User,
	following: boolean
} | null> {
	if (!userId || !currentUserEmail) {
		return null;
	}
	const result = await driver.executeQuery(
		`
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)<-[f:FOLLOWS]-(currentUser:User {email: $currentUserEmail})
        RETURN u, COUNT(f) > 0 AS following
        `,
		{ userId, currentUserEmail }
	);

	if (result.records.length === 0) {
		return null;
	}

	return {
		user: result.records[0].get('u').properties,
		following: result.records[0].get('following')
	};
}