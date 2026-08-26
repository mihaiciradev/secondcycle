import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const resolvePath = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": resolvePath("./src") },
  },
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Containers boot Postgres and run migrations; give hooks room.
    testTimeout: 60_000,
    hookTimeout: 180_000,
    // One Postgres container at a time keeps resource use bounded and the
    // concurrency tests deterministic.
    pool: "forks",
    fileParallelism: false,
  },
});
