const FONT_SET = new Uint8Array([
  0xF0, 0x90, 0x90, 0x90, 0xF0,
  0x20, 0x60, 0x20, 0x20, 0x70,
  0xF0, 0x10, 0xF0, 0x80, 0xF0,
  0xF0, 0x10, 0xF0, 0x10, 0xF0,
  0x90, 0x90, 0xF0, 0x10, 0x10,
  0xF0, 0x80, 0xF0, 0x10, 0xF0,
  0xF0, 0x80, 0xF0, 0x90, 0xF0,
  0xF0, 0x10, 0x20, 0x40, 0x40,
  0xF0, 0x90, 0xF0, 0x90, 0xF0,
  0xF0, 0x90, 0xF0, 0x10, 0xF0,
  0xF0, 0x90, 0xF0, 0x90, 0x90,
  0xE0, 0x90, 0xE0, 0x90, 0xE0,
  0xF0, 0x80, 0x80, 0x80, 0xF0,
  0xE0, 0x90, 0x90, 0x90, 0xE0,
  0xF0, 0x80, 0xF0, 0x80, 0xF0,
  0xF0, 0x80, 0xF0, 0x80, 0x80
]);

export type Chip8Snapshot = {
  memory: Uint8Array;
  registers: Uint8Array;
  indexRegister: number;
  programCounter: number;
  stack: number[];
  delayTimer: number;
  soundTimer: number;
  display: Uint8Array;
  keypad: boolean[];
};

export class Chip8 {
  memory: Uint8Array = new Uint8Array(4096);
  registers: Uint8Array = new Uint8Array(16);
  indexRegister = 0;
  programCounter = 0x200;
  stack: number[] = [];
  delayTimer = 0;
  soundTimer = 0;
  display: Uint8Array = new Uint8Array(64 * 32);
  keypad: boolean[] = new Array(16).fill(false);

  constructor() {
    this.memory.set(FONT_SET, 0x000);
  }

  loadRom(romData: Uint8Array) {
    this.memory.set(romData, 0x200);
  }

  private jump(val: number | undefined) {
    if (val === undefined) {
      console.warn('Val is undefined');
      return;
    }
    this.programCounter = val;
  }

  private skip() {
    this.programCounter += 2;
  }

  reset() {
    this.memory = new Uint8Array(4096);
    this.registers = new Uint8Array(16);
    this.indexRegister = 0;
    this.programCounter = 0x200;
    this.stack = [];
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.display = new Uint8Array(64 * 32);
    this.keypad = new Array(16).fill(false);
    this.memory.set(FONT_SET, 0x000);
  }

  snapshot(): Chip8Snapshot {
    return {
      memory: this.memory.slice(),
      registers: this.registers.slice(),
      indexRegister: this.indexRegister,
      programCounter: this.programCounter,
      stack: [...this.stack],
      delayTimer: this.delayTimer,
      soundTimer: this.soundTimer,
      display: this.display.slice(),
      keypad: [...this.keypad]
    };
  }

  restore(snapshot: Chip8Snapshot) {
    this.memory = snapshot.memory.slice();
    this.registers = snapshot.registers.slice();
    this.indexRegister = snapshot.indexRegister;
    this.programCounter = snapshot.programCounter;
    this.stack = [...snapshot.stack];
    this.delayTimer = snapshot.delayTimer;
    this.soundTimer = snapshot.soundTimer;
    this.display = snapshot.display.slice();
    this.keypad = [...snapshot.keypad];
  }

