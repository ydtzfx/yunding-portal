import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const DIST=path.join(ROOT,'dist');
const PACKAGE=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8'));
const errors=[];
const notes=[];

function addError(message){ errors.push(message); }
async function exists(file){ try{ await fs.access(file); return true; }catch{ return false; } }
function escapeRe(value){ return String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function hasAttr(html,name,value){
  return new RegExp('\\b'+escapeRe(name)+'=["\\\']'+escapeRe(value)+'["\\\']').test(html);
}
function countMatches(text,re){ return [...text.matchAll(re)].length; }

const manifestPath=path.join(DIST,'release-audit.json');
const catalogPath=path.join(DIST,'research','catalog.json');
if(!await exists(manifestPath)) addError('release-audit.json is missing');
if(!await exists(catalogPath)) addError('research/catalog.json is missing');

if(errors.length){
  for(const item of errors) console.error('✗',item);
  process.exit(1);
}

const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const catalogDoc=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const indexHtml=await fs.readFile(path.join(DIST,'research','index.html'),'utf8');
const archiveHtml=await fs.readFile(path.join(DIST,'research','archive','index.html'),'utf8');

if(manifest.schemaVersion!==2) addError('release manifest schemaVersion must be 2; got '+manifest.schemaVersion);
if(manifest.contract!=='research-publishing-v2') addError('unexpected manifest contract: '+manifest.contract);
if(manifest.package?.version!==PACKAGE.version) addError('manifest version '+manifest.package?.version+' != package version '+PACKAGE.version);
if(catalogDoc.schemaVersion!==1) addError('catalog schemaVersion must be 1; got '+catalogDoc.schemaVersion);

const reports=manifest.research?.reports ?? [];
const drafts=manifest.research?.drafts ?? [];
const catalog=catalogDoc.reports ?? [];
if(manifest.research?.publishedCount!==reports.length) addError('manifest publishedCount does not equal reports length');
if(manifest.research?.draftCount!==drafts.length) addError('manifest draftCount does not equal drafts length');
if(catalogDoc.count!==catalog.length) addError('catalog count does not equal reports length');
if(catalog.length!==reports.length) addError('catalog/manifest report count mismatch: '+catalog.length+' vs '+reports.length);

const catalogById=new Map(catalog.map(item=>[item.id,item]));
const categoryDir=path.join(DIST,'research','category');
const categoryHtml=[];
if(await exists(categoryDir)){
  const dirs=await fs.readdir(categoryDir,{withFileTypes:true});
  for(const dir of dirs){
    if(!dir.isDirectory()) continue;
    const file=path.join(categoryDir,dir.name,'index.html');
    if(await exists(file)) categoryHtml.push(await fs.readFile(file,'utf8'));
  }
}

for(const report of reports){
  const catalogItem=catalogById.get(report.id);
  if(!catalogItem){ addError(report.id+': missing from static research catalog'); continue; }

  const alignedFields=['reportNumber','title','summary','category','authorId','date','updated','featured','highlightCount','sourceCount','attachmentCount'];
  for(const field of alignedFields){
    if(JSON.stringify(catalogItem[field])!==JSON.stringify(report[field])) addError(report.id+': catalog field '+field+' does not match release manifest');
  }
  if(JSON.stringify(catalogItem.tags)!==JSON.stringify(report.tags)) addError(report.id+': catalog tags mismatch');
  if(JSON.stringify(catalogItem.related)!==JSON.stringify(report.related)) addError(report.id+': catalog related mismatch');

  const detailPath=path.join(DIST,'research',report.id,'index.html');
  if(!await exists(detailPath)){ addError(report.id+': published detail route is missing'); continue; }
  const detail=await fs.readFile(detailPath,'utf8');

  const attributes={
    'data-report-id':report.id,
    'data-report-number':report.reportNumber,
    'data-author-id':report.authorId,
    'data-published':report.date,
    'data-source-count':String(report.sourceCount),
    'data-attachment-count':String(report.attachmentCount),
    'data-highlight-count':String(report.highlightCount),
  };
  for(const [name,value] of Object.entries(attributes)){
    if(!hasAttr(detail,name,value)) addError(report.id+': detail HTML contract marker '+name+'='+value+' missing');
  }
  if(report.updated){
    if(!hasAttr(detail,'data-updated',report.updated)) addError(report.id+': updated detail is missing data-updated='+report.updated);
  }else if(/\bdata-updated=/.test(detail)){
    addError(report.id+': non-updated detail must not emit data-updated');
  }

  const referenceCount=countMatches(detail,/\bid=["']ref-\d+["']/g);
  if(referenceCount!==report.sourceCount) addError(report.id+': rendered source count '+referenceCount+' != backend '+report.sourceCount);

  if(report.sourceCount>0 && !hasAttr(detail,'data-source-list-count',String(report.sourceCount))) addError(report.id+': source-list count marker mismatch');
  if(report.highlightCount>0 && !hasAttr(detail,'data-highlight-list-count',String(report.highlightCount))) addError(report.id+': highlight-list count marker mismatch');
  if(report.attachmentCount>0 && !hasAttr(detail,'data-attachment-list-count',String(report.attachmentCount))) addError(report.id+': attachment-list count marker mismatch');

  const hasModifiedMeta=/property=["']article:modified_time["']/.test(detail);
  const hasDateModified=/"dateModified"\s*:/.test(detail);
  if(report.updated){
    if(!hasModifiedMeta) addError(report.id+': updated report missing article:modified_time');
    if(!hasDateModified) addError(report.id+': updated report missing JSON-LD dateModified');
  }else{
    if(hasModifiedMeta) addError(report.id+': non-updated report must not emit article:modified_time');
    if(hasDateModified) addError(report.id+': non-updated report must not emit JSON-LD dateModified');
  }

  for(const tag of report.tags ?? []){
    const t=escapeRe(tag);
    const re=new RegExp('property=["\\\']article:tag["\\\'][^>]+content=["\\\']'+t+'["\\\']|content=["\\\']'+t+'["\\\'][^>]+property=["\\\']article:tag["\\\']');
    if(!re.test(detail)) addError(report.id+': article tag not rendered: '+tag);
  }

  for(const relatedId of report.related ?? []){
    if(!detail.includes('/yunding-portal/research/'+relatedId+'/')) addError(report.id+': explicit related report not rendered: '+relatedId);
  }

  if(!indexHtml.includes('data-report-id="'+report.id+'"')) addError(report.id+': missing from research index search surface');
  if(!indexHtml.includes('data-report-card="'+report.id+'"')) addError(report.id+': missing research card on index');
  if(!archiveHtml.includes('data-report-row="'+report.id+'"')) addError(report.id+': missing from archive');
  if(!categoryHtml.some(html=>html.includes('data-report-card="'+report.id+'"'))) addError(report.id+': missing from category page');

  const authorPath=path.join(DIST,'research','authors',report.authorId,'index.html');
  if(!await exists(authorPath)){
    addError(report.id+': author page missing for '+report.authorId);
  }else{
    const authorHtml=await fs.readFile(authorPath,'utf8');
    if(!hasAttr(authorHtml,'data-author-id',report.authorId)) addError(report.id+': author page contract marker missing');
    if(!authorHtml.includes('data-report-card="'+report.id+'"')) addError(report.id+': report missing from author page');
  }
}

for(const draftId of drafts){
  const detailPath=path.join(DIST,'research',draftId,'index.html');
  if(await exists(detailPath)) addError(draftId+': draft leaked to public detail route');
  if(catalogById.has(draftId)) addError(draftId+': draft leaked to public catalog');
  if(indexHtml.includes('data-report-id="'+draftId+'"')) addError(draftId+': draft leaked to research index');
}

notes.push('Published reports aligned: '+reports.length);
notes.push('Drafts isolated: '+drafts.length);
notes.push('Catalog entries aligned: '+catalog.length);
for(const note of notes) console.log('✓',note);

if(errors.length){
  console.error('\nFrontend/backend contract failed with '+errors.length+' issue(s):');
  for(const item of errors) console.error('✗',item);
  process.exit(1);
}
console.log('✓ Frontend rendering, static catalog and backend release manifest are aligned.');
