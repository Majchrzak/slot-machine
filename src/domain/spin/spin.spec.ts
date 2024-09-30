import { Slot, Spin } from "./spin";

describe(Spin.name, () => {
  test.each<{ slots: [Slot, Slot, Slot]; points: number }>([
    { slots: [1, 1, 1], points: 3 },
    { slots: [2, 2, 2], points: 6 },
    { slots: [3, 3, 3], points: 9 },
    { slots: [4, 4, 4], points: 12 },
    { slots: [5, 5, 5], points: 15 },
    { slots: [6, 6, 6], points: 18 },
    { slots: [7, 7, 7], points: 21 },
    { slots: [8, 8, 8], points: 24 },
    { slots: [9, 9, 9], points: 27 },
  ])("passed %s", ({ slots, points }) => {
    const spin = new Spin(slots);

    expect(spin.points()).toEqual(points);
    expect(spin.isPassed()).toEqual(true);
  });

  test.each<{ slots: [Slot, Slot, Slot]; points: number }>([
    { slots: [1, 1, 2], points: 0 },
    { slots: [1, 2, 2], points: 0 },
    { slots: [1, 2, 1], points: 0 },
    { slots: [2, 2, 1], points: 0 },
    { slots: [2, 1, 1], points: 0 },
  ])("failed %s", ({ slots, points }) => {
    const spin = new Spin(slots);

    expect(spin.points()).toEqual(points);
    expect(spin.isPassed()).toEqual(false);
  });
});
