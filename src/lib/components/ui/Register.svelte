<script lang="ts">

import { Card } from '$lib/components/ui/card';
import { CardContent, CardTitle } from '$lib/components/ui/card/index.js';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { goto } from '$app/navigation';

let email: string = '';
let password: string = '';
let repeatPassword: string = '';
let name: string = '';

$: name_error = name.length < 3 ? 'Name must be at least 3 characters long' : null;
$: password_error = password.length < 6 ? 'Password must be at least 6 characters long' : null;
$: email_error = !email.includes('@') ? 'Invalid email' : null;
$: repeatPassword_error = password !== repeatPassword || repeatPassword === '' ? 'Passwords do not match' : null;

$: error = name_error !== null || password_error !== null || repeatPassword_error !== null;

async function register() {
	if (error === true) {
		return;
	}

	const response = await fetch('/api/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ email, password, name })
	});

	if (response.ok) {
		await goto('/');
	} else {
		error = true;
	}
}

</script>

<div class="flex flex-col items-center justify-center h-screen">
<Card class="flex flex-col items-center ">
<CardTitle class="mt-5 text-2xl"> Register </CardTitle>
<CardContent class="w-100">
	<form onsubmit={register}>
		<div class="grid gap-2 mt-2">
			<Label for="name">Name</Label>
			<Input id="name" type="text" placeholder="John Snow" bind:value={name} />
			{#if name_error}
				<Label class="text-red-600">{name_error}</Label>
				{/if}
		</div>
		<div class="grid gap-2 mt-2">
			<Label for="email">Email</Label>
			<Input id="email" type="email" placeholder="m@example.com" bind:value={email} />
			{#if email_error}
				<Label class="text-red-600">{email_error}</Label>
				{/if}
		</div>
		<div class="grid gap-2 mt-2">
			<Label for="password">Password</Label>
			<Input id="password" type="password" placeholder="****" bind:value={password} />
			{#if password_error}
				<Label class="text-red-600">{password_error}</Label>
				{/if}
		</div>
		<div class="grid gap-2 mt-2">
			<Label for="repeatPassword">Repeat Password</Label>
			<Input id="repeatPassword" type="password" placeholder="******" bind:value={repeatPassword} />
			{#if repeatPassword_error}
				<Label class="text-red-600">{repeatPassword_error}</Label>
				{/if}
		</div>
		<button class="w-full bg-primary text-white p-2 rounded-md mt-2" type="submit" disabled={error}>Register</button>
	</form>
</CardContent>
</Card>
</div>