// warmup.js — pre-compiles all routes so users never hit cold-start delays
const http = require("http");

const DELAY   = 8000;  // ms to wait for next dev to be ready
const TIMEOUT = 60000; // max ms per route
const BASE    = "http://localhost:3000";

const ROUTES = [
  "/",                   // home / marketing
  "/auth/login",         // login page (most critical)
  "/pricing",            // public pricing
  "/api/auth/providers", // NextAuth init
  "/api/auth/csrf",      // NextAuth csrf
  "/api/auth/session",   // NextAuth session
  "/sys-warmup",         // triggers full dashboard bundle compile
];

function get(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(BASE + path, { timeout: TIMEOUT }, (res) => {
      res.resume();
      res.on("end", () => {
        console.log(`[warmup] ${res.statusCode} ${path} (${Date.now() - start}ms)`);
        resolve();
      });
    });
    req.on("error", (e) => {
      console.log(`[warmup] ERR ${path}: ${e.message}`);
      resolve();
    });
    req.on("timeout", () => {
      console.log(`[warmup] TIMEOUT ${path}`);
      req.destroy();
      resolve();
    });
  });
}

async function main() {
  console.log(`[warmup] waiting ${DELAY}ms for server...`);
  await new Promise((r) => setTimeout(r, DELAY));
  console.log("[warmup] pre-compiling routes...");
  for (const route of ROUTES) {
    await get(route);
  }
  console.log("[warmup] all routes compiled and ready.");
}

main();
