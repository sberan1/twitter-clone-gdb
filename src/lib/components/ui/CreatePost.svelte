<script>
	import { Card, CardContent, CardDescription } from '$lib/components/ui/card/index.ts';
	import { Input } from '$lib/components/ui/input/index.ts';
	import { Button } from '$lib/components/ui/button/index.ts';
	import { Textarea } from '$lib/components/ui/textarea/index.ts';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';


	let title = $state("");
	let content = $state("");
	const userEmail = $page.data.session?.user?.email;

</script>


<Card class="w-2/4 my-5">
		<CardContent class="w-full ">
			<Input placeholder="Your post title here."  bind:value={title}/>
			<Textarea placeholder="Type your message here." bind:value={content} />
			<Button class="w-full" on:click={
				async () => {
					const post = await fetch('/api/create-post',{

						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							userEmail,
							title,
							content,
					})
					});

					if(post.ok){
						await goto('/');
					}
				}
			}>Submit</Button>

		</CardContent>
</Card>