import { promises as fs } from 'node:fs';

const base='https://ydtzfx.github.io/yunding-portal';
const checks=[
  {name:'Home',url:base+'/',contains:'芸鼎投资研究院'},
  {name:'Research Library',url:base+'/research/',contains:'research-search'},
  {name:'First Report',url:base+'/research/fed-rmp-gold-2026/',contains:'YD-MACRO-2026-001'},
  {name:'Robots',url:base+'/robots.txt',contains:'Sitemap:'},
  {name:'Sitemap',url:base+'/sitemap-index.xml',contains:'sitemap'},
];

async function probe(check,attempt=1){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(check.url,{redirect:'follow',signal:controller.signal,headers:{'user-agent':'Yunding-Portal-Uptime/1.0'}});
    const text=await response.text();
    const ok=response.status>=200 && response.status<300 && text.includes(check.contains);
    if(!ok && attempt<2 && response.status>=500){
      await new Promise(r=>setTimeout(r,1500));
      return probe(check,attempt+1);
    }
    return {name:check.name,url:check.url,status:response.status,ok,marker:check.contains,finalUrl:response.url};
  }catch(error){
    if(attempt<2){
      await new Promise(r=>setTimeout(r,1500));
      return probe(check,attempt+1);
    }
    return {name:check.name,url:check.url,status:null,ok:false,marker:check.contains,error:error.name+': '+error.message};
  }finally{
    clearTimeout(timeout);
  }
}

const results=[];
for(const check of checks) results.push(await probe(check));
const failed=results.filter(x=>!x.ok);

console.log(JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
if(process.env.GITHUB_STEP_SUMMARY){
  const lines=['# Production Uptime Check','',...results.map(x=>`- ${x.ok?'✅':'❌'} **${x.name}** — HTTP ${x.status ?? 'error'} — ${x.url}`)];
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
}
if(failed.length) process.exit(1);
