import { siteConfig } from "@/app/lib/site-config";

type OrganizationNode = {
  "@type": "Organization";
  name: string;
  url: string;
};

type WebSiteNode = {
  "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  publisher: OrganizationNode;
};

export type SiteStructuredData = {
  "@context": "https://schema.org";
  "@graph": [OrganizationNode, WebSiteNode];
};

type PersonNode = {
  "@type": "Person";
  name: string;
};

export type NewsArticleStructuredData = {
  "@context": "https://schema.org";
  "@type": "NewsArticle";
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: string;
  author: PersonNode;
  publisher: OrganizationNode;
  articleSection: string;
  inLanguage: string;
  image?: string[];
};

type BreadcrumbItem = {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
};

export type BreadcrumbStructuredData = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbItem[];
};

export type PublicStructuredData =
  | SiteStructuredData
  | NewsArticleStructuredData
  | BreadcrumbStructuredData;

export function getOrganizationNode(): OrganizationNode {
  return {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url.href,
  };
}

export function getSiteStructuredData(): SiteStructuredData {
  const organization = getOrganizationNode();

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url.href,
        description: siteConfig.description,
        inLanguage: siteConfig.locale,
        publisher: organization,
      },
    ],
  };
}

export function getBreadcrumbStructuredData(
  items: Array<{ name: string; url: URL }>,
): BreadcrumbStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.href,
    })),
  };
}

export function serializeJsonLd(data: PublicStructuredData): string {
  return JSON.stringify(data)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
