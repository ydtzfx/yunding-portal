import { getCollection, type CollectionEntry } from 'astro:content';

export type ResearchEntry = CollectionEntry<'research'>;
export type AuthorEntry = CollectionEntry<'authors'>;

export type PublishedResearchEntry = ResearchEntry & {
  data: ResearchEntry['data'] & { reportNumber: string };
};

export interface ResearchCatalogItem {
  id: string;
  reportNumber: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  authorId: string;
  date: string;
  updated: string | null;
  featured: boolean;
  related: string[];
  highlightCount: number;
  sourceCount: number;
  attachmentCount: number;
}

function isPublished(entry: ResearchEntry): entry is PublishedResearchEntry {
  return !entry.data.draft && typeof entry.data.reportNumber === 'string' && entry.data.reportNumber.length > 0;
}

export function newestFirst(a: PublishedResearchEntry, b: PublishedResearchEntry) {
  return b.data.date.valueOf() - a.data.date.valueOf();
}

export async function getPublishedResearch(): Promise<PublishedResearchEntry[]> {
  const entries = await getCollection('research');
  return entries.filter(isPublished).sort(newestFirst);
}

export async function getAllResearch(): Promise<ResearchEntry[]> {
  return getCollection('research');
}

export async function getAuthors(): Promise<AuthorEntry[]> {
  return getCollection('authors');
}

export function getResearchCategories(entries: PublishedResearchEntry[]) {
  return [...new Set(entries.map(entry => entry.data.category))].sort();
}

export function getResearchYears(entries: PublishedResearchEntry[]) {
  return [...new Set(entries.map(entry => String(entry.data.date.getFullYear())))]
    .sort((a, b) => Number(b) - Number(a));
}

export function groupResearchByYear(entries: PublishedResearchEntry[]) {
  return Object.groupBy(entries, entry => String(entry.data.date.getFullYear()));
}

export function getAuthorForResearch(entry: PublishedResearchEntry, authors: AuthorEntry[]) {
  const author = authors.find(candidate => candidate.id === entry.data.authorId);
  if (!author) throw new Error(`Missing author profile: ${entry.data.authorId}`);
  return author;
}

export function getRelatedResearch(entry: PublishedResearchEntry, published: PublishedResearchEntry[], limit = 3) {
  const explicit = published
    .filter(candidate => entry.data.related.includes(candidate.id) && candidate.id !== entry.id)
    .sort((a, b) => entry.data.related.indexOf(a.id) - entry.data.related.indexOf(b.id));

  const fallback = published
    .filter(candidate =>
      candidate.id !== entry.id
      && candidate.data.category === entry.data.category
      && !explicit.some(item => item.id === candidate.id)
    )
    .sort(newestFirst);

  return [...explicit, ...fallback].slice(0, limit);
}

export function toResearchCatalogItem(entry: PublishedResearchEntry): ResearchCatalogItem {
  return {
    id: entry.id,
    reportNumber: entry.data.reportNumber,
    title: entry.data.title,
    summary: entry.data.summary,
    category: entry.data.category,
    tags: entry.data.tags,
    authorId: entry.data.authorId,
    date: entry.data.date.toISOString().slice(0, 10),
    updated: entry.data.updated ? entry.data.updated.toISOString().slice(0, 10) : null,
    featured: entry.data.featured,
    related: entry.data.related,
    highlightCount: entry.data.highlights.length,
    sourceCount: entry.data.sources.length,
    attachmentCount: entry.data.attachments.length,
  };
}


export function toResearchCatalog(entries: PublishedResearchEntry[]) {
  return entries.map(toResearchCatalogItem);
}

export function serializeJsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
