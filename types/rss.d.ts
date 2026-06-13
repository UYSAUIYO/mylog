declare module "rss" {
  interface RSSOptions {
    title: string;
    description: string;
    site_url: string;
    feed_url: string;
    language?: string;
    pubDate?: string;
  }

  interface RSSItem {
    title: string;
    description: string;
    url: string;
    date: string;
    categories?: string[];
  }

  class RSS {
    constructor(options: RSSOptions);
    item(item: RSSItem): void;
    xml(options?: { indent?: boolean }): string;
  }

  export = RSS;
}
