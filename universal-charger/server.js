"use strict";

// Run with: node server.js (Node 18 or newer). No npm packages or API key.
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const ROOT = __dirname;
const MODEL = "gemma3:1b";
const PORT = 8000;
const OLLAMA = "http://127.0.0.1:11434";

// This is the voice of the object, not another source of research facts.
const PROMPT = "You are an old universal charger speaking in the first person. " +
  "Reply in simple English, in two short sentences, at most 55 words. " +
  "Reflect on the supplied fact and ask one small question about care, repair or unplugging. " +
  "Use only the supplied evidence. Do not invent numbers, identify unknown materials, " +
  "give electrical instructions, or claim the cited study measured this object.";

function json(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(data));
}

async function ollama(base, route, body, timeout = 120000) {
  const response = await fetch(base + route, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout)
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    const error = new Error(data.error || "Ollama returned an error.");
    error.upstreamStatus = response.status;
    throw error;
  }
  return data;
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 4096) {
      const error = new Error("Request too large.");
      error.status = 413;
      throw error;
    }
  }
  try {
    return JSON.parse(body);
  } catch (cause) {
    const error = new Error("Send a JSON object containing a part id.");
    error.status = 400;
    throw error;
  }
}

function modelError(error) {
  if (error.status) return { status: error.status, error: error.message };
  if (error.name === "TimeoutError") return { status: 504, error: "Ollama took too long. The model may still be loading; try again." };
  if (error.upstreamStatus === 404) return { status: 503, error: "Model missing. Run: ollama pull " + MODEL };
  if (error.cause?.code === "ECONNREFUSED") return { status: 503, error: "Ollama is not running. Open the Ollama app, then check the connection again." };
  return { status: 502, error: error.message || "No model reply. Check Ollama and try again." };
}

// The injectable address is only used by the API tests. Normal use stays local.
function createServer(ollamaBase = OLLAMA) {
  return http.createServer(async (request, response) => {
    const host = request.headers.host || "";
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
      return json(response, 403, { error: "Open the local project server." });
    }
    let route;
    try {
      route = decodeURIComponent(new URL(request.url, "http://" + host).pathname);
    } catch (error) {
      return json(response, 400, { error: "Invalid URL." });
    }

    if (route.startsWith("/api/")) {
      if (request.headers.origin && request.headers.origin !== "http://" + host) {
        return json(response, 403, { error: "Use the model button on the local project page." });
      }
      try {
        if (route === "/api/model-status" && request.method === "GET") {
          const data = await ollama(ollamaBase, "/api/tags", null, 5000);
          const installed = (data.models || []).some(item => item.name === MODEL || item.model === MODEL);
          return json(response, 200, {
            ready: installed, model: MODEL,
            message: installed ? "Ollama ready · " + MODEL + " · Choose a part, then ask the charger." : "Ollama is running. Download the model with: ollama pull " + MODEL
          });
        }
        if (route === "/api/ask" && request.method === "POST") {
          const body = await readBody(request);
          const facts = JSON.parse(await fs.readFile(path.join(ROOT, "data/facts.json"), "utf8"));
          if (!body || typeof body.part !== "string" || !Object.hasOwn(facts, body.part)) {
            return json(response, 400, { error: "Choose a charger part first." });
          }
          const fact = facts[body.part];
          const data = await ollama(ollamaBase, "/api/generate", {
            model: MODEL, system: PROMPT,
            prompt: "Part: " + body.part + "\nFact: " + fact.fact + "\nSource: " + fact.source + "\nLimits: " + fact.note,
            stream: false, options: { temperature: 0.4, num_predict: 140 }
          });
          if (typeof data.response !== "string" || !data.response.trim()) {
            return json(response, 502, { error: "Ollama returned an empty answer. Try again." });
          }
          return json(response, 200, { response: data.response.trim(), model: data.model || MODEL });
        }
        return json(response, 404, { error: "Unknown API route or method." });
      } catch (error) {
        const problem = modelError(error);
        return json(response, problem.status, { error: problem.error });
      }
    }

    if (!["GET", "HEAD"].includes(request.method)) {
      return json(response, 405, { error: "Use GET to load the page." });
    }
    const name = route === "/" ? "charger.html" : route.slice(1);
    const file = path.resolve(ROOT, name);
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".md": "text/plain" };
    const type = types[path.extname(file)];
    if (!file.startsWith(ROOT + path.sep) || !type || name === "server.js") {
      return json(response, 404, { error: "File not found." });
    }
    try {
      const content = await fs.readFile(file);
      response.writeHead(200, { "Content-Type": type + (type.startsWith("text/") || type === "application/json" ? "; charset=utf-8" : ""), "Cache-Control": "no-cache" });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch (error) {
      json(response, 404, { error: "File not found." });
    }
  });
}

function openBrowser(url) {
  const [command, args] = process.platform === "win32"
    ? ["cmd.exe", ["/d", "/c", 'start "" "' + url + '"']]
    : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  const browser = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  browser.on("error", () => console.log("Open this address in your browser: " + url));
  browser.unref();
}

// If an old server occupies 8000, open the page on the next free local port.
function startServer({ port = PORT, open = false } = {}) {
  const server = createServer();
  let attempts = 0;
  return new Promise((resolve, reject) => {
    function ready() {
      server.removeListener("error", failed);
      const url = "http://127.0.0.1:" + server.address().port + "/charger.html";
      console.log("Universal charger: " + url);
      console.log("Keep this window and Ollama open. Press Ctrl+C to stop.");
      if (open) openBrowser(url);
      resolve({ server, url });
    }
    function failed(error) {
      server.removeListener("listening", ready);
      if (error.code !== "EADDRINUSE" || ++attempts >= 10) return reject(error);
      console.log("Port " + (port + attempts - 1) + " is in use. Trying " + (port + attempts) + ".");
      listen();
    }
    function listen() {
      server.once("error", failed);
      server.once("listening", ready);
      server.listen(port + attempts, "127.0.0.1");
    }
    listen();
  });
}

if (require.main === module) {
  if (Number(process.versions.node.split(".")[0]) < 18) {
    console.error("This helper needs Node 18 or newer.");
    process.exit(1);
  }
  startServer({ open: process.argv.includes("--open") }).catch(error => {
    console.error(error.code === "EADDRINUSE" ? "Ports 8000-8009 are in use. Stop an old server, then try again." : error.message);
    process.exitCode = 1;
  });
}

module.exports = { createServer, startServer };
