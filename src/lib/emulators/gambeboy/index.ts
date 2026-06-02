import { CPU } from "./cpu";
import { Memory } from "./memory";

export class GameBoy {
  cpu: CPU = new CPU();
  memory: Memory = new Memory();

  loadRom(rom: Uint8Array) {
    this.memory.loadRom(rom);
  }
}