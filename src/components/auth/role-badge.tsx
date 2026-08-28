export function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="rounded bg-asphalt px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-paper">
        Admin
      </span>
    );
  }
  if (role === "workshop") {
    return (
      <span className="rounded bg-blue px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-white">
        Atelier
      </span>
    );
  }
  return null;
}
