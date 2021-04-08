<script context="module" ssr lang="ts">
	import path from 'path';

	export async function get(): Promise<{ body: any }> {
		return {
			body: {
				hello: 'World'
			}
		};
	}

	export async function post({ body }) {
		return {
			body
		};
	}
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte';
	import { onMount } from 'svelte';

	export let hello: any;

	onMount(() => {
		(async () => {
			const response = await fetch('/api', {
				method: 'POST',
				credentials: 'include',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ it: 'works' })
			});
			console.log(await response.json());
		})();
	});
</script>

<main>
	<h1>Hello world!</h1>

	<Counter />

	<p>Visit <a href="https://svelte.dev">svelte.dev</a> to learn how to build Svelte apps.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4rem;
		font-weight: 100;
		line-height: 1.1;
		margin: 4rem auto;
		max-width: 14rem;
	}

	p {
		max-width: 14rem;
		margin: 2rem auto;
		line-height: 1.35;
	}

	@media (min-width: 480px) {
		h1 {
			max-width: none;
		}

		p {
			max-width: none;
		}
	}
</style>
