<script>
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import Register from '$lib/components/ui/Register.svelte';


</script>

{#if $page.data.session?.user}
	{async () => {await goto('/')}}
{:else}
	<Register></Register>
{/if}