# MarketMate web

Next.js web application for MarketMate. Run commands from this repository with Node.js 22 and pnpm 10.18.2.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. Requests to `/api` are forwarded to the NestJS API at `http://127.0.0.1:4100` by default. Set `API_ORIGIN` before building to use a separately deployed API. Configure the API's `WEB_ORIGIN` to match the public web origin.

Run `pnpm check:deps` to check dependencies and `pnpm check` for TypeScript. Build with `pnpm build` and serve the production build with `pnpm start`.

Product requirements, design flows and historical milestone notes are under `docs/marketmate/`. Paths and commands in those notes refer to the original workspace.
