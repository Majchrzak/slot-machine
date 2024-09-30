import { Inject, Service } from "typedi";
import { Mutex, mutexToken } from "./interfaces/mutex";
import {
  SlotMachineStateSource,
  slotMachineStateSourceToken,
} from "./interfaces/slot-machine-state.source";
import { SlotMachine } from "../domain/slot-machine";
import {
  MissionsSource,
  missionsSourceToken,
} from "./interfaces/missions.source";
import { SpinGeneratorSource } from "./interfaces/spin-generator.source";
import { SlotMachineStateSnapshot } from "../domain/slot-machine-state";
import { errored, notFound } from "./interfaces/errors";
import { Logger, loggerToken } from "./interfaces/logger";

export class SpinCommand {
  gameId: string;
}

export type SpinCommandResult =
  | SlotMachineStateSnapshot
  | typeof notFound
  | typeof errored;

@Service()
export class SpinCommandHandler {
  constructor(
    @Inject(slotMachineStateSourceToken)
    private readonly slotMachineStateSource: SlotMachineStateSource,
    @Inject(missionsSourceToken)
    private readonly missionsSource: MissionsSource,
    private readonly spinGeneratorSource: SpinGeneratorSource,
    @Inject(loggerToken)
    private readonly logger: Logger,
    @Inject(mutexToken)
    private readonly mutex: Mutex
  ) {}

  async handle(command: SpinCommand): Promise<SpinCommandResult> {
    const maybeMissions = await this.missionsSource.get();
    if (maybeMissions == errored) {
      this.logger.error(`Unable to get missions for gameId: ${command.gameId}`);

      return errored;
    }

    const generator = await this.spinGeneratorSource.get();

    return this.mutex.acquireLock(
      `slot-machine-${command.gameId}`,
      async () => {
        let maybeState = await this.slotMachineStateSource.findOne(command);

        switch (maybeState) {
          case notFound:
            this.logger.error(`State is missing for gameId: ${command.gameId}`);
            return notFound;
          case errored:
            this.logger.error(
              `Unable to get state for gameId: ${command.gameId}`
            );
            return errored;
        }

        const machine = new SlotMachine(maybeState);

        if (!machine.trySpin(generator, maybeMissions)) {
          return maybeState.toSnapshot();
        }

        maybeState = await this.slotMachineStateSource.save(maybeState);

        switch (maybeState) {
          case errored:
            this.logger.error(
              `Unable to save state for gameId: ${command.gameId}`
            );
            return errored;
        }

        return maybeState.toSnapshot();
      }
    );
  }
}
