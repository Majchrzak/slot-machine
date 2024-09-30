import { SlotMachineState } from "../../slot-machine-state";
import { Spin } from "../spin";

export interface SpinGenerator {
  for(state: SlotMachineState): Spin;
}
