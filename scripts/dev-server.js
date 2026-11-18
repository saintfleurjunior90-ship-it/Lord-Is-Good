#!/usr/bin/env node
/**
 * Petit serveur local SANS dépendance, pour l'étape 1 (site uniquement).
 *   node scripts/dev-server.js   →   http://localhost:3000
 * Il sert le dossier /public (le site marche aussi en double-cliquant sur public/index.html).
 * Il sera remplacé par le serveur Express (API + paiements) à l'étape suivante.
 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3000;
const ALIASES = {};
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png", ".ico": "image/x-icon", ".svg": "image/svg+xml",
  ".json": "application/json", ".txt": "text/plain; charset=utf-8",
};

http.createServer((req, res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { res.writeHead(400).end(); return; }
  if (url === "/") url = "/index.html";
  let file = ALIASES[url] || path.join(PUBLIC, path.normalize(url));
  if (!ALIASES[url] && !file.startsWith(PUBLIC + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }).end("404"); return; }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}).listen(PORT, () => console.log(`KOKIYOL → http://localhost:${PORT}`));
