<script lang="ts">
	import '../app.css';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar/index.ts';
	import { DropdownMenu, DropdownMenuItem, DropdownMenuGroup, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuContent, DropdownMenuShortcut } from '$lib/components/ui/dropdown-menu/index.ts';
	import { Button } from '$lib/components/ui/button/index.ts';
	import { page } from '$app/stores';
	import { signOut } from "@auth/sveltekit/client"


	let { children } = $props();

	function getShortNames() {
		const a = ($page.data.session?.user?.name).split(' ');
		return a[0][0].toLocaleUpperCase() + (a[1][0].toLocaleUpperCase() ?? '');
	}
</script>

{#if $page.data.session}
<nav>
	<div class="navbar bg-base-100">
		<div class="flex-1">
			<a href="/">
				<h1> Twitter clone </h1>
			</a>
		</div>
		<div class="flex-none gap-2">
			<div class="form-control">
				<input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild let:builder>
					<Button variant="ghost" builders={[builder]} class="relative w-10 rounded-full">
						<Avatar class="w-10 rounded-full">
							<AvatarImage src={$page.data.session?.user?.image} alt="Icon" />
							<AvatarFallback>
								{getShortNames()}
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
						<Button variant="outline" class="w-full" on:click={signOut()}>
							Sign out
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
	</div>
</nav>
{/if}
{@render children()}
