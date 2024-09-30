import { Service } from "typedi";
import { Logger, loggerToken } from "../application/interfaces/logger";

@Service(loggerToken)
export class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(`INFO: ${message}`);
  }

  error(message: string, context?: unknown): void {
    console.log(`ERROR: ${message}`, context);
  }
}
