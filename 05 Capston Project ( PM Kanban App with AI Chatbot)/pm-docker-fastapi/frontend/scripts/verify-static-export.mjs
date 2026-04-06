import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "out");

const required = ["index.html", "login.html"];
for (const name of required) {
  const path = join(root, name);
  if (!existsSync(path)) {
    console.error(`Missing static export file: ${path}`);
    process.exit(1);
  }
}
console.log("Static export OK:", required.join(", "));
