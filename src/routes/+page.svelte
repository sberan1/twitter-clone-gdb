<script>
	import { signIn, signOut } from "@auth/sveltekit/client"
	import { Button } from "$lib/components/ui/button/index.ts";
	import * as Card from "$lib/components/ui/card/index.ts";
	import { Label } from "$lib/components/ui/label/index.ts";
	import { Input } from "$lib/components/ui/input/index.ts";
	import { Icons } from "$lib/components/docs/icons/index.ts";
	import { page } from "$app/stores"
	import CreatePost from '$lib/components/ui/CreatePost.svelte';
	import Post from '$lib/components/ui/Post.svelte';

	let password = "";
	let email = "";
	let { data } = $props();

	function logData(){
		console.log(data);
	}
</script>

<div class="flex flex-col items-center justify-center h-screen">
	{#if $page.data.session}
			<CreatePost />
		{#each data.posts as postData}
			<Post {postData}></Post>
				{/each}
		<Button on:click={logData()}>log</Button>
		{:else}
<Card.Root>
	<Card.Header class="space-y-1">
		<Card.Title class="text-2xl">Sign In!</Card.Title>
		<Card.Description>Enter your email below to create or login to your account</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<div class="grid grid-cols-2 gap-6">
			<Button variant="outline" on:click={() => signIn('github')}>
				<Icons.gitHub class="mr-2 h-4 w-4" />
				GitHub
			</Button>
			<Button variant="outline" on:click={() => signIn('discord')}>
				<Icons.discord class="mr-2 h-4 w-4" />
				Discord
			</Button>
		</div>
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t"> </span>
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-card text-muted-foreground px-2"> Or continue with </span>
			</div>
		</div>
		<div class="grid gap-2">
			<Label for="email">Email</Label>
			<Input id="email" type="email" placeholder="m@example.com" bind:value={email}/>
		</div>
		<div class="grid gap-2">
			<Label for="password">Password</Label>
			<Input id="password" type="password" placeholder="****" bind:value={password}/>
		</div>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full" on:click={() => signIn("credentials", { email, password })}>Create account</Button>
	</Card.Footer>
</Card.Root>
		{/if}
</div>

