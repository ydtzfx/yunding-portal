import { getPublishedResearch, toResearchCatalog } from '../../lib/research';

export const prerender = true;

export async function GET() {
  const reports = toResearchCatalog(await getPublishedResearch());
  return new Response(JSON.stringify({schemaVersion:1,count:reports.length,reports},null,2)+'\n',{
    headers:{'content-type':'application/json; charset=utf-8'}
  });
}
