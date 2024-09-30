import { Token } from "typedi";
import { errored } from "./errors";

export const mutexToken = new Token("mutex");

export abstract class Mutex {
  abstract acquireLock<T>(
    key: `slot-machine-${string}`,
    fn: () => Promise<T>
  ): Promise<T | typeof errored>;
}
