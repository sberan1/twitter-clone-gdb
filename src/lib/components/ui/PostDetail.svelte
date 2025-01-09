<script lang="ts">
import { Card, CardContent} from '$lib/components/ui/card/index.ts';
import { Input } from '$lib/components/ui/input/index.ts';
import { Button } from '$lib/components/ui/button/index.ts';
import Post from '$lib/components/ui/Post.svelte';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import Comment from '$lib/components/ui/Comment.svelte';

	let {data} = $props();

	let comment = $state("");

</script>


<Post postData={data.post}></Post>

<Card class="w-2/4 my-3">
	<CardContent>
		<Input placeholder="Your comment here." class="my-3" bind:value={comment}/>
		<Button class="w-full" on:click={
		async () => {
					const response = await fetch('/api/create-comment',{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							userEmail: $page.data.session?.user?.email,
							postId: data.post.post.id,
							content: comment,
					})
					});

					if(response.ok){
						await goto('/post/' + data.post.post.id);
					}
				}
		}>Submit</Button>
	</CardContent>
</Card>

{#each data.post.comments as komentar}
	<Comment comment={komentar}></Comment>
{/each}



