<script lang="ts">
	let { data }: { data: { selfHosted: boolean } } = $props();
</script>

<svelte:head>
	<title>EMU·HUB — Saves</title>
</svelte:head>

<div class="min-h-screen bg-[#090909] px-4 pb-10 pt-24 text-[#f0f0f0] sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[#141414] p-8">
		<p class="section-eyebrow">Saves</p>
		<h1 class="mt-4 font-display text-[clamp(3rem,7vw,4.8rem)] leading-[0.92] tracking-[0.14em]">
			SAVES
			<br />
			<span class="text-[#666666]">WILL LIVE HERE.</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm leading-7 text-[#a8a8a8]">
			The current CHIP-8 player already supports in-memory save states. This dedicated route is ready
			for future shared save management across multiple emulator systems.
		</p>
		{#if data.selfHosted}
			<p class="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#7dff96]">
				Self-hosted mode has a mounted `/data/saves` path ready for private save persistence.
			</p>
		{/if}
	</div>
</div>
