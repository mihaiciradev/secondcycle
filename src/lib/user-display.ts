export function displayName(user: { name?: string | null; email?: string | null }): string {
  if (user.name && user.name.trim()) return user.name.trim().split(/\s+/)[0];
  const local = (user.email ?? "").split("@")[0];
  if (!local) return "Cont";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function accountHref(role?: string): string {
  if (role === "admin") return "/admin/bikes";
  if (role === "workshop") return "/workshop";
  return "/account";
}
