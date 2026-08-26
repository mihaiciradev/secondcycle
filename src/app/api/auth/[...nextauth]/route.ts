// Auth.js touches argon2/pg — must run on the Node runtime, never edge.
export const runtime = "nodejs";

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
