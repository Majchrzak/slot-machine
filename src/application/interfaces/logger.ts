import { Token } from "typedi";

export const loggerToken = new Token("logger");

export abstract class Logger {
  abstract info(message: string): void;
  abstract error(message: string, context?: unknown): void;
}
