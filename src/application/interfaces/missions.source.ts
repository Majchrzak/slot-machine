import { Token } from "typedi";
import { Missions } from "../../domain/mission/missions";
import { errored } from "./errors";

export const missionsSourceToken = new Token("missions-source");

export abstract class MissionsSource {
  abstract get(): Missions | typeof errored;
}
