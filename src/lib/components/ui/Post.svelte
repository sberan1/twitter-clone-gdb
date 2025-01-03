<script lang="ts">
	import { Card, CardContent, CardDescription } from '$lib/components/ui/card/index.ts';
	import type { Post, PostAndUser } from '$lib/server/database';
	import { CardTitle } from '$lib/components/ui/card/index.js';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { getShortNames } from '$lib/helpers.ts';
	import {page} from '$app/stores';
	import {Icons} from '$lib/components/docs/icons/index.ts';
	import { goto } from '$app/navigation';

	export let postData : PostAndUser | null;

	async function toggleLike() {
		const response = await fetch('/api/like', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userEmail: $page.data.session?.user?.email,
				postId: postData.post.id,
				like: !postData.liked,
			}),
		});

		if (response.ok) {
			const result = await response.json();
			postData.liked = result.likeStatus.liked;
			postData.likes = postData.liked ? (postData.likes ?? 0) + 1 : (postData.likes ?? 0) - 1;
		}
	}

</script>

<Card class="w-2/4 my-5">
	<CardContent class="w-full flex flex-col justify-center">
		<CardTitle>
			<div class="flex row-auto items-center my-3">
			<Avatar>
				<AvatarImage src={postData.user?.image} alt="User Avatar" />
				<AvatarFallback>{getShortNames(postData.user.name)}</AvatarFallback>
			</Avatar>
			<h3 class="mx-2">{postData.user.name}</h3>
			</div>
		</CardTitle>
		<CardDescription class="mb-1">{postData.post?.createdAt ?? ''}</CardDescription>
		<CardDescription class="my-3">{postData.post?.title ?? ''}</CardDescription>
		<CardDescription class="my-3">{postData.post?.content ?? ''}</CardDescription>
		<div class="flex items-center justify-between flex-row">
			<div class="flex items-center my-3">
				<button on:click={toggleLike}>
				<Icons.heart class="h-8 w-8 mx-2 {postData.liked ? 'fill-red-500' : ''}" />
				</button>
				{postData.likes ?? 0}
			</div>
			<div class="flex items-center my-3">
				<button on:click={async () => {await goto('/' + postData.post.id)}}>
						<Icons.help class="h-8 w-8 mx-2" />
					</button>
					{postData.commentCount ?? 0}
			</div>
			<div class="flex items-center my-3">
				<Icons.copy class="h-8 w-8 mx-2" />
				{postData.shares ?? 0}
			</div>
		</div>
	</CardContent>
</Card>

