## tech stack
- used routing-controllers to wrap rest api,
- used redis for persistance,
- used redis for distributed locks,
- used some DDD patterns in domain (skipped event sourcing etc.)
- used hexagonal architecture + cqrs
- used class-validator to validate requests and json objects,
- used jest for unit and e2e tests,
- used typedi as dependency container,
- used docker compose to orchestrate dependencies,
- decided to not use any higher level framework (for instance nestjs)

## how to run on local environment
- `npm i` to install dependencies
- `docker-compose up -d` to spawn redis on local machine
- `npm start` to start application
- `npm run test` to execute unit tests
- `npm run test:e2e` to execute e2e tests

## configuration (env variables)
- `APP_PORT`
- `REDIS_PORT`
- `REDIS_HOST`
- `REDIS_PASSWORD`
- `REDIS_LOCK_DURATION`

## skipped beacouse of limited time box
- no swagger/open-api decorators,

## curl snippets
*create a new game*
`curl -X POST localhost:8080/slot-machine`

*spin...*
`curl -X POST localhost:8080/slot-machine/spin -H "Content-Type: application/json" -d '{"gameId": "GAME_ID"}'`

*load game state*
`curl -X GET "localhost:8080/slot-machine?gameId=GAME_ID"`
