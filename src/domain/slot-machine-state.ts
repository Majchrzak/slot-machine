import { Mission } from "./mission/mission";
import { Spin } from "./spin/spin";

export type SlotMachineStateSnapshot = ReturnType<
  SlotMachineState["toSnapshot"]
>;

export class SlotMachineState {
  static newOne(gameId: string, spins: number) {
    return new SlotMachineState(gameId, spins, 0, 0, 1);
  }

  static fromSnapshot(snapshot: SlotMachineStateSnapshot): SlotMachineState {
    return new SlotMachineState(
      snapshot.gameId,
      snapshot.spins,
      snapshot.coins,
      snapshot.points,
      snapshot.version
    );
  }

  constructor(
    private gameId: string,
    private spins: number,
    private coins: number,
    private points: number,
    private version: number
  ) {}

  tryAcquireSpin(): boolean {
    if (this.spins == 0) {
      return false;
    }

    this.spins = Math.max(this.spins - 1, 0);

    return true;
  }

  spinCompleted(spin: Spin) {
    this.points += spin.points();
  }

  missionCompleted(mission: Mission) {
    for (const reward of mission.rewards) {
      switch (reward.name) {
        case "spins":
          this.spins += reward.value;
          break;
        case "coins":
          this.coins += reward.value;
      }
    }
  }

  toSnapshot() {
    return {
      gameId: this.gameId,
      spins: this.spins,
      coins: this.coins,
      points: this.points,
      version: this.version,
    };
  }
}
