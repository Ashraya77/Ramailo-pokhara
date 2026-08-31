import {
  serializeJsonLd,
  type PublicStructuredData,
} from "@/app/lib/structured-data";

export function JsonLd({ data }: { data: PublicStructuredData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
