<script lang="ts">
	import '../app.css';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar/index.ts';
	import { DropdownMenu, DropdownMenuItem, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuContent, DropdownMenuShortcut } from '$lib/components/ui/dropdown-menu/index.ts';
	import { Button } from '$lib/components/ui/button/index.ts';
	import { page } from '$app/stores';
	import { signOut } from "@auth/sveltekit/client"
	import { getShortNames } from '$lib/helpers';
	import { goto } from '$app/navigation';

	let { children } = $props();

</script>

{#if $page.data.session?.user}
<nav>
	<div class="navbar bg-base-100">
		<div class="flex-1 mx-5">
			<a href="/">
				<h1> Twitter clone </h1>
			</a>
		</div>
		<div class="flex-none gap-2">

			<DropdownMenu>
				<DropdownMenuTrigger asChild let:builder>
					<Button variant="ghost" builders={[builder]} class="relative w-10 rounded-full">
						<Avatar class="w-10 rounded-full">
							<AvatarImage src={$page.data.session?.user?.image} alt="Icon" />
							<AvatarFallback>
								{getShortNames($page.data.session?.user?.name)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-56" align="end">
					<DropdownMenuLabel class="font-normal">
						<div class="flex flex-col space-y-1">
							<p class="text-sm font-medium leading-none">{$page.data.session?.user?.name}</p>
							<p class="text-muted-foreground text-xs leading-none">{$page.data.session?.user?.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem href="/profile">
							Profile
							<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem>
							Settings
							<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Button variant="outline" class="w-full" on:click={
						async () => {
							await signOut();
							await goto('/');
						}}>
							Sign out
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
	</div>
</nav>
{/if}
{@render children()}
