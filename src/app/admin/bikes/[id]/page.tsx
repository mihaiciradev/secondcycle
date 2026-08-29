import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db/client";
import { getBikeById } from "@/server/services/bikes";
import { isStorageEnabled, publicUrl } from "@/server/storage/r2";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { SectionTitle } from "@/components/admin/dashboard-ui";
import { formatLei } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  draft: "Ciornă",
  available: "Publicată",
  reserved: "Rezervată",
  sold: "Vândută",
  withdrawn: "Retrasă",
};

export default async function AdminBikeManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bike = await getBikeById(db, id);
  if (!bike) notFound();

  const storage = isStorageEnabled();
  const initial = storage ? bike.photos.map((key) => ({ key, url: publicUrl(key) })) : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/bikes"
          className="font-mono text-xs uppercase tracking-wider text-steel hover:text-foreground"
        >
          ← Stoc
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            {bike.brand} {bike.model}
          </h2>
          <div className="flex items-center gap-3 text-sm text-steel">
            <span className="font-mono">{bike.sku}</span>
            <span>·</span>
            <span>{statusLabel[bike.status] ?? bike.status}</span>
            <span>·</span>
            <span className="font-mono">{formatLei(bike.priceCents)}</span>
          </div>
        </div>
        <Link
          href={`/bikes/${bike.sku}`}
          className="mt-2 inline-flex text-sm text-blue underline-offset-2 hover:underline"
        >
          Vezi pagina publică
        </Link>
      </div>

      <section>
        <SectionTitle hint="prima poză e coperta">Poze</SectionTitle>
        <PhotoUploader bikeId={bike.id} initial={initial} storageEnabled={storage} />
      </section>
    </div>
  );
}
