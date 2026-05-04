<script lang="ts">
  import { Chip8 } from '$lib/chip8';

const chip8 = new Chip8();
let canvas: HTMLCanvasElement;
let animationFrame: number;
let currentRom: Uint8Array | null = $state(null);
const STEPS_PER_FRAME = 10;

function loadRom(romData: Uint8Array) {
  chip8.reset();
  chip8.loadRom(romData);
  cancelAnimationFrame(animationFrame);
  loop();
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentRom = new Uint8Array(reader.result as ArrayBuffer);
    loadRom(currentRom);
  };
  reader.readAsArrayBuffer(file);
}

function restart() {
  if (!currentRom) return;
  loadRom(currentRom);
}

function render() {
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 640, 320);
  ctx.fillStyle = 'white';
  for (let i = 0; i < 64 * 32; i++) {
    if (chip8.display[i] === 1) {
      const x = (i % 64) * 10;
      const y = Math.floor(i / 64) * 10;
      ctx.fillRect(x, y, 10, 10);
    }
  }
}

function loop() {
  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    chip8.step();
  }
  if (chip8.delayTimer > 0) chip8.delayTimer--;
  if (chip8.soundTimer > 0) chip8.soundTimer--;
  render();
  animationFrame = requestAnimationFrame(loop);
}

const KEY_MAP: Record<string, number> = {
  '1': 0x1, '2': 0x2, '3': 0x3, '4': 0xC,
  'q': 0x4, 'w': 0x5, 'e': 0x6, 'r': 0xD,
  'a': 0x7, 's': 0x8, 'd': 0x9, 'f': 0xE,
  'z': 0xA, 'x': 0x0, 'c': 0xB, 'v': 0xF
};

function onKeyDown(e: KeyboardEvent) {
  const key = KEY_MAP[e.key];
  if (key !== undefined) chip8.keypad[key] = true;
}

function onKeyUp(e: KeyboardEvent) {
  const key = KEY_MAP[e.key];
  if (key !== undefined) chip8.keypad[key] = false;
}
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<input type="file" on:change={onFileChange} accept=".ch8,.rom" />
<canvas width={640} height={320} bind:this={canvas} />
<button on:click={restart} disabled={!currentRom}>Restart</button>