/**
 * Reset the local demo database to its clean fictional seed.
 * Run before a demo; never run against a database holding real data.
 */
import path from "node:path";
import { openDatabase, resetDatabase } from "../server/platform/db.ts";

const databasePath = path.resolve(process.cwd(), process.env.RV_DB ?? "data/platform.db");
const db = openDatabase(databasePath);
resetDatabase(db);
db.close();
console.log(`Demo data reset: ${databasePath}`);
