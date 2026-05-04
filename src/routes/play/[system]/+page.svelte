<script lang="ts">
	import { base } from '$app/paths';

	let { params } = $props();

	const system = $derived(params.system.toUpperCase());
</script>

<svelte:head>
	<title>EMU·HUB — System Pending</title>
</svelte:head>

<div class="min-h-screen bg-[#090909] px-4 pb-10 pt-24 text-[#f0f0f0] sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#141414] p-8">
		<p class="section-eyebrow">Play</p>
		<h1 class="mt-4 font-display text-[clamp(3rem,7vw,4.8rem)] leading-[0.92] tracking-[0.14em]">
			{system} IS
			<br />
			<span class="text-[#666666]">COMING NEXT.</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm leading-7 text-[#a8a8a8]">
			This route is reserved for future emulator implementations. CHIP-8 is live now, and the shared
			player layout is in place for more systems to follow.
		</p>
		<a
			href={`${base}/play/chip8`}
			class="mt-8 inline-flex rounded-md bg-[#ff3030] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-white shadow-[0_0_32px_rgba(255,48,48,0.35)]"
		>
			Open CHIP-8
		</a>
</div>
</div>
