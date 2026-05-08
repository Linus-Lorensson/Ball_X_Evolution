<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<header>
	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
				<a href={resolve('/')}>Evolutions Chart</a>
			</li>
			<!-- <li aria-current={page.url.pathname === '/about' ? 'page' : undefined}>
				<a href={resolve('/about')}>Library</a>
			</li> -->
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: center;
		width: 100%;
		z-index: 100; /* Ensure it stays above the grid */
		background: #000;
		border-bottom: 1px solid #1e1b4b;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: #0a0a0c;
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		background: var(--background);
		list-style: none;
		display: flex;
		height: 3em;
		align-items: center;
		margin: 0;
		padding: 0 1rem;
	}

	nav a {
		color: #94a3b8;
		font-weight: 800;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		padding: 0 1.5rem;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	nav a:hover {
		color: #6366f1;
		text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
	}

	li {
		position: relative;
		display: flex;
		align-items: center;
		height: 100%;
	}

	li[aria-current='page']::before {
		content: '';
		position: absolute;
		top: 0;
		left: 10%;
		right: 10%;
		height: 2px;
		background: #6366f1;
		box-shadow: 0 0 10px #6366f1;
	}
</style>