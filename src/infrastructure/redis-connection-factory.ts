import { Redis } from "ioredis";
import { Configuration } from "./configuration";
import { Inject, Service } from "typedi";
import { errored } from "../application/interfaces/errors";
import { Logger, loggerToken } from "../application/interfaces/logger";

@Service()
export class RedisConnectionFactory {
  constructor(
    private readonly configuration: Configuration,
    @Inject(loggerToken) private readonly logger: Logger
  ) {}

  async execute<T>(
    fn: (connection: Redis) => Promise<T>
  ): Promise<T | typeof errored> {
    const connection = this.createConnection();

    try {
      return await fn(connection);
    } catch (e) {
      this.logger.error(e);

      return errored;
    } finally {
      await connection.quit();
    }
  }

  createConnection(): Redis {
    return new Redis({
      port: this.configuration.getInt("REDIS_PORT", 6379),
      host: this.configuration.getString("REDIS_HOST"),
      password: this.configuration.getString("REDIS_PASSWORD"),
      db: this.configuration.getInt("REDIS_DB_INDEX", 0),
    });
  }
}
