<script>
	import PostDetail from '$lib/components/ui/PostDetail.svelte';


	let {data} = $props();

</script>

<div class="flex flex-col items-center justify-start h-screen">
	<PostDetail {data}></PostDetail>
</div>