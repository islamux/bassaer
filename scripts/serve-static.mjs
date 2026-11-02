import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "out");
const port = Number(process.env.PORT ?? 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function isFile(p) {
  return existsSync(p) && statSync(p).isFile();
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", ...headers });
  res.end(body);
}

function resolveFile(pathname) {
  const absolute = path.join(root, pathname);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) return null;

  if (isFile(absolute)) return absolute;

  if (!path.extname(pathname) && isFile(`${absolute}.html`)) return `${absolute}.html`;

  return null;
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method Not Allowed", { Allow: "GET, HEAD" });
    return;
  }

  const url = new URL(req.url, "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    send(res, 400, "Bad Request");
    return;
  }

  const absolute = path.join(root, pathname);
  if (existsSync(absolute) && statSync(absolute).isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(301, { Location: `${pathname}/${url.search}` });
      res.end();
      return;
    }
    pathname = path.posix.join(pathname, "index.html");
  }

  const file = pathname === "/" ? path.join(root, "index.html") : resolveFile(pathname);
  if (!file) {
    const notFound = path.join(root, "404.html");
    if (isFile(notFound)) {
      res.writeHead(404, { "Content-Type": MIME[".html"] });
      if (req.method === "HEAD") res.end();
      else createReadStream(notFound).pipe(res);
    } else {
      send(res, 404, "Not Found");
    }
    return;
  }

  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  process.stdout.write(`serve-static: http://localhost:${port} (from ${root})\n`);
});
