import { Signer } from "@polys/signer";
import * as v from "valibot";

import { config } from "./config";
import { withAuth } from "./middleware/auth";

const signer = new Signer({
  key: config.polymarket.apiKey,
  secret: config.polymarket.secret,
  passphrase: config.polymarket.passphrase,
});

const SignSchema = v.object({
  path: v.pipe(v.string(), v.nonEmpty()),
  method: v.union([v.literal("GET"), v.literal("POST"), v.literal("DELETE")]),
  body: v.optional(v.string()),
  timestamp: v.optional(v.number()),
});

const server = Bun.serve({
  hostname: config.server.hostname,
  port: config.server.port,

  development: {
    hmr: true,
    console: true,
    chromeDevToolsAutomaticWorkspaceFolders: false, // Change if the server returns HTML
  },

  routes: {
    "/api/health": {
      GET: () => {
        return Response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
        });
      },
    },

    "/api/sign": {
      POST: withAuth((req, _token) => {
        const validation = v.safeParse(SignSchema, req.body);
        if (!validation.success) {
          return new Response("bad request", { status: 400 });
        }

        const { method, path, body, timestamp } = validation.output;
        const payload = signer.createHeaderPayload({
          method,
          path,
          body,
          timestamp,
        });

        return Response.json(payload, { status: 200 });
      }),
    },
  },

  fetch: (_req) => {
    return new Response("not found", { status: 404 });
  },

  error: (error) => {
    console.error("Server error:", error);
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        {
          error: "internal server error",
        },
        { status: 500 },
      );
    }
    return Response.json(
      {
        error: error.message,
        stack: error.stack,
      },
      {
        status: 500,
      },
    );
  },
});

console.log(`Server running at ${server.url}`);
