import { SpinGenerator } from "./spin/generator/spin-generator";
import { SlotMachineState } from "./slot-machine-state";
import { Missions } from "./mission/missions";
import { Spin } from "./spin/spin";

export type SlotMachineSnapshot = ReturnType<SlotMachine["toSnapshot"]>;

export class SlotMachine {
  public constructor(private readonly state: SlotMachineState) {}

  trySpin(generator: SpinGenerator, missions: Missions): boolean {
    if (!this.state.tryAcquireSpin()) {
      return false;
    }

    const spin = generator.for(this.state);

    this.spin(spin, missions);

    return true;
  }

  private spin(spin: Spin, missions: Missions) {
    const fromState = this.state.toSnapshot();

    this.state.spinCompleted(spin);

    const toState = this.state.toSnapshot();

    for (const mission of missions.forTransition(fromState, toState)) {
      this.state.missionCompleted(mission);
    }
  }

  toSnapshot() {
    const state = this.state.toSnapshot();

    return {
      isGameOver: state.spins == 0,
      state,
    };
  }
}
