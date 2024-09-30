import { randomUUID } from "crypto";
import { SlotMachineState } from "./slot-machine-state";
import { Spin } from "./spin/spin";
import { SlotMachine } from "./slot-machine";
import { SpinGenerator } from "./spin/generator/spin-generator";
import { Missions } from "./mission/missions";

describe(SlotMachine.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  test("happy path", () => {
    const machine = fixtures.given.slotMachine(100);

    // 1 spin
    fixtures.when.spined(machine, new Spin([2, 2, 2]));
    fixtures.then.state(machine, { spins: 99, coins: 0, points: 6 });

    // 2 spin
    fixtures.when.spined(machine, new Spin([1, 2, 1]));
    fixtures.then.state(machine, { spins: 98, coins: 0, points: 6 });

    // 3 spin
    fixtures.when.spined(machine, new Spin([2, 2, 2]));
    fixtures.then.state(machine, { spins: 107, coins: 0, points: 12 });

    // 4 spin
    fixtures.when.spined(machine, new Spin([9, 9, 9]));
    fixtures.then.state(machine, { spins: 106, coins: 10, points: 39 });

    // 5 spin
    fixtures.when.spined(machine, new Spin([9, 9, 9]));
    fixtures.then.state(machine, { spins: 105, coins: 10, points: 66 });

    // 6 spin
    fixtures.when.spined(machine, new Spin([9, 9, 9]));
    fixtures.then.state(machine, { spins: 104, coins: 10, points: 93 });

    // 7 spin
    fixtures.when.spined(machine, new Spin([9, 9, 9]));
    fixtures.then.state(machine, { spins: 103, coins: 10, points: 120 });

    // 8 spin
    fixtures.when.spined(machine, new Spin([7, 7, 7]));
    fixtures.then.state(machine, { spins: 212, coins: 110, points: 141 });
  });

  test("game over", () => {
    const machine = fixtures.given.slotMachine(3);

    // 1 spin
    fixtures.when.spined(machine, new Spin([1, 1, 2]));
    fixtures.then.state(machine, { spins: 2, coins: 0, points: 0 });

    // 2 spin
    fixtures.when.spined(machine, new Spin([1, 2, 2]));
    fixtures.then.state(machine, { spins: 1, coins: 0, points: 0 });

    // 3 spin
    fixtures.when.spined(machine, new Spin([2, 1, 1]));
    fixtures.then.isGameOver(machine);

    expect(fixtures.when.spined(machine, new Spin([7, 7, 7]))).toEqual(false);
  });
});

function getFixtures() {
  const missions = new Missions(
    [
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
    1
  );

  return {
    given: {
      slotMachine(spins: number) {
        return new SlotMachine(SlotMachineState.newOne(randomUUID(), spins));
      },
    },
    when: {
      spined(slotMachine: SlotMachine, spin: Spin) {
        return slotMachine.trySpin(new SpinGeneratorFake(spin), missions);
      },
    },
    then: {
      state(
        machine: SlotMachine,
        expected: { spins: number; coins: number; points: number }
      ) {
        expect(machine.toSnapshot()).toEqual({
          isGameOver: false,
          state: {
            gameId: expect.any(String),
            version: 1,
            ...expected,
          },
        });
      },
      isGameOver(machine: SlotMachine) {
        expect(machine.toSnapshot()).toEqual({
          isGameOver: true,
          state: {
            gameId: expect.any(String),
            version: 1,
            spins: 0,
            coins: expect.any(Number),
            points: expect.any(Number),
          },
        });
      },
    },
  };
}

class SpinGeneratorFake implements SpinGenerator {
  constructor(private readonly spin: Spin) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for(state: SlotMachineState): Spin {
    return this.spin;
  }
}
