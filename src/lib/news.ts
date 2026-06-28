import Parser from 'rss-parser';
import { EmbedBuilder, TextChannel, Client } from 'discord.js';
import { CHANNELS, PRIMARY_COLOR } from '../constants';
import { logger } from '../logger';

const parser = new Parser();

const ARTICLES_PER_RUN = 1;

export const RSS_FEEDS = [
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
  { name: 'DEV.to', url: 'https://dev.to/feed' },
  { name: 'JavaScript Weekly', url: 'https://javascriptweekly.com/rss/' },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/' },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/' },
  { name: 'The Verge Tech', url: 'https://www.theverge.com/tech/rss/index.xml' },
];

interface Article {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
}

async function fetchArticlesFromFeed(feedUrl: string, sourceName: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items
      .filter((item) => item.link)
      .map((item) => ({
        title: item.title ?? 'Sem título',
        link: item.link!,
        source: sourceName,
        pubDate: item.pubDate,
      }));
  } catch (err) {
    logger.warn(`[news] Failed to fetch feed "${sourceName}":`, err);
    return [];
  }
}

export async function fetchAndPublishNews(client: Client): Promise<number> {
  const channel = client.channels.cache.get(CHANNELS.NEWS) as TextChannel | undefined;
  if (!channel) {
    logger.warn('[news] News channel not found');
    return 0;
  }

  const allArticles: Article[] = [];

  for (const feed of RSS_FEEDS) {
    const articles = await fetchArticlesFromFeed(feed.url, feed.name);
    allArticles.push(...articles);
  }

  if (allArticles.length === 0) {
    logger.info('[news] No articles found');
    return 0;
  }

  const selected = allArticles.sort(() => Math.random() - 0.5).slice(0, ARTICLES_PER_RUN);

  for (const article of selected) {
    const embed = new EmbedBuilder()
      .setColor(PRIMARY_COLOR)
      .setTitle(article.title)
      .setURL(article.link)
      .setFooter({ text: article.source })
      .setTimestamp(article.pubDate ? new Date(article.pubDate) : new Date());

    await channel.send({ embeds: [embed] });
    logger.info(`[news] Published: "${article.title}" from ${article.source}`);
  }

  return selected.length;
}
