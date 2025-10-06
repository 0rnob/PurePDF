
export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  og?: {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    image?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLd?: object;
}

const setMetaTag = (selector: string, attribute: string, value: string) => {
  let element = document.querySelector(selector) as HTMLElement & { content?: string; href?: string };
  if (!element) {
    const isLink = selector.startsWith('link');
    element = document.createElement(isLink ? 'link' : 'meta');
    if (isLink) {
        const relMatch = selector.match(/rel="([^"]+)"/);
        if (relMatch) {
          (element as HTMLLinkElement).rel = relMatch[1];
        }
    } else {
        const nameOrProperty = selector.match(/(name|property)="([^"]+)"/);
        if (nameOrProperty) {
            element.setAttribute(nameOrProperty[1], nameOrProperty[2]);
        }
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

const setJsonLd = (schema: object) => {
    let script = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
    if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
};

const SITE_IMAGE = `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'%3e%3crect width='1200' height='630' fill='%23EDE9FE'/%3e%3cg transform='translate(400 215)'%3e%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='1.5' width='200' height='200'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M12 6.253v11.494m-5.494-5.494H17.494' /%3e%3cpath stroke-linecap='round' stroke-linejoin='round' d='M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z' /%3e%3c/svg%3e%3ctext x='220' y='115' font-family='sans-serif' font-size='80' fill='%231e293b' font-weight='bold'%3ePurePDF%3c/text%3e%3c/g%3e%3c/svg%3e`;


export const updateMetaTags = (tags: MetaTags) => {
  // Title
  document.title = tags.title;

  // Standard Meta
  setMetaTag('meta[name="description"]', 'content', tags.description);
  if (tags.keywords) {
    setMetaTag('meta[name="keywords"]', 'content', tags.keywords);
  }

  // Canonical URL
  setMetaTag('link[rel="canonical"]', 'href', tags.canonicalUrl);
  
  // Open Graph
  setMetaTag('meta[property="og:title"]', 'content', tags.og?.title || tags.title);
  setMetaTag('meta[property="og:description"]', 'content', tags.og?.description || tags.description);
  setMetaTag('meta[property="og:url"]', 'content', tags.og?.url || tags.canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'content', tags.og?.type || 'website');
  setMetaTag('meta[property="og:image"]', 'content', tags.og?.image || SITE_IMAGE);
  setMetaTag('meta[property="og:site_name"]', 'content', 'PurePDF');

  // Twitter Card
  setMetaTag('meta[name="twitter:card"]', 'content', tags.twitter?.card || 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'content', tags.twitter?.title || tags.title);
  setMetaTag('meta[name="twitter:description"]', 'content', tags.twitter?.description || tags.description);
  setMetaTag('meta[name="twitter:image"]', 'content', tags.twitter?.image || SITE_IMAGE);
  
  // JSON-LD
  if (tags.jsonLd) {
    setJsonLd(tags.jsonLd);
  } else {
    // Clear it if not provided
    const script = document.getElementById('json-ld-schema');
    if (script) {
        script.textContent = '';
    }
  }
};
