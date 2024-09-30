import { RedisSlotMachineStateMapper } from "./redis-slot-machine-state.mapper";
import { errored } from "../../application/interfaces/errors";

describe(RedisSlotMachineStateMapper.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("fromJson", () => {
    test("happy path", () => {
      const mapper = fixtures.given.mapper();

      expect(mapper.fromJson(`{"s":1,"c":2,"p":3,"v":4}`)).toEqual({
        spins: 1,
        coins: 2,
        points: 3,
        version: 4,
      });
    });

    test.each<string>([
      `{"c":2,"p":3,"v":4}`,
      `{"s":1,"p":3,"v":4}`,
      `{"s":1,"c":2,"v":4}`,
      `{"s":1,"c":2,"p":3}`,
    ])("field is missing", (json) => {
      const mapper = fixtures.given.mapper();

      expect(mapper.fromJson(json)).toEqual(errored);
    });
  });

  describe("toJson", () => {
    test("happy path", () => {
      const mapper = fixtures.given.mapper();

      expect(
        mapper.toJson({
          spins: 1,
          coins: 2,
          points: 3,
          version: 4,
        })
      ).toEqual(`{"s":1,"c":2,"p":3,"v":4}`);
    });
  });
});

function getFixtures() {
  return {
    given: {
      mapper() {
        return new RedisSlotMachineStateMapper({
          info: jest.fn(),
          error: jest.fn(),
        });
      },
    },
  };
}
