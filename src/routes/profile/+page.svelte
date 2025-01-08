<script>
	import { SignIn, SignOut } from "@auth/sveltekit/components"
	import { page } from "$app/stores"
	import { goto } from "$app/navigation";

	$: if (!$page.data.session) {
		goto('/');
	}
</script>
<div class="flex flex-col items-center justify-center h-screen">
	{#if $page.data.session}
		<img
				src={$page.data.session.user?.image ?? 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp'}
				class="avatar"
				alt="User Avatar"
			/>
		<span class="signedInText">
      <small>Signed in as</small> <br />
      <strong>{$page.data.session.user?.name ?? "User"}</strong>
    </span>
		<SignOut>
			<div slot="submitButton" class="buttonPrimary">Sign out</div>
		</SignOut>
	{/if}
</div>