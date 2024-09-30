import {
  CreateStateCommand,
  CreateStateCommandHandler,
  CreateStateCommandResult,
} from "./create-state-command.handler";
import { SlotMachineState } from "../domain/slot-machine-state";
import { errored } from "./interfaces/errors";
import { randomUUID } from "crypto";

describe(CreateStateCommandHandler.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("handle", () => {
    test("happy path", async () => {
      fixtures.given.slotMachineStateSource.findOne.succeeds(
        SlotMachineState.fromSnapshot(fixtures.given.snapshot)
      );

      const result = await fixtures.when.executed({});

      fixtures.then.succeeded(result);
    });

    test("errored, source failed", async () => {
      fixtures.given.slotMachineStateSource.findOne.errored();

      const result = await fixtures.when.executed({});

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

  const sut = new CreateStateCommandHandler(slotMachineStateSource, logger);

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
            slotMachineStateSource.newOne.mockResolvedValue(state);
          },
          errored() {
            slotMachineStateSource.newOne.mockResolvedValue(errored);
          },
        },
      },
    },
    when: {
      executed(command: CreateStateCommand) {
        return sut.handle(command);
      },
    },
    then: {
      succeeded(result: CreateStateCommandResult) {
        expect(result).toEqual(snapshot);
      },
      errored(result: CreateStateCommandResult) {
        expect(result).toEqual(errored);
      },
      errorLogged() {
        expect(logger.error).toBeCalled();
      },
    },
  };
}
