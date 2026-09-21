import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const DIST=path.join(ROOT,'dist');
const evidence=JSON.parse(await fs.readFile(path.join(ROOT,'src/data/company-evidence.json'),'utf8'));
const company=JSON.parse(await fs.readFile(path.join(ROOT,'src/data/company-public.json'),'utf8'));
const errors=[];
const notes=[];

function fail(message){ errors.push(message); }
async function read(rel){ return fs.readFile(path.join(DIST,rel),'utf8'); }

if(evidence.threshold!==95) fail('confidence threshold must be exactly 95');

for(const [key,fact] of Object.entries(evidence.facts)){
  if(typeof fact.score!=='number' || fact.score<0 || fact.score>100) fail(key+': invalid score');
  if(!['assert','qualified','withheld'].includes(fact.publicationMode)) fail(key+': invalid publicationMode');
  if(fact.score>=evidence.threshold && fact.publicationMode!=='assert'){
    fail(key+': score meets threshold but publicationMode is not assert');
  }
  if(fact.score<evidence.threshold && fact.publicationMode==='assert'){
    fail(key+': below-threshold fact cannot be asserted');
  }
}

for(const key of ['contact.address','contact.phone','contact.email']){
  const fact=evidence.facts[key];
  if(!fact || fact.score<95 || fact.publicationMode!=='assert') fail(key+': required public contact fact is below threshold');
}

if(evidence.facts['filing.number']?.score>=95) fail('filing.number is incorrectly classified as independently high-confidence');
if(evidence.facts['filing.number']?.publicationMode!=='qualified') fail('filing.number must remain qualified until official result is independently reproduced');

for(const key of ['domain.ownership','legalEntity.name','legalEntity.uscc','legalEntity.registeredAddress','regulatory.status']){
  if(evidence.facts[key]?.publicationMode!=='withheld') fail(key+': must remain withheld below threshold');
}

const contact=await read('contact/index.html');
for(const forbidden of ['Official Contact','办公地址','正式邮箱']){
  if(contact.includes(forbidden)) fail('contact page contains over-assertive wording: '+forbidden);
}
for(const [value,label] of [
  [company.contact.address,'contact address'],
  [company.contact.phone,'contact phone'],
  [company.contact.email,'contact email'],
]){
  if(!contact.includes(value)) fail(label+' missing from contact page');
}
if((contact.match(/data-confidence="high"/g) ?? []).length<3) fail('contact page must mark address, phone and email as high-confidence');
if(!contact.includes('data-confidence="qualified"')) fail('ICP filing must be visibly marked qualified');
if(!contact.includes('企业方提供；以工信部备案管理系统实时查询结果为准')) fail('ICP qualification text missing from contact page');
if((contact.match(/data-confidence="withheld"/g) ?? []).length<2) fail('withheld legal/regulatory facts are not visibly gated');
if(!contact.includes(company.filing.queryUrl)) fail('official MIIT query URL missing from contact page');

const home=await read('index.html');
if(!home.includes('企业方提供备案号：')) fail('footer must qualify owner-provided ICP number');
if(!home.includes('以工信部实时查询为准')) fail('footer must carry ICP verification qualification');
if(!home.includes(company.filing.queryUrl)) fail('footer MIIT link missing');

for(const file of ['index.html','about/index.html','contact/index.html','research/index.html']){
  const html=await read(file);
  const orgScripts=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match=>match[1])
    .filter(body=>body.includes('"@type":"Organization"'));
  if(orgScripts.length!==1) fail(file+': expected exactly one Organization JSON-LD');
  if(orgScripts[0]){
    const org=JSON.parse(orgScripts[0]);
    if(org.name!==company.name) fail(file+': Organization name drift');
    if(org.alternateName!==company.englishBrandName) fail(file+': Organization alternateName drift');
    if(org.email!==company.contact.email) fail(file+': Organization email drift');
    if(org.telephone!==company.contact.phone) fail(file+': Organization telephone drift');
    if(org.address?.streetAddress!==company.contact.address) fail(file+': Organization address drift');
    if('legalName' in org) fail(file+': legalName must not be emitted without >=95 evidence');
    if(String(org.url).includes('ydtzfx.com')) fail(file+': ydtzfx.com must not be asserted as verified production domain before ownership evidence');
  }
}

notes.push('Threshold: '+evidence.threshold);
notes.push('High-confidence public facts: brand.name, contact.address, contact.phone, contact.email, filing.queryUrl');
notes.push('Qualified fact: filing.number');
notes.push('Withheld facts: domain ownership, legal entity, USCC, registered address, regulatory status');

for(const note of notes) console.log('✓',note);
if(errors.length){
  console.error('\nConfidence gate failed with '+errors.length+' issue(s):');
  for(const error of errors) console.error('✗',error);
  process.exit(1);
}
console.log('✓ 95% publication-confidence gate passed.');
