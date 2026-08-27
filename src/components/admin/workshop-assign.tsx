"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignBikeToWorkshopAction } from "@/server/actions/admin/workshops";

export function WorkshopAssign({
  bikeId,
  current,
  workshops,
}: {
  bikeId: string;
  current: string | null;
  workshops: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <select
      defaultValue={current ?? ""}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value || null;
        start(async () => {
          const res = await assignBikeToWorkshopAction(bikeId, value);
          if (res.ok) router.refresh();
        });
      }}
      className="cursor-pointer rounded border border-border bg-white px-2 py-1 text-xs disabled:opacity-50"
    >
      <option value="">Fără atelier</option>
      {workshops.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  );
}
