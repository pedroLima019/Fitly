import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

const require = createRequire(import.meta.url);
const dotenv = require("dotenv");

const envCandidates = [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
];

for (const envPath of envCandidates) {
  if (!existsSync(envPath)) {
    continue;
  }

  const parsed = dotenv.parse(readFileSync(envPath)) as Record<string, string>;
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
