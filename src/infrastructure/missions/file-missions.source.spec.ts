import { RedisSlotMachineStateMapper } from "../slot-machine-state/redis-slot-machine-state.mapper";
import { FileMissionSource } from "./file-missions.source";

describe(RedisSlotMachineStateMapper.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("get", () => {
    test("happy path", () => {
      const source = fixtures.given.source();

      expect(source.get()).toEqual({
        missions: [
          { pointsGoal: 10, rewards: [{ name: "spins", value: 10 }] },
          { pointsGoal: 20, rewards: [{ name: "coins", value: 10 }] },
          {
            pointsGoal: 100,
            rewards: [
              { name: "spins", value: 100 },
              { name: "coins", value: 100 },
            ],
          },
        ],
        repeatedIndex: 1,
      });
    });
  });
});

function getFixtures() {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  return {
    given: {
      source() {
        return new FileMissionSource(logger);
      },
    },
  };
}
