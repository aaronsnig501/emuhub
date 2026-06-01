<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Chip8, type Chip8Snapshot } from '$lib/emulators/chip8';

	type DisplayTheme = {
		id: string;
		label: string;
		screen: string;
		pixel: string;
		glow: string;
		frame: string;
	};

	type SaveSlot = {
		id: number;
		label: string;
		createdAt: string;
		programCounter: string;
		delayTimer: number;
		soundTimer: number;
		romName: string;
		snapshot: Chip8Snapshot;
	};

	type RomInfo = {
		name: string;
		size: number;
		loadedAt: string;
	};

	type KeymapRow = {
		chip8: string;
		keys: string;
	};

	let { systemName = 'CHIP-8' }: { systemName?: string } = $props();

	const emulator = new Chip8();
	const SPEED_OPTIONS = [0.5, 1, 2, 4];
	const MAX_SAVE_SLOTS = 6;
	const BASE_STEPS_PER_FRAME = 10;

	const displayThemes: DisplayTheme[] = [
		{ id: 'phosphor', label: 'Phosphor', screen: '#020403', pixel: '#7dff96', glow: 'rgba(125,255,150,0.6)', frame: '#7dff96' },
		{ id: 'arcade', label: 'Arcade', screen: '#050505', pixel: '#ff5a36', glow: 'rgba(255,90,54,0.58)', frame: '#ff5a36' },
		{ id: 'ice', label: 'Ice', screen: '#041017', pixel: '#7be8ff', glow: 'rgba(123,232,255,0.52)', frame: '#7be8ff' },
		{ id: 'amber', label: 'Amber', screen: '#120b03', pixel: '#ffc14d', glow: 'rgba(255,193,77,0.55)', frame: '#ffc14d' },
		{ id: 'mono', label: 'Mono', screen: '#000000', pixel: '#ffffff', glow: 'rgba(255,255,255,0.4)', frame: '#ffffff' }
	];

	const keymapRows: KeymapRow[] = [
		{ chip8: '1 2 3 C', keys: '1 2 3 4' },
		{ chip8: '4 5 6 D', keys: 'Q W E R' },
		{ chip8: '7 8 9 E', keys: 'A S D F' },
		{ chip8: 'A 0 B F', keys: 'Z X C V' }
	];

	const keypadLabels = ['1', '2', '3', 'C', '4', '5', '6', 'D', '7', '8', '9', 'E', 'A', '0', 'B', 'F'];
	const KEY_MAP: Record<string, number> = {
		'1': 0x1, '2': 0x2, '3': 0x3, '4': 0xc,
		q: 0x4, w: 0x5, e: 0x6, r: 0xd,
		a: 0x7, s: 0x8, d: 0x9, f: 0xe,
		z: 0xa, x: 0x0, c: 0xb, v: 0xf
	};

	let canvas: HTMLCanvasElement;
	let animationFrame = 0;
	let isRunning = $state(false);
	let hasLoadedRom = $state(false);
	let speedMultiplier = $state(1);
	let currentThemeId = $state('phosphor');
	let currentRom = $state<Uint8Array | null>(null);
	let romInfo = $state<RomInfo | null>(null);
	let saveStates = $state<SaveSlot[]>([]);
	let saveCounter = 1;
	let frameVersion = $state(0);
	let audioCtx: AudioContext | null = null;
	let oscillator: OscillatorNode | null = null;
	let gainNode: GainNode | null = null;
	let muted = $state(false);

	const currentTheme = $derived(displayThemes.find((theme) => theme.id === currentThemeId) ?? displayThemes[0]);
	const activeKeys = $derived.by(() => {
		frameVersion;
		return emulator.keypad.map((pressed, index) => ({ pressed, label: keypadLabels[index] }));
	});
	const registerPairs = $derived.by(() => {
		frameVersion;
		return Array.from(emulator.registers).map((value, index) => ({
			name: `V${index.toString(16).toUpperCase()}`,
			value: `0x${value.toString(16).toUpperCase().padStart(2, '0')}`
		}));
	});
	const executionStats = $derived.by(() => {
		frameVersion;
		return [
			{ label: 'PC', value: `0x${emulator.programCounter.toString(16).toUpperCase().padStart(3, '0')}` },
			{ label: 'I', value: `0x${emulator.indexRegister.toString(16).toUpperCase().padStart(3, '0')}` },
			{ label: 'Delay', value: emulator.delayTimer.toString() },
			{ label: 'Sound', value: emulator.soundTimer.toString() }
		];
	});

	function formatTimestamp(date: Date) {
		return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
	}

	function cancelLoop() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		}
	}

	function syncView() {
		frameVersion += 1;
	}

	function render() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = currentTheme.screen;
		ctx.fillRect(0, 0, 640, 320);
		ctx.fillStyle = currentTheme.pixel;
		ctx.shadowBlur = 14;
		ctx.shadowColor = currentTheme.glow;

		for (let i = 0; i < 64 * 32; i++) {
			if (emulator.display[i] === 1) {
				const x = (i % 64) * 10;
				const y = Math.floor(i / 64) * 10;
				ctx.fillRect(x, y, 10, 10);
			}
		}

		ctx.shadowBlur = 0;
		syncView();
	}

	function tick() {
		if (!isRunning) return;

		if (emulator.soundTimer > 0) {
			emulator.soundTimer--;
			startBeep();
		} else {
			stopBeep();
		}

		const stepsPerFrame = Math.max(1, Math.round(BASE_STEPS_PER_FRAME * speedMultiplier));
		for (let i = 0; i < stepsPerFrame; i++) {
			emulator.step();
		}
		if (emulator.delayTimer > 0) emulator.delayTimer--;
		render();
		animationFrame = requestAnimationFrame(tick);
	}

	function startLoop() {
		if (!hasLoadedRom || isRunning) return;
		isRunning = true;
		animationFrame = requestAnimationFrame(tick);
	}

	function pauseLoop() {
		isRunning = false;
		cancelLoop();
	}

	function loadRom(romData: Uint8Array, name: string) {
		pauseLoop();
		currentRom = romData.slice();
		emulator.reset();
		emulator.loadRom(currentRom);
		hasLoadedRom = true;
		romInfo = { name, size: romData.byteLength, loadedAt: formatTimestamp(new Date()) };
		saveStates = [];
		saveCounter = 1;
		render();
		startLoop();
	}

	function onFileChange(event: Event) {
		initAudio();
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (!(result instanceof ArrayBuffer)) return;
			loadRom(new Uint8Array(result), file.name);
		};
		reader.readAsArrayBuffer(file);
	}

	function restart() {
		if (!currentRom || !romInfo) return;
		loadRom(currentRom, romInfo.name);
	}

	function stepFrame() {
		if (!hasLoadedRom) return;
		pauseLoop();
		emulator.step();
		if (emulator.delayTimer > 0) emulator.delayTimer--;
		if (emulator.soundTimer > 0) emulator.soundTimer--;
		render();
	}

	function saveState() {
		if (!hasLoadedRom || !romInfo) return;
		const nextSlot: SaveSlot = {
			id: saveCounter,
			label: `Slot ${saveCounter.toString().padStart(2, '0')}`,
			createdAt: formatTimestamp(new Date()),
			programCounter: `0x${emulator.programCounter.toString(16).toUpperCase().padStart(3, '0')}`,
			delayTimer: emulator.delayTimer,
			soundTimer: emulator.soundTimer,
			romName: romInfo.name,
			snapshot: emulator.snapshot()
		};
		saveStates = [nextSlot, ...saveStates].slice(0, MAX_SAVE_SLOTS);
		saveCounter += 1;
	}

	function restoreState(slot: SaveSlot) {
		pauseLoop();
		emulator.restore(slot.snapshot);
		hasLoadedRom = true;
		render();
	}

	function removeState(id: number) {
		saveStates = saveStates.filter((slot) => slot.id !== id);
	}

	function initAudio() {
		if (audioCtx) return;

		audioCtx = new AudioContext();
		gainNode = audioCtx.createGain();
		gainNode.gain.value = 0.1;
		gainNode.connect(audioCtx.destination);
	}

	function startBeep() {
		if (!audioCtx || !gainNode || oscillator || muted) return;

		oscillator = audioCtx.createOscillator();
		oscillator.type = 'square';
		oscillator.frequency.value = 440;
		oscillator.connect(gainNode);
		oscillator.start();
	}

	function stopBeep() {
		if (!oscillator) return;

		oscillator.stop();
		oscillator.disconnect();
		oscillator = null;
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			if (isRunning) {
				pauseLoop();
			} else {
				startLoop();
			}
			return;
		}

		const key = KEY_MAP[event.key.toLowerCase()];
		if (key !== undefined) {
			emulator.keypad[key] = true;
			syncView();
		}
	}

	function onKeyUp(event: KeyboardEvent) {
		const key = KEY_MAP[event.key.toLowerCase()];
		if (key !== undefined) {
			emulator.keypad[key] = false;
			syncView();
		}
	}

	function setTheme(id: string) {
		currentThemeId = id;
		localStorage.setItem(`${systemName}-theme`, id);
		render();
	}

	onMount(() => {
		const saved = localStorage.getItem(`${systemName}-theme`);
		if (saved && displayThemes.some(t => t.id === saved)) {
			currentThemeId = saved;
		}
		render();
	});

	onDestroy(() => {
		cancelLoop();
		stopBeep();
		audioCtx?.close();
	});
