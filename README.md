## Summary
Automates creating and archiving a PR interview repository

## Endpoints
`GET /pr-interviews`  
List 30 most recent PR interview repos.

`POST /pr-interviews`  
body: `{ username: '<candidate github username>' }`  
Create a new PR interview. Automates creating the repo, inviting the candidate, and creating the pull request for the interview.  

`DELETE /pr-interviews/:repoName`  
Archives a PR interview repo.

`GET /health-check/public`  
`GET /health-check/private`

## Notes
- Requires a local installation of the github cli
- Requires ENV vars to interact with the Clipboard-recruiting Github org (ask @kevcx2 for existing, or create your own personal access token)
- Can run locally (instructions below) or as a docker image
- Deployed to heroku, but can deploy anywhere as a docker image

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
