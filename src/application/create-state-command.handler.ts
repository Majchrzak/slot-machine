import { Inject, Service } from "typedi";
import {
  SlotMachineStateSource,
  slotMachineStateSourceToken,
} from "./interfaces/slot-machine-state.source";
import { SlotMachineStateSnapshot } from "../domain/slot-machine-state";
import { errored } from "./interfaces/errors";
import { Logger, loggerToken } from "./interfaces/logger";

export class CreateStateCommand {}

export type CreateStateCommandResult =
  | SlotMachineStateSnapshot
  | typeof errored;

@Service()
export class CreateStateCommandHandler {
  constructor(
    @Inject(slotMachineStateSourceToken)
    private readonly slotMachineStateSource: SlotMachineStateSource,
    @Inject(loggerToken)
    private readonly logger: Logger
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(command: CreateStateCommand): Promise<CreateStateCommandResult> {
    const maybeState = await this.slotMachineStateSource.newOne();

    switch (maybeState) {
      case errored:
        this.logger.error(`Unable to create a new state.`);
        return errored;
    }

    return maybeState.toSnapshot();
  }
}
