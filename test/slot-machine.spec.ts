import request from "supertest";

import { app } from "../src/app";
import Container from "typedi";
import { RedisConnectionFactory } from "../src/infrastructure/redis-connection-factory";
import { SlotMachineStateRequest } from "../src/api/request/slot-machine-state.request";
import { SlotMachineSpinRequest } from "../src/api/request/slot-machine-spin.request";
import { randomUUID } from "crypto";
import { SlotMachineStateSnapshot } from "../src/domain/slot-machine-state";
import { SlotMachineStateResponse } from "../src/api/response/slot-machine-state.response";
import { RedisSlotMachineStateMapper } from "../src/infrastructure/slot-machine-state/redis-slot-machine-state.mapper";
import { RedisSlotMachineStateSource } from "../src/infrastructure/slot-machine-state/redis-slot-machine-state.source";

describe("slot-machine", () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(async () => {
    fixtures = getFixtures();

    await fixtures.clean();
  });

  describe("GET /slot-machine", () => {
    describe("happy path", () => {
      test("get state of already existing game", async () => {
        const snapshot = fixtures.given.game({});

        await fixtures.given.gamePersisted(snapshot);

        const request = fixtures.when.get({
          gameId: snapshot.gameId,
        });

        await fixtures.then.succeeded(
          request,
          SlotMachineStateResponse.fromSnapshot(snapshot)
        );
      });
    });

    describe("errored", () => {
      test("not found, game state is missing for given id", async () => {
        const request = fixtures.when.get({
          gameId: randomUUID(),
        });

        await fixtures.then.notFound(request);
      });

      test("bad request, game id is missing in request", async () => {
        const request = fixtures.when.get({});

        await fixtures.then.badRequest(request);
      });
    });
  });

  describe("POST /slot-machine", () => {
    describe("happy path", () => {
      test("start a new game", async () => {
        const request = fixtures.when.create();

        await fixtures.then.succeeded(request, {
          gameId: expect.any(String),
          state: {
            coins: 0,
            points: 0,
            spins: expect.any(Number),
          },
        });
      });
    });
  });

  describe("POST /slot-machine/spin", () => {
    describe("happy path", () => {
      test("make a spin", async () => {
        const gameId = randomUUID();
        fixtures.given.gamePersisted(fixtures.given.game({ gameId, spins: 3 }));

        const request = fixtures.when.spin({ gameId });
        await fixtures.then.succeeded(request, {
          gameId,
          state: {
            coins: expect.any(Number),
            points: expect.any(Number),
            spins: expect.any(Number),
          },
        });
      });
    });

    describe("errored", () => {
      test("not allowed, game already finished", async () => {
        const gameId = randomUUID();
        fixtures.given.gamePersisted(fixtures.given.game({ gameId, spins: 0 }));

        const request = fixtures.when.spin({ gameId });

        await fixtures.then.notAllowed(request);
      });

      test("bad request, game id is missing in request", async () => {
        const request = fixtures.when.spin({});

        await fixtures.then.badRequest(request);
      });
    });
  });
});

function getFixtures() {
  const dbConnectionFactory = Container.get(RedisConnectionFactory);
  const mapper = Container.get(RedisSlotMachineStateMapper);

  return {
    async clean() {
      await dbConnectionFactory.execute((connection) => connection.flushdb());
    },

    given: {
      game(
        snapshot: Partial<SlotMachineStateSnapshot>
      ): SlotMachineStateSnapshot {
        return {
          gameId: randomUUID(),
          spins: 1,
          points: 10,
          coins: 100,
          version: 1,
          ...snapshot,
        };
      },

      async gamePersisted(snapshot: SlotMachineStateSnapshot) {
        await dbConnectionFactory.execute((connection) =>
          connection.set(
            RedisSlotMachineStateSource.keyForGameId(snapshot.gameId),
            mapper.toJson(snapshot) as string
          )
        );
      },
    },

    when: {
      get(query: Partial<SlotMachineStateRequest>) {
        return request(app).get("/slot-machine").query(query);
      },
      create() {
        return request(app).post("/slot-machine");
      },
      spin(body: Partial<SlotMachineSpinRequest>) {
        return request(app).post("/slot-machine/spin").send(body);
      },
    },

    then: {
      async succeeded(
        request: request.Test,
        expected: SlotMachineStateResponse
      ) {
        await request.expect((response) => {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual(expected);
        });
      },

      async notFound(request: request.Test) {
        await request.expect((response) => {
          expect(response.status).toEqual(404);
        });
      },

      async badRequest(request: request.Test) {
        await request.expect((response) => {
          expect(response.status).toEqual(400);
        });
      },

      async notAllowed(request: request.Test) {
        await request.expect((response) => {
          expect(response.status).toEqual(405);
        });
      },
    },
  };
}
