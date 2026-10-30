import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json; charset=utf-8",
};

const IMMUTABLE = /^\/assets\//;

export function distRoot(): string {
  return path.resolve(process.cwd(), process.env.RV_DIST ?? "dist");
}

/**
 * Serve a built file from `dist/` when the platform server is the only process.
 * Returns false when the path is not a file, so the caller can fall through to
 * the API 404.
 */
export async function serveStaticFile(
  req: IncomingMessage,
  res: ServerResponse,
  urlPath: string,
): Promise<boolean> {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return false;
  }
  if (decoded.split("/").some((segment) => segment === ".." || segment.startsWith("."))) {
    return false;
  }

  const root = distRoot();
  const candidates = decoded.endsWith("/")
    ? [path.join(decoded, "index.html")]
    : [decoded, `${decoded}.html`, path.join(decoded, "index.html")];

  for (const candidate of candidates) {
    const resolved = path.resolve(root, `.${candidate}`);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) continue;

    let info;
    try {
      info = await stat(resolved);
    } catch {
      continue;
    }
    if (!info.isFile()) continue;

    const type = MIME[path.extname(resolved).toLowerCase()] ?? "application/octet-stream";
    res.setHeader("content-type", type);
    res.setHeader(
      "cache-control",
      IMMUTABLE.test(candidate) ? "public, max-age=31536000, immutable" : "no-cache",
    );
    res.setHeader("content-length", String(info.size));

    if ((req.method ?? "GET").toUpperCase() === "HEAD") {
      res.statusCode = 200;
      res.end();
      return true;
    }

    res.statusCode = 200;
    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream(resolved);
      stream.on("error", reject);
      stream.on("end", resolve);
      stream.pipe(res);
    });
    return true;
  }

  return false;
}
