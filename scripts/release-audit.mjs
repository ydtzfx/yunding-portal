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

const distFiles=await walk(DIST);
const hashes={};
for(const file of distFiles.sort()){
  const rel=path.relative(DIST,file).replaceAll(path.sep,'/');
  if(rel==='release-audit.json') continue;
  hashes[rel]=sha256(await fs.readFile(file));
}

const researchFiles=(await walk(RESEARCH)).filter(file=>/\.mdx?$/.test(file));
const reports=[];
for(const file of researchFiles){
  const data=frontmatter(await fs.readFile(file,'utf8'));
  if(data.draft===true) continue;
  reports.push({
    id:path.relative(RESEARCH,file).replaceAll(path.sep,'/').replace(/\.mdx?$/,''),
    reportNumber:data.reportNumber ?? null,
    title:data.title ?? null,
    date:data.date instanceof Date ? data.date.toISOString().slice(0,10) : String(data.date ?? ''),
    updated:data.updated ? (data.updated instanceof Date ? data.updated.toISOString().slice(0,10) : String(data.updated)) : null,
    authorId:data.authorId ?? null,
    sourceCount:Array.isArray(data.sources) ? data.sources.length : 0,
    attachmentCount:Array.isArray(data.attachments) ? data.attachments.length : 0,
  });
}
reports.sort((a,b)=>String(a.reportNumber).localeCompare(String(b.reportNumber)));

const manifest={
  schemaVersion:1,
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
    reports,
  },
  files:hashes,
};

const serialized=JSON.stringify(manifest,null,2)+'\n';
await fs.writeFile(path.join(DIST,'release-audit.json'),serialized);
console.log(`✓ Release audit manifest written: ${manifest.build.fileCount} files, ${reports.length} published report(s).`);
console.log(`✓ release-audit.json sha256: ${sha256(Buffer.from(serialized))}`);
