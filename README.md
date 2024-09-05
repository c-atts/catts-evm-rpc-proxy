# catts-evm-rpc-proxy

Runs a Cloudflare Worker that proxies requests to the [Alchemy](https://www.alchemy.com) API. The worker is deployed to Cloudflare's [edge infrastructure](https://www.cloudflare.com/network/).

## Pre-requisites

The worker is configured using the following environment variables:

- `ALCHEMY_API_KEY`: The API key to use when making requests to The Graph API.

## Development

### 1. Configure

- Create a `.dev.vars` file in the root of the project.
- Add the following content to the file:

```bash
ALCHEMY_API_KEY=<API_KEY>
```

### 2. Run

```bash
npm i
npm run dev
```

## Production

### 1. Configure

Set the environment variable using:

```bash
npx wrangler secret put ALCHEMY_API_KEY
```

### 2. Deploy

```bash
npm run deploy
```

## Wrangler

Wrangler is used to develop, deploy, and configure your Worker via CLI.

Further documentation for Wrangler can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler).
