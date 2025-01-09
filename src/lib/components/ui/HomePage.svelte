<script lang="ts">
import { signIn } from '@auth/sveltekit/client';
import { Label } from '$lib/components/ui/label/index.ts';
import { Input } from '$lib/components/ui/input/index.ts';
import { Icons } from '$lib/components/docs/icons/index.ts';
import CreatePost from '$lib/components/ui/CreatePost.svelte';
import { Button } from '$lib/components/ui/button/index.ts';
import  * as Card from '$lib/components/ui/card/index.ts';
import Post from '$lib/components/ui/Post.svelte';
import {page} from '$app/stores';
import { Switch } from '$lib/components/ui/switch/index';

export let data;

let password = "";
let email = "";
let allPosts : boolean = false;


</script>


	{#if $page.data.session}
		<div class="flex flex-col items-center justify-start h-screen">
		<CreatePost />
			<div class="inline-flex">
			<p class="mx-2">Recommended Posts</p>
		<Switch on:click={() => {allPosts = !allPosts}}></Switch>
			<p class="mx-2">All Posts</p>
			</div>
			{#if allPosts === true}
				{#each data.allPosts ?? [] as postData}
					<Post {postData}></Post>
				{/each}
				{:else}
		{#each data.posts ?? [] as postData}
			<Post {postData}></Post>
		{/each}
		{/if}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center h-screen">
		<Card.Root>
			<Card.Header class="space-y-1">
				<Card.Title class="text-2xl">Sign In!</Card.Title>
				<Card.Description>Enter your email below to create or login to your account.<br/>
					Don't have an account? Click <a class="underline font-bold" href="/register">here</a> to register.
				</Card.Description>

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
				<Button class="w-full" on:click={() => signIn("credentials", { email, password })}>Sign In</Button>
			</Card.Footer>
		</Card.Root>
		</div>
	{/if}
