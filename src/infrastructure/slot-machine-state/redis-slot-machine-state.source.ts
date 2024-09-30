import { randomUUID } from "crypto";
import {
  SlotMachineStateSource,
  slotMachineStateSourceToken,
} from "../../application/interfaces/slot-machine-state.source";
import { SlotMachineState } from "../../domain/slot-machine-state";
import { errored, notFound } from "../../application/interfaces/errors";
import { Logger, loggerToken } from "../../application/interfaces/logger";
import { Inject, Service } from "typedi";
import { RedisConnectionFactory } from "../redis-connection-factory";
import { RedisSlotMachineStateMapper } from "./redis-slot-machine-state.mapper";

@Service(slotMachineStateSourceToken)
export class RedisSlotMachineStateSource implements SlotMachineStateSource {
  constructor(
    private readonly connectionFactory: RedisConnectionFactory,
    private readonly mapper: RedisSlotMachineStateMapper,
    @Inject(loggerToken) private readonly logger: Logger
  ) {}

  async newOne(): Promise<SlotMachineState | typeof errored> {
    const state = SlotMachineState.newOne(randomUUID(), 100);

    return await this.save(state);
  }

  async findOne(predicate: {
    gameId: string;
  }): Promise<SlotMachineState | typeof notFound | typeof errored> {
    const maybeJson = await this.connectionFactory.execute((connection) =>
      connection.get(RedisSlotMachineStateSource.keyForGameId(predicate.gameId))
    );

    if (maybeJson == errored) {
      this.logger.error(
        `Unable to read a state for gameId: ${predicate.gameId}`
      );

      return errored;
    }

    if (maybeJson == null) {
      return notFound;
    }

    const maybeSnapshot = this.mapper.fromJson(maybeJson);
    if (maybeSnapshot == errored) {
      return errored;
    }

    return SlotMachineState.fromSnapshot({
      gameId: predicate.gameId,
      ...maybeSnapshot,
    });
  }

  async save(
    state: SlotMachineState
  ): Promise<SlotMachineState | typeof errored> {
    const snapshot = state.toSnapshot();

    const maybeJson = this.mapper.toJson(snapshot);
    if (maybeJson == errored) {
      return errored;
    }

    const result = await this.connectionFactory.execute((connection) =>
      connection.set(
        RedisSlotMachineStateSource.keyForGameId(snapshot.gameId),
        maybeJson
      )
    );

    if (result == errored) {
      this.logger.error(
        `Unable to write a state for gameId: ${snapshot.gameId}`
      );

      return errored;
    }

    return state;
  }

  static keyForGameId(gameId: string) {
    return `sms-${gameId}`;
  }
}
