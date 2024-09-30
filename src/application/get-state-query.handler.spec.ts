import { SlotMachineState } from "../domain/slot-machine-state";
import { errored, notFound } from "./interfaces/errors";
import { randomUUID } from "crypto";
import {
  GetStateQuery,
  GetStateQueryHandler,
  GetStateQueryResult,
} from "./get-state-query.handler";
import { Mutex } from "./interfaces/mutex";

describe(GetStateQueryHandler.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("handle", () => {
    test("happy path", async () => {
      fixtures.given.slotMachineStateSource.findOne.succeeds(
        SlotMachineState.fromSnapshot(fixtures.given.snapshot)
      );

      const result = await fixtures.when.executed({
        gameId: fixtures.given.snapshot.gameId,
      });

      fixtures.then.succeeded(result);
    });

    test("not found, state is missing", async () => {
      fixtures.given.slotMachineStateSource.findOne.notFound();

      const result = await fixtures.when.executed({ gameId: randomUUID() });

      fixtures.then.notFound(result);
      fixtures.then.errorLogged();
    });

    test("errored, get state failed", async () => {
      fixtures.given.slotMachineStateSource.findOne.errored();

      const result = await fixtures.when.executed({ gameId: randomUUID() });

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

  const sut = new GetStateQueryHandler(
    slotMachineStateSource,
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
      slotMachineStateSource: {
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
      },
    },
    when: {
      executed(query: GetStateQuery) {
        return sut.handle(query);
      },
    },
    then: {
      succeeded(result: GetStateQueryResult) {
        expect(result).toEqual(snapshot);
      },
      errored(result: GetStateQueryResult) {
        expect(result).toEqual(errored);
      },
      notFound(result: GetStateQueryResult) {
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
