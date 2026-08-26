/** Format integer bani (RON cents) as lei for display. */
export function formatLei(cents: number): string {
  const hasFraction = cents % 100 !== 0;
  return `${(cents / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })} lei`;
}
