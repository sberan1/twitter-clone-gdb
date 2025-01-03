<script lang="ts">
	import {page} from '$app/stores';
	import { Card, CardTitle } from '$lib/components/ui/card';
	import { Icons } from '$lib/components/docs/icons/index.ts';
	import type { Comment } from '$lib/server/database';
	import { CardContent } from '$lib/components/ui/card/index.js';
	import { getShortNames } from '$lib/helpers';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';

	export let comment : Comment;

	console.log(comment);


	async function toggleLike() {
		const response = await fetch('/api/like-comment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userEmail: $page.data.session?.user?.email,
				commentId: comment.id,
				like: !comment.liked,
			}),
		});



		if (response.ok) {
			console.log(response.body)
			const result = await response.json();
			comment.liked = result.likeStatus.liked;
			comment.likes = comment.liked ? (comment.likes ?? 0) + 1 : (comment.likes ?? 0) - 1;
		}
	}

</script>

<Card class="my-3 w-1/2 flex flex-col items-center">
	<CardTitle>
		<div class="flex row-auto items-center my-3">
			<Avatar>
				<AvatarImage src={comment.user?.image} alt="User Avatar" />
				<AvatarFallback>{getShortNames(comment.user.name)}</AvatarFallback>
			</Avatar>
			<h3 class="mx-2">{comment.user.name}</h3>
		</div>
	</CardTitle>
	<CardContent>{comment.content}</CardContent>
	<CardContent><div class="flex items-center my-3">
	<button onclick={async () => {await toggleLike()}}>
		<Icons.heart class="h-8 w-8 mx-2 {comment.liked ? 'fill-red-500' : ''}" />
	</button>
	{comment.likes ?? 0}
</div></CardContent>
</Card>