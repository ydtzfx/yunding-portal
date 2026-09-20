import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT=process.cwd();
const RESEARCH_DIR=path.join(ROOT,'src/content/research');
const AUTHORS_DIR=path.join(ROOT,'src/content/authors');
const PUBLIC_DIR=path.join(ROOT,'public');

const errors=[];
const notes=[];

async function walk(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) files.push(...await walk(full));
    else if(/\.mdx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

function idFor(file,base){
  return path.relative(base,file).replaceAll(path.sep,'/').replace(/\.mdx?$/,'');
}

function splitFrontmatter(text,file){
  if(!text.startsWith('---\n') && !text.startsWith('---\r\n')){
    errors.push(`${file}: missing YAML frontmatter`);
    return {data:{},body:text};
  }
  const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if(!match){
    errors.push(`${file}: malformed YAML frontmatter`);
    return {data:{},body:text};
  }
  try{
    return {data:parse(match[1]) ?? {},body:match[2] ?? ''};
  }catch(error){
    errors.push(`${file}: YAML parse failed: ${error.message}`);
    return {data:{},body:match[2] ?? ''};
  }
}

function dateOnly(value){
  if(value instanceof Date) return value.toISOString().slice(0,10);
  return String(value ?? '');
}

function validDate(value){
  const d=new Date(dateOnly(value)+'T00:00:00Z');
  return Number.isFinite(d.valueOf()) ? d : null;
}

function citationNumbers(body){
  const refs=new Set();
  const re=/资料来源\s*(\d+)(?:\s*[–—-]\s*(\d+))?/g;
  for(const match of body.matchAll(re)){
    const start=Number(match[1]);
    const end=match[2] ? Number(match[2]) : start;
    if(end<start){
      refs.add(start); refs.add(end);
      continue;
    }
    for(let n=start;n<=end;n++) refs.add(n);
  }
  return refs;
}

const authorFiles=await walk(AUTHORS_DIR);
const authorIds=new Set(authorFiles.map(file=>idFor(file,AUTHORS_DIR)));

const researchFiles=await walk(RESEARCH_DIR);
const records=[];
for(const file of researchFiles){
  const rel=path.relative(ROOT,file).replaceAll(path.sep,'/');
  const id=idFor(file,RESEARCH_DIR);
  const text=await fs.readFile(file,'utf8');
  const {data,body}=splitFrontmatter(text,rel);
  records.push({file,rel,id,data,body});
}
const researchIds=new Set(records.map(r=>r.id));

const reportNumbers=new Map();
for(const record of records){
  const {data,id,rel,body}=record;
  const isDraft=data.draft===true;
  const published=!isDraft;

  if(data.reportNumber){
    if(reportNumbers.has(data.reportNumber)){
      errors.push(`${rel}: duplicate reportNumber ${data.reportNumber}; already used by ${reportNumbers.get(data.reportNumber)}`);
    }else reportNumbers.set(data.reportNumber,rel);
  }

  if(!data.authorId || !authorIds.has(String(data.authorId))){
    errors.push(`${rel}: authorId "${data.authorId ?? ''}" does not resolve to src/content/authors`);
  }

  const date=validDate(data.date);
  if(!date) errors.push(`${rel}: invalid publication date "${dateOnly(data.date)}"`);
  const updated=data.updated==null ? null : validDate(data.updated);
  if(data.updated!=null && !updated) errors.push(`${rel}: invalid updated date "${dateOnly(data.updated)}"`);
  if(date && updated && updated<date) errors.push(`${rel}: updated date must be >= publication date`);

  if(data.reportNumber && date){
    const year=String(date.getUTCFullYear());
    const match=String(data.reportNumber).match(/^YD-[A-Z]+-(\d{4})-\d{3}$/);
    if(match && match[1]!==year) errors.push(`${rel}: reportNumber year ${match[1]} does not match publication year ${year}`);
  }

  const related=Array.isArray(data.related) ? data.related.map(String) : [];
  const seenRelated=new Set();
  for(const relatedId of related){
    if(relatedId===id) errors.push(`${rel}: related cannot reference itself (${relatedId})`);
    if(!researchIds.has(relatedId)) errors.push(`${rel}: related id "${relatedId}" does not exist`);
    if(seenRelated.has(relatedId)) errors.push(`${rel}: duplicate related id "${relatedId}"`);
    seenRelated.add(relatedId);
  }

  const attachments=Array.isArray(data.attachments) ? data.attachments : [];
  for(const attachment of attachments){
    const href=String(attachment?.href ?? '');
    if(!href) continue;
    if(/^https?:\/\//i.test(href)) continue;
    const clean=href.replace(/^\/+/, '').split(/[?#]/)[0];
    const absolute=path.resolve(PUBLIC_DIR,clean);
    if(!absolute.startsWith(PUBLIC_DIR+path.sep) && absolute!==PUBLIC_DIR){
      errors.push(`${rel}: attachment escapes public directory: ${href}`);
      continue;
    }
    try{
      const stat=await fs.stat(absolute);
      if(!stat.isFile()) errors.push(`${rel}: attachment is not a file: ${href}`);
    }catch{
      errors.push(`${rel}: local attachment does not exist: public/${clean}`);
    }
  }

  const sources=Array.isArray(data.sources) ? data.sources : [];
  const sourceUrls=new Set();
  sources.forEach((source,index)=>{
    const url=String(source?.url ?? '');
    if(sourceUrls.has(url)) errors.push(`${rel}: duplicate source URL at source ${index+1}: ${url}`);
    sourceUrls.add(url);
    if(published && /(^|\.)example\.(com|org|net)(\/|$)/i.test(url)){
      errors.push(`${rel}: published source uses placeholder URL: ${url}`);
    }
  });

  if(published){
    if(!data.reportNumber) errors.push(`${rel}: published report requires reportNumber`);
    if(sources.length===0) errors.push(`${rel}: published report requires at least one source`);
    if(!/风险提示/.test(body)) errors.push(`${rel}: published report requires a risk disclosure section`);

    const refs=citationNumbers(body);
    if(sources.length>0 && refs.size===0) errors.push(`${rel}: published report has sources but no inline "资料来源 N" citations`);
    for(const n of refs){
      if(n<1 || n>sources.length) errors.push(`${rel}: citation source ${n} is out of range; report has ${sources.length} sources`);
    }
    for(let n=1;n<=sources.length;n++){
      if(!refs.has(n)) errors.push(`${rel}: source ${n} is listed but never cited inline`);
    }
  }
}

notes.push(`Research entries: ${records.length}`);
notes.push(`Published reports: ${records.filter(r=>r.data.draft!==true).length}`);
notes.push(`Authors: ${authorIds.size}`);
notes.push(`Report numbers: ${reportNumbers.size}`);

for(const note of notes) console.log('✓',note);
if(errors.length){
  console.error(`\nContent integrity failed with ${errors.length} issue(s):`);
  for(const error of errors) console.error('✗',error);
  process.exit(1);
}
console.log('✓ Content referential, publication, attachment, date and citation integrity passed.');
