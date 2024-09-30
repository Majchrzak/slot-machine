import { randomUUID } from "crypto";
import { SlotMachineStateSnapshot } from "../slot-machine-state";
import { Mission } from "./mission";
import { Missions } from "./missions";

describe(Missions.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("for", () => {
    test("single mission completed", () => {
      const missions = [
        fixtures.given.mission(10),
        fixtures.given.mission(20),
        fixtures.given.mission(100),
      ];

      const fromState = fixtures.given.slotMachineStateSnapshot(80);
      const toState = fixtures.given.slotMachineStateSnapshot(130);

      const sut = fixtures.given.missions(missions, 1);

      const result = sut.forTransition(fromState, toState);

      expect(Array.from(result)).toEqual([missions[2]]);
    });

    test("multiple missions completed", () => {
      const missions = [
        fixtures.given.mission(10),
        fixtures.given.mission(20),
        fixtures.given.mission(100),
      ];
      const fromState = fixtures.given.slotMachineStateSnapshot(0);
      const toState = fixtures.given.slotMachineStateSnapshot(170);

      const sut = fixtures.given.missions(missions, 1);

      const result = sut.forTransition(fromState, toState);

      expect(Array.from(result)).toEqual([
        missions[0],
        missions[1],
        missions[2],
        missions[0],
        missions[1],
      ]);
    });

    test("no mission completed", () => {
      const missions = [
        fixtures.given.mission(10),
        fixtures.given.mission(20),
        fixtures.given.mission(100),
      ];
      const fromState = fixtures.given.slotMachineStateSnapshot(0);
      const toState = fixtures.given.slotMachineStateSnapshot(5);

      const sut = fixtures.given.missions(missions, 1);

      const result = sut.forTransition(fromState, toState);

      expect(Array.from(result)).toEqual([]);
    });
  });
});

function getFixtures() {
  return {
    given: {
      mission(points: number) {
        return new Mission(points, []);
      },
      slotMachineStateSnapshot(points: number): SlotMachineStateSnapshot {
        return {
          gameId: randomUUID(),
          points,
          coins: 0,
          spins: 0,
          version: 1,
        };
      },
      missions(missions: Mission[], repeatedIndex: number) {
        return new Missions(missions, repeatedIndex);
      },
    },
  };
}
