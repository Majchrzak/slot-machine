export type Slot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export class Spin {
  constructor(readonly slots: [Slot, Slot, Slot]) {}

  isPassed() {
    return this.slots[0] == this.slots[1] && this.slots[0] == this.slots[2];
  }

  points() {
    if (!this.isPassed()) {
      return 0;
    }

    return this.slots.reduce((points, slot) => points + slot, 0);
  }
}
