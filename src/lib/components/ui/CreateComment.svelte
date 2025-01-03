<script lang="ts">
import { Card, CardContent} from '$lib/components/ui/card/index.ts';
import { Input } from '$lib/components/ui/input/index.ts';
import { Button } from '$lib/components/ui/button/index.ts';


	let comment;


</script>

<Card>
	<CardContent>
		<Input placeholder="Your comment here." class="my-3" bind:value={comment}/>
		<Button class="w-full" on:click={async () => {
			const response = await fetch('/api/create-comment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userEmail: data.userEmail,
					postId: data.postId,
					comment,
				})
			});
		}}>Submit</Button>
	</CardContent>
</Card>