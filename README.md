# catts-evm-rpc-proxy

Runs a Cloudflare Worker that proxies and deduplicates EVM RPC requests to the [Alchemy](https://www.alchemy.com) API. The worker is deployed to Cloudflare's [edge infrastructure](https://www.cloudflare.com/network/).

The intended use case is to reduce the number of requests to the Alchemy API by deduplicating identical requests. This is useful when multiple clients are querying the same data, such as when making requests through the EVM RPC Canister on the Internet Computer.

The worker will cache the response from Alchemy and return the cached response to all subsequent requests with the same parameters.

## Install on Cloudflare

### 1. Pre-requisites

Set up a Cloudflare account and install the Wrangler CLI. Wrangler is used to develop, deploy, and configure your Worker via CLI.

Further documentation for Wrangler can be found [here](https://developers.cloudflare.com/workers/tooling/wrangler).

The worker is configured using the following environment variables:

- `ALCHEMY_API_KEY`: The API key to use when making requests to Alchemy.

### 2. Configure

Give the worker a name by editing `wrangler.toml`:

```toml
name = "..."
```

Configure Alchemy API key:

```bash
npx wrangler secret put ALCHEMY_API_KEY
```

### 3. Deploy

Deploy the worker to Cloudflare using:

```bash
pnpm i
pnpm run deploy
```

### 4. Usage

In your IC project, to configure the EVM RPC Canister to use the proxy instead of the default services, see the following example:

```rust
let base_url = "https://<proxy-url-on-cludflare>.workers.dev";

// For ETH Sepolia
let rpc_services = RpcServices::Custom {
  chainId: 11155111,
  services: vec![RpcApi {
    url: format!("{}/{}", base_url, "eth-sepolia"),
    headers: None,
  }],
},
```

## Run locally

### 1. Configure

- Create a `.dev.vars` file in the root of the project.
- Add the following content to the file:

```bash
ALCHEMY_API_KEY=<API_KEY>
```

### 2. Run

```bash
pnpm i
pnpm run dev
```

## Author

- [kristofer@kristoferlund.se](mailto:kristofer@kristoferlund.se)
- Twitter: [@kristoferlund](https://twitter.com/kristoferlund)
- Discord: kristoferkristofer
- Telegram: [@kristoferkristofer](https://t.me/kristoferkristofer)

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions or improvements.
