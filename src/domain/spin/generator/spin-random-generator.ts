import { Slot, Spin } from "../spin";
import { SpinGenerator } from "./spin-generator";

export class SpinRandomGenerator implements SpinGenerator {
  private static readonly MIN_VALUE = 1;
  private static readonly MAX_VALUE = 9;

  for(): Spin {
    return new Spin([
      this.nextRandomSlot(),
      this.nextRandomSlot(),
      this.nextRandomSlot(),
    ]);
  }

  private nextRandomSlot(): Slot {
    const min = Math.ceil(SpinRandomGenerator.MIN_VALUE);
    const max = Math.floor(SpinRandomGenerator.MAX_VALUE);
    const random = Math.random();

    return (Math.floor(random * (max - min)) + min) as Slot;
  }
}
