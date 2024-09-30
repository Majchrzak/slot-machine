import { Service } from "typedi";
import envVar from "env-var";
import assert from "assert";

export type StringEnvVars = "REDIS_HOST" | "REDIS_PASSWORD";
export type IntEnvVars =
  | "REDIS_PORT"
  | "REDIS_LOCK_DURATION"
  | "REDIS_DB_INDEX";

@Service()
export class Configuration {
  getString(key: StringEnvVars): string {
    const value = envVar.get(key).asString();

    assert(value != undefined, `missing env variable: ${key}`);

    return value;
  }

  getInt(key: IntEnvVars, fallback: number): number {
    const value = envVar.get(key).default(fallback).asInt();

    assert(value != undefined, `missing env variable: ${key}`);

    return value;
  }
}
