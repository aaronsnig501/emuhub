<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	type RomEntry = {
		name: string;
		size: number;
		modifiedAt: string;
	};

	let { data }: { data: { selfHosted: boolean; selfHostedTokenConfigured: boolean } } = $props();

	let token = $state('');
	let roms = $state<RomEntry[]>([]);
	let status = $state('Self-hosted ROM management is disabled in cloud mode.');
	let isLoading = $state(false);
	let isUploading = $state(false);

	function authHeaders(): Record<string, string> {
		return token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {};
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('en', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(value));
	}

	function saveToken() {
		if (!browser) return;
		localStorage.setItem('emuhub.selfHostedToken', token.trim());
		status = 'Token stored in this browser.';
		void refreshRoms();
	}

	async function refreshRoms() {
		if (!data.selfHosted || !token.trim()) return;
		isLoading = true;
		status = 'Loading ROM library...';

		try {
			const response = await fetch(`${base}/api/roms`, {
				headers: authHeaders()
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.message || body.error || `Request failed with ${response.status}`);
			}

			const payload = await response.json();
			roms = payload.roms;
			status = roms.length ? 'Library loaded.' : 'No ROMs uploaded yet.';
		} catch (err) {
			status = err instanceof Error ? err.message : 'Failed to load ROM library.';
		} finally {
			isLoading = false;
		}
	}

	async function onUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file || !token.trim()) return;

		isUploading = true;
		status = `Uploading ${file.name}...`;

		try {
			const formData = new FormData();
			formData.set('rom', file);

			const response = await fetch(`${base}/api/roms`, {
				method: 'POST',
				headers: authHeaders(),
				body: formData
			});

			const body = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(body.message || body.error || `Upload failed with ${response.status}`);
			}

			status = `${body.name} uploaded.`;
			await refreshRoms();
		} catch (err) {
			status = err instanceof Error ? err.message : 'Upload failed.';
		} finally {
			isUploading = false;
			(event.target as HTMLInputElement).value = '';
		}
	}

	async function deleteRom(name: string) {
		status = `Deleting ${name}...`;
		try {
			const response = await fetch(`${base}/api/roms/${encodeURIComponent(name)}`, {
				method: 'DELETE',
				headers: authHeaders()
			});

			const body = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(body.message || body.error || `Delete failed with ${response.status}`);
			}

			status = `${name} deleted.`;
			await refreshRoms();
		} catch (err) {
			status = err instanceof Error ? err.message : 'Delete failed.';
		}
	}

	async function downloadRom(name: string) {
		status = `Downloading ${name}...`;
		try {
			const response = await fetch(`${base}/api/roms/${encodeURIComponent(name)}`, {
				headers: authHeaders()
			});

			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.message || body.error || `Download failed with ${response.status}`);
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = name;
			link.click();
			URL.revokeObjectURL(url);
			status = `${name} downloaded.`;
		} catch (err) {
			status = err instanceof Error ? err.message : 'Download failed.';
		}
	}

	onMount(() => {
		if (!browser || !data.selfHosted) return;
		token = localStorage.getItem('emuhub.selfHostedToken') ?? '';
		if (token.trim()) {
			void refreshRoms();
		} else {
			status = 'Enter your self-hosted API token to manage private ROMs.';
		}
	});
</script>

<svelte:head>
	<title>EMU·HUB — Library</title>
</svelte:head>

