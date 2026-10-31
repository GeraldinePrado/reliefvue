import path from "node:path";
import { openDatabase } from "./db.ts";
import { createPlatformServer } from "./app.ts";
import { config } from "./config.ts";

const databasePath = path.resolve(process.cwd(), config.databaseFile);
const db = openDatabase(databasePath);
const server = createPlatformServer(db);

server.on("error", (error) => {
  console.error(`[platform] could not start: ${error.message}`);
  process.exitCode = 1;
});

server.listen(config.port, config.host, () => {
  const shown = config.host === "0.0.0.0" || config.host === "::" ? "127.0.0.1" : config.host;
  console.log("");
  console.log("ReliefVue operations platform");
  console.log(`  Bind       ${config.host}:${config.port}`);
  console.log(`  API        http://${shown}:${config.port}/api/meta`);
  console.log(`  App        http://${shown}:${config.port}/app.html`);
  console.log(`  Database   ${databasePath}`);
  console.log(`  Mode       ${config.demoMode ? "demo (simulated money, fictional households)" : "live"}`);
  console.log("");
  console.log("  Staff demo sign in: admin@reliefvue.demo / reliefvue-demo");
  console.log("  Demo roles: admin, reviewer, approver (Anan or Malee)");
  console.log("  Recipient demo: phone 0810000001, code shown on screen");
  console.log("");
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}
