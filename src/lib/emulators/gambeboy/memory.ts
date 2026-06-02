export class Memory {
  data: Uint8Array = new Uint8Array(0x10000);

  read(address: number): number {
    return this.data[address];
  }

  write(address: number, value:number): void {
    this.data[address] = value;
  }

  loadRom(rom: Uint8Array): void {
    this.data.set(rom, 0x0000);
  }
}