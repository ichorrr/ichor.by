# AGENTS.md

## Project overview

This repository is a full-stack app with two main parts:

- [api](api): Express + Apollo Server + Mongoose backend.
- [web](web): React frontend built with Parcel and Apollo Client.

Keep changes scoped to the correct side of the stack. UI work should stay in [web/src](web/src), while server and GraphQL changes should stay in [api](api).

## Working conventions

- Prefer small, focused changes that match the existing structure.
- This codebase is JavaScript, not TypeScript. Follow the existing ES module style in the backend and the current React pattern in the frontend.
- Preserve the current split between pages/components, GraphQL operations, and API helpers.
- When changing shared behavior, check both the frontend and backend usage before editing.

## Backend notes

- Main server entry point: [api/index.js](api/index.js)
- Database connection setup: [api/db.js](api/db.js)
- GraphQL schema and types: [api/schema](api/schema)
- Mongoose models: [api/models](api/models)
- The backend uses Apollo Server, Express, Mongoose, JWT-based auth, and file uploads.

Useful commands:

- From [api](api): `npm run dev` to start the API with nodemon.
- From [api](api): `npm start` to run the server directly.

## Frontend notes

- Main React app entry: [web/src/App.js](web/src/App.js)
- Pages live in [web/src/pages](web/src/pages)
- Reusable UI lives in [web/src/components](web/src/components)
- GraphQL queries and mutations live in [web/src/gql](web/src/gql)
- Shared API helpers live in [web/src/utils/api.js](web/src/utils/api.js)

Useful commands:

- From [web](web): `npm run dev` to start the Parcel dev server.
- From [web](web): `npm run build` to create a production build.

## Environment and runtime expectations

- The API expects environment configuration in [api](api) (for example, a local `.env` file).
- The frontend resolves its API URL through [web/src/utils/api.js](web/src/utils/api.js), which supports `API_URI` or a local fallback.
- Local development usually expects the API to be available on port `4000` and the frontend to be served by Parcel.

## Practical guidance for agents

- If a change affects routing, posting, chat, auth, comments, or uploads, inspect the relevant page/component plus the matching backend resolver or schema.
- Keep GraphQL changes backward-compatible when possible.
- Avoid introducing new dependency patterns or build tooling unless the existing setup clearly supports them.
- If you are unsure where a feature belongs, prefer the existing folder that already handles similar functionality.
