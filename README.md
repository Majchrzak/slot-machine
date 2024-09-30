## tech stack
- used routing-controllers to wrap rest api,
- used redis for persistance,
- used redis for distributed locks,
- used some DDD patterns in domain (skipped event sourcing etc.)
- used hexagonal architecture + cqrs
- used class-validator to validate requests and json objects,
- used jest for unit and integration tests,
- used typedi as dependency container,
- used docker compose to orchestrate dependencies,
- decided to not use any higher level framework (for instance nestjs)

## how to run on local environment
- `npm i` to install dependencies
- `docker-compose up -d` to spawn redis on local machine
- `npm start` to start application
- `npm run test` to execute unit tests
- `npm run test:int` to execute integration tests

## unit tests
<img width="605" alt="image" src="https://github.com/user-attachments/assets/8033ca38-614b-4eb3-806a-3e4560886750">

## integration tests
<img width="466" alt="image" src="https://github.com/user-attachments/assets/fdb99523-4213-45b9-b768-6ee90ffd3847">

## configuration (env variables)
- `APP_PORT`
- `REDIS_PORT`
- `REDIS_HOST`
- `REDIS_PASSWORD`
- `REDIS_LOCK_DURATION`
- `REDIS_DB_INDEX`

## skipped because of limited time box
- no swagger/open-api decorators,

## rest api definition

```ts
type GameState = {
  gameId: string;
  state: {
    spins: number;
    coins: number;
    points: number;
  };
};
```

- `GET localhost:8080/slot-machine`:
  - 200 - OK, `GameState`
  - 500 - Server Error,
  - 404 - Not Found
  - 400 - Bad Request
- `POST localhost:8080/slot-machine`
  - 200 - OK, `GameState`
  - 500 - Server Error,
  - 404 - Not Found
  - 400 - Bad Request
- `POST localhost:8080/slot-machine/spin`
  - 200 - OK, `GameState`
  - 500 - Server Error,
  - 405 - Not Allowed,
  - 404 - Not Found
  - 400 - Bad Request

## client integration
1. create a new game by requesting:
`curl -X POST localhost:8080/slot-machine`, you will get a game state:
1. store the `gameId` from the response in client storage
2. to play aka spin send request: 
`curl -X POST localhost:8080/slot-machine/spin -H "Content-Type: application/json" -d '{"gameId": "GAME_ID"}'`

to render spin result you can compare your current game state (returned by GET or POST `spin-machine/` methods) with the new state (returned by POST `spin-machine/spin` method):
```ts
type State = { spins: number, coins: number, points: number };

function getStateTransition(from: State, to: State): State {
  return {
    spins: to.spins - from.spins + 1, // spins accumulated in current spin
    coins: to.coins - from.coins, // coins accumulated in current spin
    points: to.points - from.points // points accumulated in current spin
  }
}
```


4. To reload or continue previous game use `curl -X GET "localhost:8080/slot-machine?gameId=GAME_ID"`

