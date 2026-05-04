<script lang="ts">
	type NavItem = {
		label: string;
		href: string;
	};

	let {
		items = [],
		transparent = false,
		homeHref = '/',
		rightClass = '',
		children
	}: {
		items?: NavItem[];
		transparent?: boolean;
		homeHref?: string;
		rightClass?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<nav
	class={`fixed inset-x-0 top-0 z-50 border-b border-white/8 backdrop-blur-xl ${transparent ? 'bg-[#0a0a0a]/72' : 'bg-[#0f0f0f]/92'}`}
>
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
		<a href={homeHref} class="font-display text-[1.65rem] leading-none tracking-[0.2em] text-white">
			<span class="text-[#ff3030]">E</span>MU<span
				class="mx-1 inline-block h-1.5 w-1.5 rounded-full bg-[#ffc93c] shadow-[0_0_12px_#ffc93c]"
			></span>HUB
		</a>

		<div class="hidden items-center gap-8 lg:flex">
			{#each items as item}
				<a
					href={item.href}
					class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#b1b1b1] transition hover:text-white"
				>
					{item.label}
				</a>
			{/each}
		</div>

		<div class={`flex items-center gap-2 ${rightClass}`}>
			{@render children?.()}
		</div>
	</div>
</nav>
