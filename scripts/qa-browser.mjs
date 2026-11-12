import {chromium} from 'playwright-core';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const root='artifacts/visual';
await mkdir(root,{recursive:true});
const browser=await chromium.launch({
 headless:true,
 args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl']
});
const results=[],errors=[];
try{
 for(const viewport of [{width:1920,height:1080},{width:1366,height:768}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push('pageerror: '+error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push('console: '+message.text());});
  const response=await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>document.body.dataset.sceneReady==='true',{timeout:30000});
  await page.waitForTimeout(1400);
  const first=await page.evaluate(()=>{
   const canvas=document.querySelector('#garden-canvas');
   const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
   return {ready:document.body.dataset.sceneReady,webgl:!!gl,metrics:document.querySelector('#metrics')?.textContent};
  });
  const tag=viewport.width+'x'+viewport.height;
  await page.screenshot({path:path.join(root,'morning-'+tag+'.png')});
  await page.getByRole('button',{name:'薄暮'}).click();
  await page.waitForTimeout(500);
  const pressed=await page.getByRole('button',{name:'薄暮'}).getAttribute('aria-pressed');
  await page.screenshot({path:path.join(root,'evening-'+tag+'.png')});
  results.push({viewport,first,eveningPressed:pressed});
  if(!first.webgl||first.ready!=='true'||pressed!=='true')errors.push('Failed WebGL or UI check at '+tag);
  await context.close();
 }
}finally{await browser.close();}
const report={timestamp:new Date().toISOString(),results,errors};
await writeFile(path.join(root,'report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
