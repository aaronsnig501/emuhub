<script lang="ts">
	import { base } from '$app/paths';
	import HeroCanvas from '$lib/components/homepage/HeroCanvas.svelte';
	import {
		getThemePalette,
		homepageThemes,
		type HomeThemeId,
		type ThemeMode
	} from '$lib/theme/homepageThemes';

	type Fact = {
		value: string;
		label: string;
	};

	type Capability = {
		title: string;
		body: string;
		accent: string;
	};

	type Detail = {
		label: string;
		value: string;
	};

	type Control = {
		keys: string;
		action: string;
	};

	let {
		data
	}: {
		data: { selfHosted: boolean };
	} = $props();

	const facts: Fact[] = [
		{ value: '1', label: 'Implemented system' },
		{ value: '35', label: 'CHIP-8 opcodes' },
		{ value: '64×32', label: 'Display resolution' },
		{ value: '4KB', label: 'Memory model' }
	];

	const capabilities: Capability[] = [
		{
			title: 'Browser ROM loading',
			body: 'The CHIP-8 route accepts a local .ch8 or .rom file through the browser file input and loads it directly into emulator memory.',
			accent: 'var(--theme-accent-1)'
		},
		{
			title: 'Canvas rendering loop',
			body: 'Display output is drawn onto a 64×32 canvas grid and scaled up in the browser for the emulator view.',
			accent: 'var(--theme-accent-2)'
		},
		{
			title: 'Keyboard input mapping',
			body: 'The emulator maps your keyboard to the CHIP-8 keypad so loaded ROMs can respond to input immediately.',
			accent: 'var(--theme-accent-3)'
		},
		{
			title: 'Self-hosted library mode',
			body: 'Run EMU·HUB with SELF_HOSTED=true to unlock private ROM upload and management on your own hardware, while the cloud build stays static.',
			accent: 'var(--theme-accent-2)'
		}
	];

	const implementationDetails: Detail[] = [
		{ label: 'Play today', value: 'Load local CHIP-8 ROM files in the browser' },
		{ label: 'Input', value: 'Keyboard-mapped keypad controls' },
		{ label: 'Display', value: 'Scaled pixel output for classic ROMs' },
		{ label: 'Runtime', value: 'Client-side emulator running entirely in your browser' },
		{ label: 'Direction', value: 'The first system in a growing emulator hub' },
		{ label: 'Self-hosted', value: 'Private ROM library mode available' }
	];

	const controls: Control[] = [
		{ keys: '1 2 3 4', action: 'Top row of the CHIP-8 keypad' },
		{ keys: 'Q W E R', action: 'Second keypad row' },
		{ keys: 'A S D F', action: 'Third keypad row' },
		{ keys: 'Z X C V', action: 'Bottom keypad row' }
	];

	let themeId = $state<HomeThemeId>('arcade');
	let mode = $state<ThemeMode>('dark');

	const palette = $derived(getThemePalette(themeId, mode));
	const themeStyle = $derived(
		Object.entries(palette)
			.map(([key, value]) => `${key}:${value}`)
			.join(';')
	);
</script>

<svelte:head>
	<title>EMU·HUB — CHIP-8 in the Browser</title>
	<meta
		name="description"
		content="EMU·HUB starts with a browser-based CHIP-8 emulator and is being designed to expand into a multi-system emulator hub."
	/>
</svelte:head>

