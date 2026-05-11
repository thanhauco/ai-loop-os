import cors from "cors";
import express from "express";
import { Readable } from "node:stream";

const app = express();
const port = Number(process.env.GATEWAY_PORT ?? 4100);
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:4000";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/gateway/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "ai-loop-os-gateway",
    upstream: apiBaseUrl
  });
});

app.get("/gateway/config", (_request, response) => {
  response.json({
    routes: [
      { prefix: "/api", upstream: apiBaseUrl },
      { prefix: "/gateway", upstream: "local" }
    ],
    policies: {
      requestBodyLimit: "1mb",
      cors: true,
      future: ["authn", "rate-limit", "model-policy", "human-approval"]
    }
  });
});

app.use("/api", async (request, response) => {
  const upstreamUrl = new URL(`/api${request.url}`, apiBaseUrl);
  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: {
        "content-type": request.header("content-type") ?? "application/json"
      },
      body: hasBody ? JSON.stringify(request.body ?? {}) : undefined
    });

    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      response.setHeader("content-type", contentType);
    }

    if (contentType?.includes("text/event-stream") && upstreamResponse.body) {
      response.status(upstreamResponse.status);
      Readable.fromWeb(upstreamResponse.body as unknown as Parameters<typeof Readable.fromWeb>[0]).pipe(response);
      return;
    }

    response.status(upstreamResponse.status).send(await upstreamResponse.text());
  } catch (error) {
    response.status(502).json({
      error: "Gateway upstream request failed.",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.listen(port, () => {
  console.log(`AI-Loop-OS gateway listening on http://localhost:${port}`);
  console.log(`Proxying /api requests to ${apiBaseUrl}`);
});
