import { Inject, Service } from "typedi";
import {
  MissionsSource,
  missionsSourceToken,
} from "../../application/interfaces/missions.source";
import { Missions } from "../../domain/mission/missions";
import json from "./missions.json";
import { errored } from "../../application/interfaces/errors";
import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { FileMissionsSchema } from "./file-missions.schema";
import { Logger, loggerToken } from "../../application/interfaces/logger";

@Service(missionsSourceToken)
export class FileMissionSource implements MissionsSource {
  private missions: Missions | typeof errored;

  constructor(@Inject(loggerToken) private readonly logger: Logger) {}

  get(): Missions | typeof errored {
    return this.missions ? this.missions : (this.missions = this.read());
  }

  private read(): Missions | typeof errored {
    const schema = plainToInstance(FileMissionsSchema, json);

    const errors = validateSync(schema);
    if (errors.length) {
      this.logger.error("Unable to parse missions, validation errors.", errors);

      return errored;
    }

    return new Missions(schema.missions, schema.repeatedIndex);
  }
}
