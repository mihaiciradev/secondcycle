/** A small deny-list of the most common weak passwords (no composition rules —
 *  length ≥ 10 plus this list, per the brief). Compared case-insensitively. */
const COMMON = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "passw0rd12",
  "1234567890",
  "12345678910",
  "0123456789",
  "qwertyuiop",
  "qwerty1234",
  "1q2w3e4r5t",
  "iloveyou12",
  "letmein123",
  "welcome123",
  "admin12345",
  "adminadmin",
  "secondcycle",
  "changeme12",
  "trustno123",
  "footballll",
]);

export function isCommonPassword(password: string): boolean {
  return COMMON.has(password.toLowerCase());
}
