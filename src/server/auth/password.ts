import { hash, verify } from "@node-rs/argon2";

/**
 * Password hashing with argon2id (the @node-rs/argon2 default algorithm).
 * Parameters follow current OWASP guidance for argon2id.
 */
const OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}
