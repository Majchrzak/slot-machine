import { Mutex, mutexToken } from "../application/interfaces/mutex";
import { Inject, Service } from "typedi";
import Redlock from "redlock";
import { RedisConnectionFactory } from "./redis-connection-factory";
import { errored } from "../application/interfaces/errors";
import { Logger, loggerToken } from "../application/interfaces/logger";
import { Configuration } from "./configuration";

@Service(mutexToken)
export class RedisMutex implements Mutex {
  private duration: number;

  constructor(
    private readonly connectionFactory: RedisConnectionFactory,
    @Inject(loggerToken) private readonly logger: Logger,
    configuration: Configuration
  ) {
    this.duration = configuration.getInt("REDIS_LOCK_DURATION", 5000);
  }

  acquireLock<T>(
    key: `slot-machine-${string}`,
    fn: () => Promise<T>
  ): Promise<T | typeof errored> {
    return this.connectionFactory.execute(async (connection) => {
      const redlock = new Redlock([connection]);

      const lock = await redlock.acquire([key], this.duration);

      this.logger.info(`Lock acquired for ${key}`);

      try {
        return await fn();
      } finally {
        await lock.release();

        this.logger.info(`Log released for ${key}`);
      }
    });
  }
}
