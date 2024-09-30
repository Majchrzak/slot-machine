import { randomUUID } from "crypto";
import { SlotMachineState } from "./slot-machine-state";
import { Spin } from "./spin/spin";
import { Mission } from "./mission/mission";

describe(SlotMachineState.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test("happy path", () => {
    const state = fixtures.given.state(3);

    expect(state.tryAcquireSpin()).toEqual(true);
    expect(state.tryAcquireSpin()).toEqual(true);
    expect(state.tryAcquireSpin()).toEqual(true);
    expect(state.tryAcquireSpin()).toEqual(false);

    expect(state.toSnapshot()).toEqual({
      gameId: expect.any(String),
      spins: 0,
      coins: 0,
      points: 0,
      version: 1,
    });
  });

  test("spin completed, points accumulated", () => {
    const state = fixtures.given.state(3);

    state.spinCompleted(new Spin([3, 3, 3]));

    expect(state.toSnapshot()).toEqual({
      gameId: expect.any(String),
      spins: 3,
      coins: 0,
      points: 9,
      version: 1,
    });
  });

  test("mission completed, rewards accumulated", () => {
    const state = fixtures.given.state(3);

    state.missionCompleted(
      new Mission(1, [
        { name: "coins", value: 123 },
        { name: "spins", value: 321 },
      ])
    );

    expect(state.toSnapshot()).toEqual({
      gameId: expect.any(String),
      spins: 3 + 321,
      coins: 123,
      points: 0,
      version: 1,
    });
  });
});

function getFixtures() {
  return {
    given: {
      state(spins: number) {
        return SlotMachineState.newOne(randomUUID(), spins);
      },
    },
  };
}
