import { SpinRandomGenerator } from "./spin-random-generator";

describe(SpinRandomGenerator.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe("for", () => {
    test("happy path", () => {
      const generator = fixtures.given.generator();

      const result = generator.for();

      fixtures.then.succeeded(result);
    });
  });
});

function getFixtures() {
  return {
    given: {
      generator() {
        return new SpinRandomGenerator();
      },
    },
    then: {
      succeeded(value: ReturnType<SpinRandomGenerator["for"]>) {
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expect(values).toContain(value.slots[0]);
        expect(values).toContain(value.slots[1]);
        expect(values).toContain(value.slots[2]);
      },
    },
  };
}
