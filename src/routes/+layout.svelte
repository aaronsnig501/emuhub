<script lang="ts">
	import { base } from '$app/paths';
	import './layout.css';
	import AppNav from '$lib/components/AppNav.svelte';

	let { children } = $props();

	const navItems = [
		{ label: 'Home', href: `${base}/` },
		{ label: 'Play', href: `${base}/play/chip8` },
		{ label: 'Library', href: `${base}/library` },
		{ label: 'Saves', href: `${base}/saves` }
	];
</script>

<AppNav items={navItems} />
{@render children()}
