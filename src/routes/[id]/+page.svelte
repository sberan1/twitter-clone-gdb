<script>

	import Post from '$lib/components/ui/Post.svelte';


	let {data} = $props();

</script>

<div class="flex flex-col items-center justify-start h-screen">
	<Post postData={data.post}></Post>
</div>