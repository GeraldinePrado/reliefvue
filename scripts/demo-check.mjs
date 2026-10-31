/**
 * Pre-demo smoke check. Fails loudly if the app or API is not reachable.
 * Usage: npm run demo:check  (or RV_PORT=8789 npm run demo:check)
 */
const port = process.env.RV_PORT ?? process.env.PORT ?? "5173";
const base = (process.env.RV_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, "");

async function get(path) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  return response;
}

const failures = [];
const pass = (message) => console.log(`ok   ${message}`);
const fail = (message) => {
  failures.push(message);
  console.log(`FAIL ${message}`);
};

try {
  const health = await get("/papi/health");
  if (!health.ok) fail(`/papi/health returned ${health.status}`);
  else {
    const body = await health.json();
    if (body.ok !== true) fail("/papi/health did not report ok");
    else pass(`API healthy (${body.mode ?? "unknown"} mode)`);
  }
} catch (error) {
  fail(`API unreachable at ${base}: ${error.message}`);
}

try {
  const app = await get("/app.html");
  const html = await app.text();
  if (!app.ok) fail(`/app.html returned ${app.status}`);
  else if (!html.includes('id="root"')) fail("/app.html did not contain the app root");
  else pass("platform app served");
} catch (error) {
  fail(`app unreachable: ${error.message}`);
}

try {
  const meta = await get("/papi/meta");
  if (!meta.ok) fail(`/papi/meta returned ${meta.status}`);
  else {
    const body = await meta.json();
    if (!body.organisation?.name) fail("/papi/meta has no organisation");
    else pass(`same-origin API works (${body.organisation.name})`);
  }
} catch (error) {
  fail(`same-origin API unreachable: ${error.message}`);
}

console.log("");
if (failures.length) {
  console.error(`${failures.length} check(s) failed. Start the demo with: npm run demo`);
  process.exitCode = 1;
} else {
  console.log(`Ready. Open ${base}/app.html`);
}
