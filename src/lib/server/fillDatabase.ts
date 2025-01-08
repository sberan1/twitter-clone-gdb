import { v7 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as db from '$lib/server/database';

export async function fillDatabaseWithDummyData() {
	try {
		// Create random dummy users
		const userCount = 10;
		const users = [];
		for (let i = 1; i <= userCount; i++) {
			users.push({
				email: `user${i}@example.com`,
				name: `User ${i}`,
				password: `password${i}`
			});
		}

		for (const user of users) {
			await db.createUser({ email: user.email, password: user.password, name: user.name });
		}

		// Create random dummy posts
		const postCount = 30;
		const posts = [];
		for (let i = 1; i <= postCount; i++) {
			const userIndex = Math.floor(Math.random() * userCount);
			posts.push({
				title: `Post ${i}`,
				content: `Content of post ${i}`,
				userEmail: users[userIndex].email
			});
		}

		for (const post of posts) {
			await db.createPost(post.userEmail, { title: post.title, content: post.content });
		}

		// Retrieve all posts
		const allPosts = await db.getPosts('stepan.beran@outlook.com');

		// Create random follow relationships
		const followCount = 20;
		const follows = [];
		for (let i = 0; i < followCount; i++) {
			const followerIndex = Math.floor(Math.random() * userCount);
			let followeeIndex = Math.floor(Math.random() * userCount);
			while (followeeIndex === followerIndex) {
				followeeIndex = Math.floor(Math.random() * userCount);
			}
			follows.push({
				followerEmail: users[followerIndex].email,
				followeeEmail: users[followeeIndex].email
			});
		}

		for (const follow of follows) {
			await db.followUser(follow.followerEmail, follow.followeeEmail, true);
		}

		if (allPosts === null) {
			throw new Error('allPosts is null');
		}

		// Create random likes
		for (const post of allPosts) {
			const likeCount = Math.floor(Math.random() * userCount);
			for (let i = 0; i < likeCount; i++) {
				const userIndex = Math.floor(Math.random() * userCount);
				await db.toggleLike(post.post.id, users[userIndex].email, true);
			}
		}

		// Create random comments
		const commentCount = 50;
		for (let i = 0; i < commentCount; i++) {
			const postIndex = Math.floor(Math.random() * allPosts.length);
			const userIndex = Math.floor(Math.random() * userCount);
			await db.createComment(allPosts[postIndex].post.id, users[userIndex].email, `Comment ${i + 1} on post ${postIndex + 1}`);
		}

		console.log('Random dummy data inserted successfully');
	} catch (error) {
		console.error('Error inserting random dummy data:', error);
	}
}