  step() {
    if (this.programCounter >= 4096) {
      console.warn('Program counter out of bounds:', this.programCounter);
      return;
    }

    const instruction = (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];
    this.programCounter += 2;

    const nibble = (instruction & 0xF000) >> 12;
    const x = (instruction & 0x0F00) >> 8;
    const y = (instruction & 0x00F0) >> 4;
    const n = instruction & 0x000F;
    const nn = instruction & 0x00FF;
    const nnn = instruction & 0x0FFF;

    switch (nibble) {
      case 0x0:
        if (instruction === 0x00E0) this.display.fill(0);
        if (instruction === 0x00EE) this.jump(this.stack.pop());
        break;
      case 0x1:
        this.jump(nnn);
        break;
      case 0x2:
        this.stack.push(this.programCounter);
        this.jump(nnn);
        break;
      case 0x3:
        if (this.registers[x] === nn) this.skip();
        break;
      case 0x4:
        if (this.registers[x] !== nn) this.skip();
        break;
      case 0x5:
        if (this.registers[x] === this.registers[y]) this.skip();
        break;
      case 0x6:
        this.registers[x] = nn;
        break;
      case 0x7:
        this.registers[x] = (this.registers[x] + nn) & 0xFF;
        break;
      case 0x8:
        switch (n) {
          case 0x0:
            this.registers[x] = this.registers[y];
            break;
          case 0x1:
            this.registers[x] |= this.registers[y];
            break;
          case 0x2:
            this.registers[x] &= this.registers[y];
            break;
          case 0x3:
            this.registers[x] ^= this.registers[y];
            break;
          case 0x4: {
            const sum = this.registers[x] + this.registers[y];
            this.registers[0xF] = sum > 255 ? 1 : 0;
            this.registers[x] = sum & 0xFF;
            break;
          }
          case 0x5:
            this.registers[0xF] = this.registers[x] > this.registers[y] ? 1 : 0;
            this.registers[x] = (this.registers[x] - this.registers[y]) & 0xFF;
            break;
          case 0x6:
            this.registers[0xF] = this.registers[x] & 0x1;
            this.registers[x] >>= 1;
            break;
          case 0x7:
            this.registers[0xF] = this.registers[y] > this.registers[x] ? 1 : 0;
            this.registers[x] = (this.registers[y] - this.registers[x]) & 0xFF;
            break;
          case 0xE:
            this.registers[0xF] = (this.registers[x] >> 7) & 0x1;
            this.registers[x] = (this.registers[x] << 1) & 0xFF;
            break;
        }
        break;
      case 0x9:
        if (this.registers[x] !== this.registers[y]) this.skip();
        break;
      case 0xA:
        this.indexRegister = nnn;
        break;
      case 0xB:
        this.jump(nnn + this.registers[0]);
        break;
      case 0xC:
        this.registers[x] = Math.floor(Math.random() * 256) & nn;
        break;
      case 0xD:
        this.registers[0xF] = 0;
        for (let i = 0; i < n; i++) {
          const byte = this.memory[this.indexRegister + i];
          for (let j = 0; j < 8; j++) {
            if (byte & (0x80 >> j)) {
              const px = (this.registers[x] + j) % 64;
              const py = (this.registers[y] + i) % 32;
              const index = py * 64 + px;
              if (this.display[index] === 1) this.registers[0xF] = 1;
              this.display[index] ^= 1;
            }
          }
        }
        break;
      case 0xE:
        switch (nn) {
          case 0x9E:
            if (this.keypad[this.registers[x]]) this.skip();
            break;
          case 0xA1:
            if (!this.keypad[this.registers[x]]) this.skip();
            break;
        }
        break;
      case 0xF:
        switch (nn) {
          case 0x07:
            this.registers[x] = this.delayTimer;
            break;
          case 0x15:
            this.delayTimer = this.registers[x];
            break;
          case 0x18:
            this.soundTimer = this.registers[x];
            break;
          case 0x1E:
            this.indexRegister += this.registers[x];
            break;
          case 0x29:
            this.indexRegister = this.registers[x] * 5;
            break;
          case 0x33: {
            const val = this.registers[x];
            this.memory[this.indexRegister] = Math.floor(val / 100);
            this.memory[this.indexRegister + 1] = Math.floor(val / 10) % 10;
            this.memory[this.indexRegister + 2] = val % 10;
            break;
          }
          case 0x55:
            for (let i = 0; i <= x; i++) this.memory[this.indexRegister + i] = this.registers[i];
            break;
          case 0x65:
            for (let i = 0; i <= x; i++) this.registers[i] = this.memory[this.indexRegister + i];
            break;
        }
        break;
      default:
        console.warn(`Unknown instruction: 0x${instruction.toString(16).toUpperCase().padStart(4, '0')}`);
        break;
    }
  }
}
