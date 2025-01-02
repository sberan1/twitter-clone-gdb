<script lang="ts">
	import { Card, CardContent, CardDescription } from '$lib/components/ui/card/index.ts';
	import type { Post, PostAndUser } from '$lib/server/database';
	import { CardTitle } from '$lib/components/ui/card/index.js';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { getShortNames } from '$lib/helpers.ts';
	import {page} from '$app/stores';
	import {Icons} from '$lib/components/docs/icons/index.ts';

	export let postData : PostAndUser;
</script>

<Card class="w-2/4 my-5">
	<CardContent class="w-full flex flex-col justify-center">
		<CardTitle>
			<div class="flex row-auto items-center">
			<Avatar>
				<AvatarImage src={postData.user?.image} alt="User Avatar" />
				<AvatarFallback>{getShortNames(postData.user.name)}</AvatarFallback>
			</Avatar>
			<h3>{postData.user.name}</h3>
			</div>
		</CardTitle>
		<CardDescription>{postData.post?.createdAt ?? ''}</CardDescription>
		<CardDescription>{postData.post?.title ?? ''}</CardDescription>
		<CardDescription>{postData.post?.content ?? ''}</CardDescription>
		<div class="flex items-center justify-between flex-row">
			<div class="flex items-center">
			<Icons.heart class="h-4 w-4" />
			{postData.post?.likes ?? 0}
			</div>
			<div class="flex items-center">
				<Icons.help class="h-4 w-4" />
				{postData.post?.likes ?? 0}
			</div>
			<div class="flex items-center">
				<Icons.copy class="h-4 w-4" />
				{postData.post?.likes ?? 0}
			</div>
		</div>
	</CardContent>
</Card>

