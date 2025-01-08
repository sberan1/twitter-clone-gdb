<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let {data} = $props();

	if($page.data.session?.user?.email === data.userInfo?.user?.email){
		goto('/');
	}

	async function followUser() {
		const response = await fetch('/api/follow', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				followerEmail: $page.data.session?.user?.email,
				followeeEmail: data.userInfo?.user?.email,
				follow: !data.userInfo?.following,
			}),
		});

		if (response.ok) {
			const result = await response.json();
			await goto('/profile/' + data.userInfo?.user?.id);
			console.log('Follow status:', result.followStatus.followed);
		}
	}
</script>

<div class="flex flex-col items-center justify-center h-screen">
	{#if data.userInfo?.user}
		<img
			src={data.userInfo?.user?.image ?? 'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp'}
			class="avatar"
			alt="User Avatar"
		/>
		<span class="text-2xl">
      <small>Name</small> <br />
      <strong>{data.userInfo?.user?.name ?? "User"}</strong>
    </span>
		<button class="btn btn-primary mt-5" onclick={followUser}>{data.userInfo.following ? 'Following' : 'Follow'}</button>
	{/if}
</div>