<div class="min-h-screen bg-[#090909] px-4 pb-10 pt-24 text-[#f0f0f0] sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl">
		<div class="mb-8">
			<p class="section-eyebrow">Library</p>
			<h1 class="mt-4 font-display text-[clamp(3rem,7vw,4.8rem)] leading-[0.92] tracking-[0.14em]">
				PRIVATE ROMS.
				<br />
				<span class="text-[#7dff96]">YOUR HARDWARE.</span>
			</h1>
			<p class="mt-4 max-w-3xl text-sm leading-7 text-[#a8a8a8] sm:text-base">
				Self-hosted mode unlocks a private ROM library backed by your own storage. Cloud mode keeps
				this surface disabled and the ROM API unavailable.
			</p>
		</div>

		{#if !data.selfHosted}
			<div class="rounded-[2rem] border border-white/10 bg-[#141414] p-8">
				<div class="font-display text-[2.2rem] tracking-[0.08em]">SELF-HOSTED ONLY</div>
				<p class="mt-4 max-w-2xl text-sm leading-7 text-[#a8a8a8]">
					Start the app with `SELF_HOSTED=true` to enable ROM upload, listing, download, and delete
					operations. In cloud mode these endpoints return 404 and no private storage UI is exposed.
				</p>
				<p class="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#666666]">
					See docs/self-hosting.md for Docker and reverse-proxy setup.
				</p>
			</div>
		{:else}
			<div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
				<section class="rounded-[2rem] border border-white/10 bg-[#141414] p-6">
					<div class="mb-5 flex items-center justify-between">
						<h2 class="font-display text-[2rem] tracking-[0.08em]">ACCESS</h2>
						<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">
							Token required
						</span>
					</div>

					<label class="block">
						<span class="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#a8a8a8]">
							Self-hosted API token
						</span>
						<input
							class="w-full rounded-xl border border-white/12 bg-[#101010] px-4 py-3 text-sm text-white outline-none focus:border-[#7dff96]/40"
							type="password"
							bind:value={token}
							placeholder="SELF_HOSTED_API_TOKEN"
						/>
					</label>

					<div class="mt-4 flex flex-wrap gap-2">
						<button
							type="button"
							class="rounded-md bg-[#7dff96] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#08100b]"
							onclick={saveToken}
						>
							Save token
						</button>
						<button
							type="button"
							class="rounded-md border border-white/16 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white"
							onclick={() => refreshRoms()}
							disabled={!token.trim() || isLoading}
						>
							Refresh
						</button>
					</div>

					<div class="mt-6 rounded-2xl border border-white/8 bg-[#101010] p-4">
						<div class="font-display text-[1.65rem] tracking-[0.08em]">UPLOAD ROM</div>
						<p class="mt-2 text-sm leading-7 text-[#a8a8a8]">
							Accepted formats: `.ch8`, `.rom`
						</p>
						<label class="mt-4 inline-flex cursor-pointer rounded-md border border-white/16 px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#d7d7d7] hover:border-white/30 hover:text-white">
							{isUploading ? 'Uploading...' : 'Choose ROM'}
							<input
								type="file"
								class="hidden"
								accept=".ch8,.rom"
								onchange={onUpload}
								disabled={!token.trim() || isUploading}
							/>
						</label>
					</div>

					<div class="mt-6 rounded-2xl border border-white/8 bg-[#101010] p-4">
						<div class="font-display text-[1.65rem] tracking-[0.08em]">STATUS</div>
						<p class="mt-3 text-sm leading-7 text-[#a8a8a8]">{status}</p>
						{#if !data.selfHostedTokenConfigured}
							<p class="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#ff3030]">
								Server token is not configured. Set `SELF_HOSTED_API_TOKEN` first.
							</p>
						{/if}
					</div>
				</section>

				<section class="rounded-[2rem] border border-white/10 bg-[#141414] p-6">
					<div class="mb-5 flex items-center justify-between">
						<h2 class="font-display text-[2rem] tracking-[0.08em]">ROM LIBRARY</h2>
						<span class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#666666]">
							{roms.length} files
						</span>
					</div>

					{#if roms.length === 0}
						<div class="rounded-2xl border border-dashed border-white/12 bg-[#101010] p-5 text-sm leading-7 text-[#9a9a9a]">
							No ROMs are stored yet. Save a token, upload a file, and refresh the library.
						</div>
					{:else}
						<div class="space-y-3">
							{#each roms as rom}
								<div class="rounded-2xl border border-white/8 bg-[#101010] p-4">
									<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div>
											<div class="font-display text-[1.7rem] leading-none tracking-[0.08em]">
												{rom.name}
											</div>
											<div class="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#666666]">
												{rom.size} bytes · updated {formatDate(rom.modifiedAt)}
											</div>
										</div>
										<div class="flex flex-wrap gap-2">
											<button
												type="button"
												class="rounded-md bg-[#7dff96] px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[#08100b]"
												onclick={() => downloadRom(rom.name)}
											>
												Download
											</button>
											<button
												type="button"
												class="rounded-md border border-white/16 px-3 py-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[#d7d7d7] hover:border-white/28 hover:text-white"
												onclick={() => deleteRom(rom.name)}
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>
		{/if}
	</div>
</div>
