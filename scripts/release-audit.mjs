import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse } from 'yaml';

const ROOT=process.cwd();
const DIST=path.join(ROOT,'dist');
const RESEARCH=path.join(ROOT,'src/content/research');
const PACKAGE=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8'));

async function walk(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function sha256(buffer){
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function frontmatter(text){
  const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? (parse(match[1]) ?? {}) : {};
}

function dateValue(value){
  if(value==null) return null;
  return value instanceof Date ? value.toISOString().slice(0,10) : String(value);
}

const distFiles=await walk(DIST);
const hashes={};
for(const file of distFiles.sort()){
  const rel=path.relative(DIST,file).replaceAll(path.sep,'/');
  if(rel==='release-audit.json') continue;
  hashes[rel]=sha256(await fs.readFile(file));
}

const researchFiles=(await walk(RESEARCH)).filter(file=>/\.mdx?$/.test(file));
const reports=[];
const drafts=[];
for(const file of researchFiles){
  const data=frontmatter(await fs.readFile(file,'utf8'));
  const id=path.relative(RESEARCH,file).replaceAll(path.sep,'/').replace(/\.mdx?$/,'');
  if(data.draft===true){
    drafts.push(id);
    continue;
  }
  reports.push({
    id,
    reportNumber:data.reportNumber ?? null,
    title:data.title ?? null,
    summary:data.summary ?? null,
    description:data.description ?? null,
    category:data.category ?? null,
    tags:Array.isArray(data.tags) ? data.tags : [],
    authorId:data.authorId ?? null,
    date:dateValue(data.date),
    updated:dateValue(data.updated),
    featured:data.featured===true,
    related:Array.isArray(data.related) ? data.related : [],
    highlightCount:Array.isArray(data.highlights) ? data.highlights.length : 0,
    sourceCount:Array.isArray(data.sources) ? data.sources.length : 0,
    attachmentCount:Array.isArray(data.attachments) ? data.attachments.length : 0,
  });
}
reports.sort((a,b)=>String(a.reportNumber).localeCompare(String(b.reportNumber)));
drafts.sort();

const manifest={
  schemaVersion:2,
  contract:'research-publishing-v2',
  package:{name:PACKAGE.name,version:PACKAGE.version},
  git:{
    sha:process.env.GITHUB_SHA || process.env.RELEASE_SHA || 'local',
    ref:process.env.GITHUB_REF || null,
    repository:process.env.GITHUB_REPOSITORY || null,
  },
  build:{
    generatedAt:new Date().toISOString(),
    node:process.version,
    fileCount:Object.keys(hashes).length,
    htmlCount:Object.keys(hashes).filter(file=>file.endsWith('.html')).length,
  },
  research:{
    publishedCount:reports.length,
    draftCount:drafts.length,
    reports,
    drafts,
  },
  files:hashes,
};

const serialized=JSON.stringify(manifest,null,2)+'\n';
await fs.writeFile(path.join(DIST,'release-audit.json'),serialized);
console.log(`✓ Release audit manifest written: ${manifest.build.fileCount} files, ${reports.length} published report(s), ${drafts.length} draft(s).`);
console.log(`✓ release-audit.json sha256: ${sha256(Buffer.from(serialized))}`);