<div class="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]" style={themeStyle}>
	<section
		id="top"
		class="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pt-36"
	>
		<div
			class="pointer-events-none absolute inset-0 opacity-70"
			style="background-image:
				linear-gradient(var(--theme-grid-line) 1px, transparent 1px),
				linear-gradient(90deg, var(--theme-grid-line) 1px, transparent 1px);
				background-size: 64px 64px;
				mask-image: radial-gradient(ellipse 70% 65% at 50% 35%, black 35%, transparent 100%);"
		></div>
		<div
			class="pointer-events-none absolute -right-20 top-10 h-[26rem] w-[40rem] rounded-full blur-3xl"
			style="background: radial-gradient(circle, var(--theme-glow-1) 0%, transparent 70%);"
		></div>
		<div
			class="pointer-events-none absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full blur-3xl"
			style="background: radial-gradient(circle, var(--theme-glow-2) 0%, transparent 70%);"
		></div>

		<div class="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
			<div class="animate-fade-up">
				<div
					class="mb-6 inline-flex items-center gap-3 rounded-sm border border-[color:color-mix(in_srgb,var(--theme-accent-1)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--theme-accent-1)_12%,transparent)] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[var(--theme-accent-1)]"
				>
					<span
						class="h-1.5 w-1.5 rounded-full bg-[var(--theme-accent-1)] shadow-[0_0_10px_var(--theme-accent-1)]"
					></span>
					Live now · CHIP-8 playable · More systems planned
				</div>

				<h1 class="font-display text-[clamp(4rem,10vw,7rem)] leading-[0.88] tracking-[0.18em]">
					<span class="block text-[var(--theme-text-3)]">RUN</span>
					<span class="block text-[var(--theme-accent-1)]">CHIP-8</span>
					<span
						class="block text-[var(--theme-accent-2)] [text-shadow:0_0_40px_color-mix(in_srgb,var(--theme-accent-2)_25%,transparent)]"
					>
						IN BROWSER.
					</span>
				</h1>

				<p class="mt-6 max-w-xl text-base leading-8 text-[var(--theme-text-2)] sm:text-lg">
					EMU·HUB begins with CHIP-8: load a ROM from your machine, play in the browser, and
					explore the foundation for a multi-system emulator experience that will grow over time.
					Self-hosted deployments can also unlock a private ROM library on your own hardware.
				</p>

				<div class="mt-6 flex flex-wrap gap-2">
					<div
						class="hidden rounded-md border border-[var(--theme-border-strong)] bg-[var(--theme-surface-2)] p-1 sm:flex"
					>
						{#each homepageThemes as theme}
							<button
								type="button"
								class={`rounded px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] transition ${
									theme.id === themeId
										? 'bg-[var(--theme-accent-1)] text-white shadow-[0_0_24px_color-mix(in_srgb,var(--theme-accent-1)_35%,transparent)]'
										: 'text-[var(--theme-text-2)] hover:text-[var(--theme-text)]'
								}`}
								onclick={() => (themeId = theme.id)}
							>
								{theme.label}
							</button>
						{/each}
					</div>
					<button
						type="button"
						class="rounded-md border border-[var(--theme-border-strong)] px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--theme-text-2)] transition hover:text-[var(--theme-text)]"
						onclick={() => (mode = mode === 'dark' ? 'light' : 'dark')}
					>
						{mode === 'dark' ? 'Dark' : 'Light'}
					</button>
				</div>

				<div class="mt-8 flex flex-wrap gap-3">
					<a
						href={`${base}/play/chip8`}
						class="rounded-md bg-[var(--theme-accent-1)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-white shadow-[0_0_32px_color-mix(in_srgb,var(--theme-accent-1)_40%,transparent)] transition hover:brightness-110"
					>
						Open CHIP-8
					</a>
					<a
						href="#scope"
						class="rounded-md border border-[var(--theme-border-strong)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--theme-text-2)] transition hover:border-white/30 hover:text-[var(--theme-text)]"
					>
						What&apos;s next
					</a>
					{#if data.selfHosted}
						<a
							href={`${base}/library`}
							class="rounded-md border border-[color:color-mix(in_srgb,var(--theme-accent-2)_36%,var(--theme-border-strong))] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--theme-accent-2)] transition hover:brightness-110"
						>
							Open library
						</a>
					{/if}
				</div>

				<p class="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)]">
					Local ROM loading · <span class="text-[var(--theme-text-2)]">Built to expand</span>
				</p>
			</div>

			<div class="animate-fade-up-delayed">
				<div
					class="overflow-hidden rounded-2xl border border-[var(--theme-border-strong)] bg-[var(--theme-surface)] shadow-[0_40px_90px_rgba(0,0,0,0.35)]"
				>
					<div
						class="flex items-center justify-between border-b border-[var(--theme-border)] bg-[var(--theme-surface-2)] px-4 py-3"
					>
						<div class="flex items-center gap-2">
							<span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
							<span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
							<span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
						</div>
						<span class="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--theme-text-2)]">
							CHIP-8 · browser playable
						</span>
						<div
							class="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--theme-accent-2)]"
						>
							<span
								class="h-1.5 w-1.5 rounded-full bg-[var(--theme-accent-2)] animate-pulse shadow-[0_0_10px_var(--theme-accent-2)]"
							></span>
							Live
						</div>
					</div>
					<div class="relative bg-black">
						<HeroCanvas />
						<div
							class="pointer-events-none absolute inset-0"
							style="background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.14) 3px, rgba(0, 0, 0, 0.14) 4px);"
						></div>
					</div>
					<div class="flex items-center justify-between px-4 py-3">
						<span class="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--theme-accent-2)]">
							Canvas output · key input
						</span>
						<span class="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--theme-text-3)]">
							64×32 · 10× scale
						</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section id="overview" class="border-y border-[var(--theme-border)] px-4 py-7 sm:px-6 lg:px-8">
		<div class="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each facts as fact, index}
				<div
					class={`px-2 text-center ${index < facts.length - 1 ? 'lg:border-r lg:border-[var(--theme-border)]' : ''}`}
				>
					<div class="font-display text-5xl leading-none tracking-[0.14em]">{fact.value}</div>
					<div class="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[var(--theme-text-3)]">
						{fact.label}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section id="system" class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
				<div class="mb-10">
					<p class="section-eyebrow">Implemented system</p>
			<h2 class="section-title">
				One emulator.
				<br />
				<span class="text-[var(--theme-text-3)]">Clearly scoped.</span>
			</h2>
		</div>

		<div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
			<article
				class="relative overflow-hidden rounded-[1.75rem] border border-[color:color-mix(in_srgb,var(--theme-accent-1)_38%,var(--theme-border))] bg-[color:color-mix(in_srgb,var(--theme-accent-1)_7%,var(--theme-surface))] p-8"
			>
				<span
					class="absolute right-5 top-5 rounded-sm bg-[color:color-mix(in_srgb,var(--theme-accent-1)_16%,transparent)] px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--theme-accent-1)]"
				>
					Implemented
				</span>
				<div class="text-4xl">⬛</div>
				<h3 class="mt-4 font-display text-[2.4rem] leading-none tracking-[0.08em]">CHIP-8</h3>
				<p class="mt-3 max-w-xl text-sm leading-7 text-[var(--theme-text-2)]">
					The current emulator core is written in TypeScript and models CHIP-8 memory, registers,
					stack, timers, keypad state, and display output.
				</p>
				<div class="mt-6 grid gap-3 sm:grid-cols-2">
					{#each implementationDetails as detail}
						<div class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
							<div class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)]">
								{detail.label}
							</div>
							<div class="mt-2 text-sm leading-6 text-[var(--theme-text)]">{detail.value}</div>
						</div>
					{/each}
				</div>
			</article>

			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
				{#each capabilities as capability}
					<article
						class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 transition hover:-translate-y-1 hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-surface-2)]"
					>
						<div
							class="mb-4 h-11 w-11 rounded-xl"
							style={`background: color-mix(in srgb, ${capability.accent} 16%, transparent);`}
						></div>
						<h3 class="font-display text-[1.8rem] leading-none tracking-[0.08em]">
							{capability.title}
						</h3>
						<p class="mt-3 text-sm leading-7 text-[var(--theme-text-2)]">{capability.body}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section id="scope" class="border-t border-[var(--theme-border)] px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
			<div
				class="rounded-[1.75rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8"
			>
				<p class="section-eyebrow">Vision</p>
				<h2 class="section-title !mb-4">
					Starting with CHIP-8.
					<br />
					<span class="text-[var(--theme-text-3)]">Designed for more systems.</span>
				</h2>
				<p class="max-w-lg text-sm leading-7 text-[var(--theme-text-2)]">
					The current experience is focused on one emulator done properly, while the interface and
					project structure are being shaped for broader emulator support as more cores are added.
				</p>
			</div>

			<div class="rounded-[1.75rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
				<div class="space-y-3">
					<div class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-2)] p-5">
						<div class="font-display text-[1.8rem] leading-none tracking-[0.08em]">What you can use now</div>
						<p class="mt-3 text-sm leading-7 text-[var(--theme-text-2)]">
							A playable CHIP-8 emulator with local ROM loading, keyboard input, rendered display
							output, and quick restart for the current session.
						</p>
					</div>
					<div class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-2)] p-5">
						<div class="font-display text-[1.8rem] leading-none tracking-[0.08em]">Where it&apos;s headed</div>
						<p class="mt-3 text-sm leading-7 text-[var(--theme-text-2)]">
							More emulator support is planned. The app is being built so new systems can be
							added without redesigning the overall experience.
						</p>
					</div>
					<div class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-2)] p-5">
						<div class="font-display text-[1.8rem] leading-none tracking-[0.08em]">Self-hosted mode</div>
						<p class="mt-3 text-sm leading-7 text-[var(--theme-text-2)]">
							Private ROM management can run behind a Node deployment with `SELF_HOSTED=true`,
							while the public GitHub Pages build remains backend-free.
						</p>
					</div>
					<div class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-2)] p-5">
						<div class="font-display text-[1.8rem] leading-none tracking-[0.08em]">Why the design system matters</div>
						<p class="mt-3 text-sm leading-7 text-[var(--theme-text-2)]">
							Multiple themes and light/dark modes are already part of the UI foundation, which
							keeps the product cohesive as new emulator surfaces arrive.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section id="controls" class="px-4 pb-20 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-7xl rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8">
			<div class="mb-8">
				<p class="section-eyebrow">Controls</p>
				<h2 class="section-title">
					Keyboard mapping for
					<br />
					<span class="text-[var(--theme-text-3)]">the current emulator.</span>
				</h2>
			</div>

			<div class="grid gap-3 md:grid-cols-2">
				{#each controls as control}
					<div class="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-2)] p-5">
						<div class="font-mono text-sm uppercase tracking-[0.24em] text-[var(--theme-accent-2)]">
							{control.keys}
						</div>
						<div class="mt-2 text-sm leading-7 text-[var(--theme-text-2)]">{control.action}</div>
					</div>
				{/each}
			</div>

			<div
				class="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-2)] p-5 md:flex-row md:items-center md:justify-between"
			>
				<div>
					<div class="font-display text-[1.8rem] leading-none tracking-[0.08em]">Try CHIP-8 now</div>
					<p class="mt-2 text-sm leading-7 text-[var(--theme-text-2)]">
						Load a local ROM and use the mapped keys above to play in the browser.
					</p>
				</div>
				<a
					href={`${base}/play/chip8`}
					class="rounded-md bg-[var(--theme-accent-1)] px-5 py-3 text-center font-mono text-[0.72rem] uppercase tracking-[0.18em] text-white shadow-[0_0_32px_color-mix(in_srgb,var(--theme-accent-1)_40%,transparent)] transition hover:brightness-110"
				>
					Open CHIP-8
				</a>
			</div>
		</div>
	</section>

	<footer class="border-t border-[var(--theme-border)] px-4 py-8 sm:px-6 lg:px-8">
		<div class="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
			<div class="font-display text-[1.35rem] tracking-[0.2em] text-[var(--theme-text-3)]">EMU·HUB</div>
			<div class="flex flex-wrap items-center gap-6">
				<a href="#overview" class="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)] transition hover:text-[var(--theme-text)]">Overview</a>
				<a href="#system" class="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)] transition hover:text-[var(--theme-text)]">System</a>
				<a href="#scope" class="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)] transition hover:text-[var(--theme-text)]">Vision</a>
				<a href="#controls" class="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)] transition hover:text-[var(--theme-text)]">Controls</a>
			</div>
			<div class="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[var(--theme-text-3)]">
				CHIP-8 prototype · SvelteKit
			</div>
		</div>
	</footer>
</div>
