import express from "express";
import morgan from "morgan";
import { createExpressServer, useContainer } from "routing-controllers";

import { Container } from "typedi";
import { SlotMachineController } from "./api/slot-machine.controller";
import { SlotMachineStateSource } from "./application/interfaces/slot-machine-state.source";
import { RedisSlotMachineStateSource } from "./infrastructure/slot-machine-state/redis-slot-machine-state.source";
import { MissionsSource } from "./application/interfaces/missions.source";
import { FileMissionSource } from "./infrastructure/missions/file-missions.source";
import { Logger } from "./application/interfaces/logger";
import { ConsoleLogger } from "./infrastructure/console-logger";
import { Mutex } from "./application/interfaces/mutex";
import { RedisMutex } from "./infrastructure/redis-mutex";

useContainer(Container);

Container.set(SlotMachineStateSource, RedisSlotMachineStateSource);
Container.set(MissionsSource, FileMissionSource);
Container.set(Logger, ConsoleLogger);
Container.set(Mutex, RedisMutex);

export const app: express.Application = createExpressServer({
  controllers: [SlotMachineController],
  validation: true,
  cors: true,
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
