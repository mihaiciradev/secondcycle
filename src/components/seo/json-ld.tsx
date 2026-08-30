/**
 * Injects a JSON-LD structured-data block. Server component: the JSON is
 * serialized at render time. Keep the object schema.org-valid.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Data is app-controlled (no user HTML); stringify is safe here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
