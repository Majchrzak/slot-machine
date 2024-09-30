import { SlotMachineState } from "../domain/slot-machine-state";
import { errored, notFound } from "./interfaces/errors";
import { randomUUID } from "crypto";
import { Mutex } from "./interfaces/mutex";
import {
  SpinCommand,
  SpinCommandHandler,
  SpinCommandResult,
} from "./spin-command.handler";
import { Missions } from "../domain/mission/missions";
import { SpinGenerator } from "../domain/spin/generator/spin-generator";
import { SpinRandomGenerator } from "../domain/spin/generator/spin-random-generator";

describe(SpinCommandHandler.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("handle", () => {
    test("happy path", async () => {
      const missions = new Missions([], 0);
      const generator = new SpinRandomGenerator();
      const state = SlotMachineState.fromSnapshot(fixtures.given.snapshot);

      fixtures.given.slotMachineState.findOne.succeeds(state);
      fixtures.given.slotMachineState.save.succeeds(state);
      fixtures.given.missions.get.succeeds(missions);
      fixtures.given.spinGenerator.get.succeeds(generator);

      const result = await fixtures.when.executed({
        gameId: fixtures.given.snapshot.gameId,
      });

      fixtures.then.succeeded(result);
    });

    test("errored, get missions failed", async () => {
      fixtures.given.missions.get.errored();

      const result = await fixtures.when.executed({
        gameId: fixtures.given.snapshot.gameId,
      });

      fixtures.then.errored(result);
      fixtures.then.errorLogged();
    });

    test("not found, game state is missing", async () => {
      const missions = new Missions([], 0);
      const generator = new SpinRandomGenerator();

      fixtures.given.slotMachineState.findOne.notFound();
      fixtures.given.missions.get.succeeds(missions);
      fixtures.given.spinGenerator.get.succeeds(generator);

      const result = await fixtures.when.executed({
        gameId: fixtures.given.snapshot.gameId,
      });

      fixtures.then.notFound(result);
      fixtures.then.errorLogged();
    });

    test("errored, failed to get a state", async () => {
      const missions = new Missions([], 0);
      const generator = new SpinRandomGenerator();

      fixtures.given.slotMachineState.findOne.errored();
      fixtures.given.missions.get.succeeds(missions);
      fixtures.given.spinGenerator.get.succeeds(generator);

      const result = await fixtures.when.executed({
        gameId: fixtures.given.snapshot.gameId,
      });

      fixtures.then.errored(result);
      fixtures.then.errorLogged();
    });

    test("errored, failed to save a state", async () => {
      const missions = new Missions([], 0);
      const generator = new SpinRandomGenerator();
      const state = SlotMachineState.fromSnapshot(fixtures.given.snapshot);

      fixtures.given.slotMachineState.findOne.succeeds(state);
      fixtures.given.slotMachineState.save.errored();
      fixtures.given.missions.get.succeeds(missions);
      fixtures.given.spinGenerator.get.succeeds(generator);

      const result = await fixtures.when.executed({
        gameId: fixtures.given.snapshot.gameId,
      });

      fixtures.then.errored(result);
      fixtures.then.errorLogged();
    });
  });
});

function getFixtures() {
  const logger = {
    error: jest.fn(),
    info: jest.fn(),
  };
  const slotMachineStateSource = {
    newOne: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const missionsSource = {
    get: jest.fn(),
  };
  const spinGeneratorSource = {
    get: jest.fn(),
  };

  const sut = new SpinCommandHandler(
    slotMachineStateSource,
    missionsSource,
    spinGeneratorSource,
    logger,
    new MutexFake()
  );

  const snapshot = {
    gameId: randomUUID(),
    spins: 1,
    coins: 2,
    points: 3,
    version: 4,
  };

  return {
    given: {
      snapshot,
      missions: {
        get: {
          succeeds(missions: Missions) {
            missionsSource.get.mockReturnValue(missions);
          },
          errored() {
            missionsSource.get.mockReturnValue(errored);
          },
        },
      },
      spinGenerator: {
        get: {
          succeeds(generator: SpinGenerator) {
            spinGeneratorSource.get.mockReturnValue(generator);
          },
        },
      },
      slotMachineState: {
        findOne: {
          succeeds(state: SlotMachineState) {
            slotMachineStateSource.findOne.mockResolvedValue(state);
          },
          errored() {
            slotMachineStateSource.findOne.mockResolvedValue(errored);
          },
          notFound() {
            slotMachineStateSource.findOne.mockResolvedValue(notFound);
          },
        },
        save: {
          succeeds(state: SlotMachineState) {
            slotMachineStateSource.save.mockResolvedValue(state);
          },
          errored() {
            slotMachineStateSource.save.mockResolvedValue(errored);
          },
          notFound() {
            slotMachineStateSource.save.mockResolvedValue(notFound);
          },
        },
      },
    },
    when: {
      executed(command: SpinCommand) {
        return sut.handle(command);
      },
    },
    then: {
      succeeded(result: SpinCommandResult) {
        expect(result).toEqual({
          ...snapshot,
          spins: expect.any(Number),
          coins: expect.any(Number),
          points: expect.any(Number),
        });
      },
      errored(result: SpinCommandResult) {
        expect(result).toEqual(errored);
      },
      notFound(result: SpinCommandResult) {
        expect(result).toEqual(notFound);
      },
      errorLogged() {
        expect(logger.error).toBeCalled();
      },
    },
  };
}

class MutexFake implements Mutex {
  acquireLock<T>(
    key: `slot-machine-${string}`,
    fn: () => Promise<T>
  ): Promise<T | typeof errored> {
    return fn();
  }
}
