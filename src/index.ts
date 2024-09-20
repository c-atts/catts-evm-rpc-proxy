import { DurableObject } from "cloudflare:workers";

export interface Env {
  RPC_PROXY: DurableObjectNamespace<RpcProxy>;
  ALCHEMY_API_KEY: string;
}

type JsonRpcRequest = {
  jsonrpc: "2.0";
  method: string;
  params: any;
  id: number;
};

const enum RpcProxyState {
  NotStarted,
  InProgress,
  Done,
}

// RpcProxy is a Durable Object that proxies JSON-RPC requests to Alchemy.
// Read more about Durable Objects here: https://developers.cloudflare.com/durable-objects/
export class RpcProxy extends DurableObject {
  alchemyApiKey: string;
  state: RpcProxyState = RpcProxyState.NotStarted;
  responseText?: string;
  responseStatus?: number;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.alchemyApiKey = env.ALCHEMY_API_KEY;
  }

  async proxyRpcRequest(
    request: JsonRpcRequest,
    chain: string
  ): Promise<Response> {
    if (this.state === RpcProxyState.NotStarted) {
      this.state = RpcProxyState.InProgress;
      const url = `https://${chain}.g.alchemy.com/v2/${this.alchemyApiKey}`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });
        this.responseText = await response.text();
        this.responseStatus = response.status;
      } catch (e) {
        console.error(e);
        this.responseText = "Couldn't fetch data";
        this.responseStatus = 500;
      }
      this.state = RpcProxyState.Done;
    }

    if (this.state === RpcProxyState.InProgress) {
      while (this.state === RpcProxyState.InProgress) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return new Response(this.responseText, { status: this.responseStatus });
  }
}

// The fetch event handler for the worker initiates the RPC request to the Durable Object.
// The Durable Object is fetched by its name, which is derived from the request ID.
// One instance of the Durable Object is created for each request ID.
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    switch (request.method) {
      case "OPTIONS":
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          },
        });
      case "GET":
        return new Response("Method not allowed", { status: 405 });
      case "POST":
        let jsonRpcRequest: JsonRpcRequest;
        jsonRpcRequest = await request.json();
        if (jsonRpcRequest.jsonrpc !== "2.0" || !jsonRpcRequest.method) {
          return new Response("Invalid JSON-RPC request", { status: 400 });
        }
        const path = new URL(request.url).pathname;
        const chain = path.slice(1);
        if (!chain || typeof chain !== "string") {
          return new Response(
            "Invalid chain. Call this endpoint with a url in this format: https:://<worker-url>/<chain>",
            { status: 400 }
          );
        }
        let id: DurableObjectId = env.RPC_PROXY.idFromName(
          jsonRpcRequest.id.toString()
        );
        let stub = env.RPC_PROXY.get(id);
        return stub.proxyRpcRequest(jsonRpcRequest, chain);
    }
    return new Response("Bad request", { status: 400 });
  },
};
