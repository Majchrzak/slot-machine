import { SlotMachineStateSnapshot } from "../../domain/slot-machine-state";
import { SlotMachineStateResponse } from "./slot-machine-state.response";

describe(SlotMachineStateResponse.name, () => {
  describe("fromSnapshot", () => {
    test("happy path", () => {
      const snapshot: SlotMachineStateSnapshot = {
        gameId: "game-id",
        spins: 1,
        coins: 2,
        points: 3,
        version: 4,
      };

      expect(SlotMachineStateResponse.fromSnapshot(snapshot)).toEqual({
        gameId: "game-id",
        state: {
          spins: 1,
          coins: 2,
          points: 3,
        },
      });
    });
  });
});
