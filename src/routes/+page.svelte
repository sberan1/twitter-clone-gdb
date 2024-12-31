<script>
	import { signIn, signOut } from "@auth/sveltekit/client"
</script>

<button on:click={() => signIn('github')} class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">Sign in with Github</button>
<button on:click={() => signOut()} class="signIn btn btn-blue">Sign out</button>

<style>
	.btn {
			display: inline-block;
	}
</style>
