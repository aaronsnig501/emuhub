export class CPU {
  // 8-bit registers
  a: number = 0;
  b: number = 0;
  c: number = 0;
  d: number = 0;
  e: number = 0;
  f: number = 0;
  h: number = 0;
  l: number = 0;

  // 16-bit registers
  sp: number = 0;
  pc: number = 0x100;

  // state
  halted: boolean = false;
  ime: boolean = false;

  get af(): number {
    return (this.a << 8) | this.f;
  }

  set af(val: number) {
    this.a = (val >> 8) & 0xFF;
    this.f = val & 0xF0;
  }

  get flagN(): boolean {
    return (this.f & 0x40) !== 0;
  }

  set flagN(val: boolean) {
    this.f = val ? this.f | 0x40 : this.f & ~0x40;
  }

  get flagH(): boolean {
    return (this.f & 0x20) !== 0;
  }

  set flagH(val: boolean) {
    this.f = val ? this.f | 0x20 : this.f & ~0x20;
  }

  get flagC(): boolean {
    return (this.f & 0x10) !== 0;
  }

  set flagC(val: boolean) {
    this.f = val ? this.f | 0x10 : this.f & ~0x10;
  }

  get flagZ(): boolean {
    return (this.f & 0x80) !== 0;
  }

  set flagZ(val: boolean) {
    this.f = val ? this.f | 0x80 : this.f & ~0x80;
  }

  get bc(): number {
    return (this.b << 8) | this.c;
  }

  set bc(val: number) {
    this.b = (val >> 8) & 0xFF;
    this.c = val & 0xFF;
  }

  get de(): number {
    return (this.d << 8) | this.e;
  }

  set de(val: number) {
    this.d = (val >> 8) & 0xFF;
    this.e = val & 0xFF;
  }

  get hl(): number {
    return (this.h << 8) | this.l;
  }

  set hl(val: number) {
    this.h = (val >> 8) & 0xFF;
    this.l = val & 0xFF;
  }
}