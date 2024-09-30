import { SlotMachineStateSnapshot } from "../../domain/slot-machine-state";

export class SlotMachineStateResponse {
  gameId: string;
  state: {
    spins: number;
    coins: number;
    points: number;
  };

  static fromSnapshot(
    snapshot: SlotMachineStateSnapshot
  ): SlotMachineStateResponse {
    return {
      gameId: snapshot.gameId,
      state: {
        spins: snapshot.spins,
        coins: snapshot.coins,
        points: snapshot.points,
      },
    };
  }
}
