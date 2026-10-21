import { serializeJsonLd } from "@/lib/structuredData";

/**
 * Renders structured data for search engines. A plain <script> (not
 * next/script): this is data, not code that runs, so it shouldn't be loaded
 * or deferred like JavaScript.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
