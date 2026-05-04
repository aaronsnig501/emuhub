<script lang="ts">
	import EmulatorShell from '$lib/components/emulator/EmulatorShell.svelte';
</script>

<svelte:head>
	<title>EMU·HUB — Play CHIP-8</title>
	<meta
		name="description"
		content="Play CHIP-8 ROMs in the browser with controls, save states, ROM details, and display themes."
	/>
</svelte:head>

<div class="min-h-screen bg-[#090909] px-4 pb-10 pt-24 text-[#f0f0f0] sm:px-6 lg:px-8">
	<div class="mx-auto mb-8 max-w-7xl">
		<p class="section-eyebrow">Play</p>
		<h1 class="mt-4 font-display text-[clamp(3.5rem,8vw,5.5rem)] leading-[0.9] tracking-[0.16em]">
			PLAY. PAUSE.
			<br />
			<span class="text-[#7dff96]">TUNE THE MACHINE.</span>
		</h1>
		<p class="mt-4 max-w-2xl text-sm leading-7 text-[#a8a8a8] sm:text-base">
			Load a local ROM, control execution, capture save states, and inspect the emulator while it
			runs. This page uses the shared emulator shell so additional systems can slot into the same layout.
		</p>
	</div>

	<div class="mx-auto max-w-7xl">
		<EmulatorShell systemName="CHIP-8" />
	</div>
</div>
