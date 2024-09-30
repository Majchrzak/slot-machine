import { Inject, Service } from "typedi";
import { RedisSlotMachineStateSchema } from "./redis-slot-machine-state.schema";
import { errored } from "../../application/interfaces/errors";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { SlotMachineStateSnapshot } from "../../domain/slot-machine-state";
import { Logger, loggerToken } from "../../application/interfaces/logger";

@Service()
export class RedisSlotMachineStateMapper {
  constructor(@Inject(loggerToken) private readonly logger: Logger) {}

  fromJson(
    json: string
  ): Omit<SlotMachineStateSnapshot, "gameId"> | typeof errored {
    const schema = plainToInstance(
      RedisSlotMachineStateSchema,
      JSON.parse(json)
    );

    const errors = validateSync(schema);
    if (errors.length) {
      this.logger.error("Unable to deserialize a state", errors);

      return errored;
    }

    return {
      spins: schema.s,
      coins: schema.c,
      points: schema.p,
      version: schema.v,
    };
  }

  toJson(
    snapshot: Omit<SlotMachineStateSnapshot, "gameId">
  ): string | typeof errored {
    const schema = Object.assign(new RedisSlotMachineStateSchema(), {
      s: snapshot.spins,
      c: snapshot.coins,
      p: snapshot.points,
      v: snapshot.version,
    });

    const errors = validateSync(schema);
    if (errors.length) {
      this.logger.error("Unable to serialize a state", errors);

      return errored;
    }

    return JSON.stringify(schema);
  }
}