</script>

<svelte:window onkeydown={onKeyDown} onkeyup={onKeyUp} />

<div class="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
	<section class="space-y-5">
		<div class="overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#141414] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
			<div class="flex items-center justify-between border-b border-white/8 bg-[#1c1c1c] px-4 py-3">
				<div class="flex items-center gap-2">
					<span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
					<span class="h-2.5 w-2.5 rounded-full bg-[#febc2e]"></span>
					<span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
				</div>
				<div class="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#a8a8a8]">
					{romInfo?.name ?? `No ${systemName} ROM loaded`}
				</div>
				<div class="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7dff96]">
					<span class={`h-1.5 w-1.5 rounded-full shadow-[0_0_10px_#7dff96] ${isRunning ? 'bg-[#7dff96]' : 'bg-[#666666] shadow-none'}`}></span>
					{isRunning ? 'Running' : 'Paused'}
				</div>
			</div>

			<div class="relative border-b border-white/8" style={`box-shadow: inset 0 0 0 1px ${currentTheme.frame}22;`}>
				<canvas bind:this={canvas} width="640" height="320" class="block aspect-[2/1] w-full bg-black [image-rendering:pixelated]"></canvas>
				<div class="pointer-events-none absolute inset-0" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.14) 3px, rgba(0,0,0,0.14) 4px);"></div>
				<div class="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/6 to-transparent"></div>
			</div>

			<div class="grid gap-4 px-4 py-4 lg:grid-cols-[1.4fr_1fr]">
				<div class="flex flex-wrap items-center gap-2">
					<label class="inline-flex cursor-pointer items-center rounded-md border border-white/16 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white">
						Load ROM
						<input type="file" class="hidden" onchange={onFileChange} accept=".ch8,.rom" />
					</label>
					<button type="button" class="rounded-md bg-[#ff3030] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white shadow-[0_0_24px_rgba(255,48,48,0.35)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" onclick={() => (isRunning ? pauseLoop() : startLoop())} disabled={!hasLoadedRom}>
						{isRunning ? 'Pause' : 'Run'}
					</button>
					<button type="button" class="rounded-md border border-white/16 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50" onclick={restart} disabled={!hasLoadedRom}>Restart</button>
					<button type="button" class="rounded-md border border-white/16 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50" onclick={stepFrame} disabled={!hasLoadedRom}>Step</button>
					<button type="button" class="rounded-md border border-white/16 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50" onclick={saveState} disabled={!hasLoadedRom}>Save state</button>
					<button type="button" class="rounded-md border border-white/16 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white" onclick={() => { muted = !muted; if (muted) stopBeep(); }}>
						{muted ? 'Unmute' : 'Mute'}
					</button>
				</div>

				<div class="rounded-2xl border border-white/8 bg-[#101010] px-4 py-3">
					<div class="mb-2 flex items-center justify-between">
						<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Speed</span>
						<span class="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#7dff96]">{speedMultiplier}x</span>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each SPEED_OPTIONS as option}
							<button type="button" class={`rounded-md px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] ${speedMultiplier === option ? 'bg-[#7dff96] text-[#08100b]' : 'border border-white/14 text-[#b5b5b5] hover:border-white/28 hover:text-white'}`} onclick={() => (speedMultiplier = option)}>
								{option}x
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="grid gap-4 lg:grid-cols-2">
			<div class="rounded-[1.5rem] border border-white/12 bg-[#141414] p-5">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="font-display text-[2rem] tracking-[0.08em]">ROM INFO</h2>
					<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Live data</span>
				</div>
				<div class="space-y-3">
					<div class="rounded-xl border border-white/8 bg-[#1a1a1a] px-4 py-3">
						<div class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Name</div>
						<div class="mt-2 text-sm text-[#f0f0f0]">{romInfo?.name ?? 'No ROM loaded'}</div>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="rounded-xl border border-white/8 bg-[#1a1a1a] px-4 py-3">
							<div class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Size</div>
							<div class="mt-2 text-sm text-[#f0f0f0]">{romInfo ? `${romInfo.size} bytes` : 'Waiting for file'}</div>
						</div>
						<div class="rounded-xl border border-white/8 bg-[#1a1a1a] px-4 py-3">
							<div class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Loaded</div>
							<div class="mt-2 text-sm text-[#f0f0f0]">{romInfo?.loadedAt ?? 'Not loaded yet'}</div>
						</div>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each executionStats as stat}
							<div class="rounded-xl border border-white/8 bg-[#1a1a1a] px-4 py-3">
								<div class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">{stat.label}</div>
								<div class="mt-2 text-sm text-[#f0f0f0]">{stat.value}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="rounded-[1.5rem] border border-white/12 bg-[#141414] p-5">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="font-display text-[2rem] tracking-[0.08em]">COLOUR THEMES</h2>
					<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Screen palette</span>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each displayThemes as theme}
						<button type="button" class={`rounded-2xl border p-4 text-left ${currentThemeId === theme.id ? 'border-white/28 bg-[#1c1c1c]' : 'border-white/10 bg-[#171717] hover:border-white/22'}`} onclick={() => setTheme(theme.id)}>
							<div class="mb-3 flex gap-2">
								<span class="h-5 w-5 rounded-full border border-white/10" style={`background:${theme.screen};`}></span>
								<span class="h-5 w-5 rounded-full border border-white/10" style={`background:${theme.pixel};`}></span>
								<span class="h-5 w-5 rounded-full border border-white/10" style={`background:${theme.frame};`}></span>
							</div>
							<div class="font-display text-[1.5rem] tracking-[0.08em]">{theme.label}</div>
							<div class="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#8c8c8c]">Display + glow palette</div>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<aside class="space-y-4">
		<section class="rounded-[1.5rem] border border-white/12 bg-[#141414] p-5">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-[2rem] tracking-[0.08em]">SAVE STATES</h2>
				<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">{saveStates.length}/{MAX_SAVE_SLOTS}</span>
			</div>
			{#if saveStates.length === 0}
				<div class="rounded-2xl border border-dashed border-white/12 bg-[#171717] px-4 py-5 text-sm leading-7 text-[#9a9a9a]">Save states appear here after you load a ROM and capture a snapshot.</div>
			{:else}
				<div class="space-y-3">
					{#each saveStates as slot}
						<div class="rounded-2xl border border-white/8 bg-[#1a1a1a] p-4">
							<div class="flex items-start justify-between gap-3">
								<div>
									<div class="font-display text-[1.55rem] leading-none tracking-[0.08em]">{slot.label}</div>
									<div class="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#7dff96]">{slot.romName}</div>
								</div>
								<div class="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#666666]">{slot.createdAt}</div>
							</div>
							<div class="mt-4 grid gap-2 sm:grid-cols-3">
								<div class="rounded-xl bg-[#111111] px-3 py-2"><div class="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#666666]">PC</div><div class="mt-1 font-mono text-[0.72rem] text-[#e6e6e6]">{slot.programCounter}</div></div>
								<div class="rounded-xl bg-[#111111] px-3 py-2"><div class="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#666666]">Delay</div><div class="mt-1 font-mono text-[0.72rem] text-[#e6e6e6]">{slot.delayTimer}</div></div>
								<div class="rounded-xl bg-[#111111] px-3 py-2"><div class="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#666666]">Sound</div><div class="mt-1 font-mono text-[0.72rem] text-[#e6e6e6]">{slot.soundTimer}</div></div>
							</div>
							<div class="mt-4 flex gap-2">
								<button type="button" class="rounded-md bg-[#7dff96] px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[#08100b]" onclick={() => restoreState(slot)}>Load</button>
								<button type="button" class="rounded-md border border-white/16 px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[#d7d7d7] hover:border-white/28 hover:text-white" onclick={() => removeState(slot.id)}>Delete</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<section class="rounded-[1.5rem] border border-white/12 bg-[#141414] p-5">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-[2rem] tracking-[0.08em]">KEYMAP</h2>
				<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">CHIP-8 keypad</span>
			</div>
			<div class="space-y-3">
				{#each keymapRows as row}
					<div class="rounded-2xl border border-white/8 bg-[#1a1a1a] px-4 py-4">
						<div class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">CHIP-8</div>
						<div class="mt-2 font-display text-[1.5rem] tracking-[0.12em]">{row.chip8}</div>
						<div class="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#7dff96]">Keyboard: {row.keys}</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="rounded-[1.5rem] border border-white/12 bg-[#141414] p-5">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="font-display text-[2rem] tracking-[0.08em]">LIVE STATE</h2>
				<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">Registers + keys</span>
			</div>
			<div class="mb-4 grid grid-cols-4 gap-2">
				{#each activeKeys as key}
					<div class={`rounded-xl border px-0 py-3 text-center font-mono text-[0.72rem] uppercase tracking-[0.16em] ${key.pressed ? 'border-[#7dff96]/40 bg-[#7dff96]/12 text-[#7dff96]' : 'border-white/8 bg-[#1a1a1a] text-[#7d7d7d]'}`}>{key.label}</div>
				{/each}
			</div>
			<div class="grid grid-cols-2 gap-2">
				{#each registerPairs as register}
					<div class="rounded-xl border border-white/8 bg-[#1a1a1a] px-3 py-2">
						<div class="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#666666]">{register.name}</div>
						<div class="mt-1 font-mono text-[0.72rem] text-[#e6e6e6]">{register.value}</div>
					</div>
				{/each}
			</div>
		</section>
	</aside>
</div>
