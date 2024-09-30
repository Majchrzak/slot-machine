import { Token } from "typedi";
import { SlotMachineState } from "../../domain/slot-machine-state";
import { errored, notFound } from "./errors";

export const slotMachineStateSourceToken = new Token(
  "slot-machine-state-source-token"
);

export abstract class SlotMachineStateSource {
  abstract newOne(): Promise<SlotMachineState | typeof errored>;
  abstract findOne(predicate: {
    gameId: string;
  }): Promise<SlotMachineState | typeof notFound | typeof errored>;
  abstract save(
    state: SlotMachineState
  ): Promise<SlotMachineState | typeof errored>;
}
