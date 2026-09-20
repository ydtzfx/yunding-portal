import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const ROOT=process.cwd();
const RESEARCH=path.join(ROOT,'src/content/research');
const REPORT_DIR=path.join(ROOT,'.reports');
const errors=[];
const warnings=[];
const results=[];

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

function frontmatter(text){
  const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? (parse(match[1]) ?? {}) : {};
}

async function probe(url,attempt=1){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(url,{
      method:'GET',
      redirect:'follow',
      signal:controller.signal,
      headers:{
        'user-agent':'Yunding-Research-Link-Health/1.0 (+https://ydtzfx.github.io/yunding-portal/)',
        'accept':'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5',
      },
    });
    try{ await response.body?.cancel(); }catch{}
    const status=response.status;
    if(status>=200 && status<400) return {status,finalUrl:response.url,state:'healthy'};
    if([401,403,405,429].includes(status)) return {status,finalUrl:response.url,state:'protected'};
    if(attempt<2 && status>=500){
      await new Promise(r=>setTimeout(r,1500));
      return probe(url,attempt+1);
    }
    return {status,finalUrl:response.url,state:'broken'};
  }catch(error){
    if(attempt<2){
      await new Promise(r=>setTimeout(r,1500));
      return probe(url,attempt+1);
    }
    return {status:null,finalUrl:null,state:'error',error:error.name+': '+error.message};
  }finally{
    clearTimeout(timeout);
  }
}

const urls=new Map();
for(const file of await walk(RESEARCH)){
  const rel=path.relative(ROOT,file).replaceAll(path.sep,'/');
  const data=frontmatter(await fs.readFile(file,'utf8'));
  if(data.draft===true) continue;
  for(const [index,source] of (Array.isArray(data.sources)?data.sources:[]).entries()){
    const url=String(source?.url ?? '');
    if(!url) continue;
    if(!urls.has(url)) urls.set(url,[]);
    urls.get(url).push({report:rel,source:index+1,title:String(source?.title ?? '')});
  }
}

for(const [url,usedBy] of urls){
  const result=await probe(url);
  results.push({url,...result,usedBy});
  const label=usedBy.map(x=>`${x.report}#${x.source}`).join(', ');
  if(result.state==='protected') warnings.push(`${url} returned HTTP ${result.status} (protected/rate-limited); used by ${label}`);
  if(result.state==='broken') errors.push(`${url} returned HTTP ${result.status}; used by ${label}`);
  if(result.state==='error') errors.push(`${url} could not be reached: ${result.error}; used by ${label}`);
}

await fs.mkdir(REPORT_DIR,{recursive:true});
await fs.writeFile(path.join(REPORT_DIR,'source-health.json'),JSON.stringify({
  checkedAt:new Date().toISOString(),
  total:results.length,
  healthy:results.filter(x=>x.state==='healthy').length,
  protected:results.filter(x=>x.state==='protected').length,
  failed:results.filter(x=>['broken','error'].includes(x.state)).length,
  results,
},null,2)+'\n');

const lines=[
  '# Source Link Health',
  '',
  `- Checked: ${results.length}`,
  `- Healthy: ${results.filter(x=>x.state==='healthy').length}`,
  `- Protected/rate-limited: ${results.filter(x=>x.state==='protected').length}`,
  `- Failed: ${results.filter(x=>['broken','error'].includes(x.state)).length}`,
  '',
];
if(warnings.length){
  lines.push('## Warnings','',...warnings.map(x=>'- ⚠️ '+x),'');
}
if(errors.length){
  lines.push('## Failures','',...errors.map(x=>'- ❌ '+x),'');
}
if(process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n'));

for(const warning of warnings) console.warn('⚠',warning);
for(const error of errors) console.error('✗',error);
console.log(`✓ Checked ${results.length} unique published source URL(s).`);
if(errors.length) process.exit(1);
