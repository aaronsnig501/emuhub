<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	function drawPong() {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = 'rgba(0,232,176,0.012)';
		for (let y = 0; y < height; y += 8) {
			ctx.fillRect(0, y, width, 4);
		}

		ctx.setLineDash([8, 8]);
		ctx.strokeStyle = 'rgba(255,255,255,0.1)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(width / 2, 0);
		ctx.lineTo(width / 2, height);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.shadowBlur = 12;
		ctx.shadowColor = '#00e8b0';
		ctx.fillStyle = '#00e8b0';
		ctx.fillRect(24, height / 2 - 48, 8, 96);
		ctx.fillRect(width - 32, height / 2 - 56, 8, 96);

		ctx.shadowBlur = 14;
		ctx.shadowColor = '#ffffff';
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(width / 2 + 44, height / 2 - 18, 8, 8);

		ctx.shadowBlur = 0;
		ctx.fillStyle = 'rgba(0,232,176,0.7)';
		ctx.font = 'bold 18px "DM Mono", monospace';
		ctx.textAlign = 'center';
		ctx.fillText('3', width / 4, 32);
		ctx.fillText('2', (3 * width) / 4, 32);

		ctx.fillStyle = 'rgba(0,232,176,0.06)';
		ctx.fillRect(16, height / 2 - 56, 24, 112);
		ctx.fillRect(width - 40, height / 2 - 64, 24, 112);
	}

	onMount(() => {
		drawPong();
	});
</script>

<canvas bind:this={canvas} width="640" height="320" class="block w-full [image-rendering:pixelated]"></canvas>
