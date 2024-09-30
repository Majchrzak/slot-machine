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
  
<img width="632" alt="image" src="https://github.com/user-attachments/assets/02e458f0-6cc5-4bd1-97c1-7528ef97b1c5">

## configuration (env variables)
- `APP_PORT`
- `REDIS_PORT`
- `REDIS_HOST`
- `REDIS_PASSWORD`
- `REDIS_LOCK_DURATION`
- `REDIS_DB_INDEX`

## skipped beacouse of limited time box
- no swagger/open-api decorators,

## client integration
1. create a new game by requresting:
`curl -X POST localhost:8080/slot-machine`, 
2. store the `gameId` from the response in client storage
3. to play aka spin send request: 
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

