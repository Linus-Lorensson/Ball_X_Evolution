<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app">
	<Header />
	<main>
		{@render children()}
	</main>
</div>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		height: 100vh;
		width: 100vw;
		overflow: hidden; /* Disables default browser scrolling */
	}

	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	main {
		flex: 1;
		position: relative;
		overflow: hidden; /* Clips the zooming grid */
		display: flex;
		flex-direction: column;
	}
</style>