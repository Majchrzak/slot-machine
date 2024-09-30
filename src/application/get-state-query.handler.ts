import { Inject, Service } from "typedi";
import { Mutex, mutexToken } from "./interfaces/mutex";
import {
  SlotMachineStateSource,
  slotMachineStateSourceToken,
} from "./interfaces/slot-machine-state.source";
import { SlotMachineStateSnapshot } from "../domain/slot-machine-state";
import { errored, notFound } from "./interfaces/errors";
import { Logger, loggerToken } from "./interfaces/logger";

export class GetStateQuery {
  gameId: string;
}

export type GetStateQueryResult =
  | SlotMachineStateSnapshot
  | typeof notFound
  | typeof errored;

@Service()
export class GetStateQueryHandler {
  constructor(
    @Inject(slotMachineStateSourceToken)
    private readonly slotMachineStateSource: SlotMachineStateSource,
    @Inject(loggerToken)
    private readonly logger: Logger,
    @Inject(mutexToken)
    private readonly mutex: Mutex
  ) {}

  async handle(query: GetStateQuery): Promise<GetStateQueryResult> {
    const { gameId } = query;

    return this.mutex.acquireLock(`slot-machine-${gameId}`, async () => {
      const maybeState = await this.slotMachineStateSource.findOne({ gameId });

      switch (maybeState) {
        case notFound:
          this.logger.error(`State is missing for gameId: ${gameId}`);
          return notFound;
        case errored:
          this.logger.error(`Unable to get state for gameId: ${gameId}`);
          return errored;
      }

      return maybeState.toSnapshot();
    });
  }
}
