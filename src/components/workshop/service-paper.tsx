"use client";

import { useState } from "react";
import { SERVICE_CHECK_STATUS_LABEL } from "@/server/constants/app";
import { ServiceRecordForm } from "./service-record-form";

type PaperRecord = {
  id: string;
  performedBy: string;
  performedAt: string | Date;
  summary: string | null;
  checklist: { item: string; status: string; note?: string }[];
};

function RecordView({ record }: { record: PaperRecord }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-3 font-mono text-xs text-steel">
        <span>Mecanic: {record.performedBy}</span>
        <span>{new Date(record.performedAt).toLocaleDateString("ro-RO")}</span>
      </div>
      <ul className="mt-4 space-y-2">
        {record.checklist.map((c) => (
          <li key={c.item} className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-foreground/80">{c.item}</span>
            <span className="text-right">
              <span className="font-medium">{SERVICE_CHECK_STATUS_LABEL[c.status] ?? c.status}</span>
              {c.note ? <span className="text-steel"> · {c.note}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {record.summary ? (
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/80">
          {record.summary}
        </p>
      ) : null}
    </div>
  );
}

export function ServicePaper({
  bikeId,
  kind,
  record,
  canFill,
}: {
  bikeId: string;
  kind: "intake" | "final";
  record: PaperRecord | null;
  canFill: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!record) {
    if (!canFill) {
      return (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-steel">
          Completează întâi constatarea, apoi poți adăuga fișa finală.
        </p>
      );
    }
    return <ServiceRecordForm bikeId={bikeId} kind={kind} />;
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <ServiceRecordForm
          bikeId={bikeId}
          kind={kind}
          recordId={record.id}
          initial={record}
          onDone={() => setEditing(false)}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="cursor-pointer text-sm text-steel hover:text-foreground"
        >
          Renunță
        </button>
      </div>
    );
  }

  return (
    <div>
      <RecordView record={record} />
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-3 inline-flex h-9 cursor-pointer items-center rounded-full border border-asphalt/20 px-4 text-sm font-medium transition-colors hover:bg-asphalt/5"
      >
        Modifică
      </button>
    </div>
  );
}
