// Asset-level QA only. This neither launches the game nor certifies gameplay.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {execFileSync} from 'node:child_process';
import pixelmatch from '../tools/third-party/pixelmatch/index.js';

export const BACKGROUNDS = Object.freeze({black:[0,0,0],gray:[112,112,112],white:[255,255,255]});
export const ASSET_CONTRACTS = Object.freeze([
  {id:'atlas-v2',file:'assets/guardian_atlas_states_v2.webp',width:2048,height:1024,columns:4,rows:2,gutter:24},
  {id:'cronium-v2',file:'assets/cronium_energy_atlas_v2.webp',width:512,height:512,columns:2,rows:2,gutter:32}
]);
const hash = data => createHash('sha256').update(data).digest('hex');

export function compositeRgba(data,background) {
  if (data.length%4) throw new Error('RGBA data must contain complete pixels');
  const result=new Uint8ClampedArray(data.length);
  for(let p=0;p<data.length;p+=4) {
    const a=data[p+3]/255;
    for(let c=0;c<3;c++) result[p+c]=Math.round(data[p+c]*a+background[c]*(1-a));
    result[p+3]=255;
  }
  return result;
}

export function inspectFrame(data,width,height,gutter=0) {
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0||data.length!==width*height*4)
    throw new Error('Frame dimensions must be positive integers matching RGBA data');
  const bounds={minX:width,minY:height,maxX:-1,maxY:-1};
  let visiblePixels=0,gutterAlphaPixels=0,maximumGutterAlpha=0,opaqueDarkPixels=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const p=(y*width+x)*4,a=data[p+3];
    if(a>0) {visiblePixels++;bounds.minX=Math.min(bounds.minX,x);bounds.minY=Math.min(bounds.minY,y);bounds.maxX=Math.max(bounds.maxX,x);bounds.maxY=Math.max(bounds.maxY,y);}
    if(x<gutter||y<gutter||x>=width-gutter||y>=height-gutter) {
      maximumGutterAlpha=Math.max(maximumGutterAlpha,a);if(a>0)gutterAlphaPixels++;
    }
    if(a>=240&&Math.max(data[p],data[p+1],data[p+2])<=12)opaqueDarkPixels++;
  }
  return {width,height,gutter,visiblePixels,bounds:visiblePixels?bounds:null,gutterAlphaPixels,maximumGutterAlpha,opaqueDarkPixels,rgbaSha256:hash(data)};
}

export function compareFrames(first,second,width,height) {
  return Object.fromEntries(Object.entries(BACKGROUNDS).map(([name,bg])=>[name,
    pixelmatch(compositeRgba(first,bg),compositeRgba(second,bg),null,width,height,{threshold:.025,includeAA:true})]));
}

export function validateAtlasFrames(frames,width,height,{columns,rows,gutter}) {
  if(!Number.isInteger(width/columns)||!Number.isInteger(height/rows))throw new Error('Atlas cells must have integer dimensions');
  if(frames.length!==columns*rows)throw new Error('Missing atlas frames');
  const cellWidth=width/columns,cellHeight=height/rows;
  const inspected=frames.map((frame,index)=>({index,...inspectFrame(frame,cellWidth,cellHeight,gutter)}));
  for(const frame of inspected) {
    if(!frame.visiblePixels)throw new Error('Frame '+frame.index+' is empty');
    if(frame.maximumGutterAlpha!==0)throw new Error('Frame '+frame.index+' touches its '+gutter+'px transparent gutter');
  }
  const comparisons=[];
  for(let a=0;a<frames.length;a++)for(let b=a+1;b<frames.length;b++) {
    const differences=compareFrames(frames[a],frames[b],cellWidth,cellHeight);
    if(!Object.values(differences).some(count=>count>0))throw new Error('Visually duplicate poses '+a+' and '+b);
    comparisons.push({first:a,second:b,differentPixels:differences});
  }
  return {cellWidth,cellHeight,frames:inspected,comparisons};
}

export function webpDimensions(buffer) {
  if(buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WEBP')throw new Error('Not a WebP resource');
  for(let offset=12;offset+8<=buffer.length;) {
    const type=buffer.toString('ascii',offset,offset+4),size=buffer.readUInt32LE(offset+4),p=offset+8;
    if(type==='VP8X'&&size>=10)return {width:buffer.readUIntLE(p+4,3)+1,height:buffer.readUIntLE(p+7,3)+1};
    if(type==='VP8L'&&size>=5) {const bits=buffer.readUInt32LE(p+1);return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};}
    if(type==='VP8 '&&size>=10)return {width:buffer.readUInt16LE(p+6)&0x3fff,height:buffer.readUInt16LE(p+8)&0x3fff};
    offset=p+size+(size&1);
  }
  throw new Error('WebP dimension header missing');
}

export async function runAssetQa({root,output,chromiumPath=process.env.CHROMIUM_PATH||'/usr/bin/chromium'}) {
  root=path.resolve(root);output=path.resolve(output);
  await fs.mkdir(output,{recursive:true});
  try {await fs.access(path.join(output,'results.json'));throw new Error('Evidence already exists: '+output);}catch(error){if(error.code!=='ENOENT')throw error;}
  const require=createRequire(import.meta.url),{chromium}=require('playwright');
  const {startStaticServer}=require('./browser-qa-helpers.cjs');
  const report={status:'running',startedAt:new Date().toISOString(),command:process.argv,sourceRoot:root,
    executionKind:'ASSET_RGBA_COMPOSITION_NOT_GAMEPLAY',tool:{name:'pixelmatch',revision:'ab76f526ef951c0ec6284e314a700e161b1800e6',license:'ISC'},
    assets:[],historical:[],limitations:['Compositions inspect actual decoded artwork, not a rendered game or a natural playthrough.','Distinct poses and gutters do not certify animation quality, artistic acceptance, physical Safari/iPhone or frame rate.']};
  try {
    report.source={commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
      dirty:execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim().length>0};
  } catch {report.source={commit:null,dirty:null,note:'Source directory has no usable Git metadata; file hashes identify inputs.'};}
  let server,browser;
  const save=()=>fs.writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');
  try {
    server=await startStaticServer(root);
    browser=await chromium.launch({executablePath:chromiumPath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
    report.browserVersion=browser.version();
    const page=await browser.newPage({viewport:{width:1100,height:850}});
    await page.route('**/__specialist-assets__.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><title>Asset QA</title><body></body>'}));
    await page.goto(new URL('__specialist-assets__.html',server.url).href,{waitUntil:'load'});
    async function decode(config) {
      const bytes=await fs.readFile(path.join(root,config.file));
      const decoded=await page.evaluate(async cfg=>{
        const image=new Image();image.src=cfg.file;await image.decode();
        const columns=cfg.columns||1,rows=cfg.rows||1,w=image.naturalWidth/columns,h=image.naturalHeight/rows;
        const frames=[];const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        const context=canvas.getContext('2d',{willReadFrequently:true});
        const base64=buffer=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob([buffer]));});
        for(let frame=0;frame<columns*rows;frame++) {
          context.clearRect(0,0,w,h);context.drawImage(image,(frame%columns)*w,Math.floor(frame/columns)*h,w,h,0,0,w,h);
          frames.push(await base64(context.getImageData(0,0,w,h).data));
        }
        return {width:image.naturalWidth,height:image.naturalHeight,frames};
      },config);
      return {...decoded,sha256:hash(bytes),bytes:bytes.length,frames:decoded.frames.map(frame=>new Uint8ClampedArray(Buffer.from(frame,'base64')))};
    }
    async function png(name,rgba,width,height) {
      const base64=Buffer.from(rgba).toString('base64');
      const data=await page.evaluate(({base64,width,height})=>{
        const raw=atob(base64),array=Uint8ClampedArray.from(raw,c=>c.charCodeAt(0)),canvas=document.createElement('canvas');
        canvas.width=width;canvas.height=height;canvas.getContext('2d').putImageData(new ImageData(array,width,height),0,0);
        return canvas.toDataURL('image/png').split(',')[1];
      },{base64,width,height});
      await fs.writeFile(path.join(output,name),Buffer.from(data,'base64'));return name;
    }
    for(const contract of ASSET_CONTRACTS) {
      const decoded=await decode(contract);
      if(decoded.width!==contract.width||decoded.height!==contract.height)throw new Error(contract.file+' dimensions mismatch');
      const metrics=validateAtlasFrames(decoded.frames,decoded.width,decoded.height,contract);
      const entry={...contract,sha256:decoded.sha256,bytes:decoded.bytes,rgbaDecodedBytes:decoded.width*decoded.height*4,...metrics,compositions:[]};
      report.assets.push(entry);
      // Composites retain source pixel resolution; each row is a real animation pose.
      for(const [background,bg] of Object.entries(BACKGROUNDS)) {
        const width=metrics.cellWidth*contract.columns,height=metrics.cellHeight*contract.rows,rgba=new Uint8ClampedArray(width*height*4);
        decoded.frames.forEach((frame,index)=>{
          const composite=compositeRgba(frame,bg),x=(index%contract.columns)*metrics.cellWidth,y=Math.floor(index/contract.columns)*metrics.cellHeight;
          for(let row=0;row<metrics.cellHeight;row++)rgba.set(composite.subarray(row*metrics.cellWidth*4,(row+1)*metrics.cellWidth*4),((y+row)*width+x)*4);
        });
        entry.compositions.push({background,file:await png(contract.id+'-'+background+'.png',rgba,width,height)});
      }
      // Real first/second pose difference, useful for checking that glow edits survived export.
      const diff=new Uint8ClampedArray(metrics.cellWidth*metrics.cellHeight*4);
      const different=pixelmatch(compositeRgba(decoded.frames[0],BACKGROUNDS.gray),compositeRgba(decoded.frames[1],BACKGROUNDS.gray),diff,metrics.cellWidth,metrics.cellHeight,{threshold:.025,includeAA:true});
      entry.firstPoseDiff={differentPixels:different,file:await png(contract.id+'-frame0-vs1-diff.png',diff,metrics.cellWidth,metrics.cellHeight)};
      await save();
    }
    // Historical files are measured, never required to remain broken. The old
    // opaque black crop is evidence, not an invariant for future production.
    for(const config of []) {
      const decoded=await decode(config),metrics=inspectFrame(decoded.frames[0],decoded.width,decoded.height);
      const entry={...config,sha256:decoded.sha256,bytes:decoded.bytes,...metrics,compositions:[]};
      for(const [background,bg] of Object.entries(BACKGROUNDS))entry.compositions.push({background,file:await png(config.id+'-'+background+'.png',compositeRgba(decoded.frames[0],bg),decoded.width,decoded.height)});
      report.historical.push(entry);
    }
    // Check that resource generation did not mutate any inspected input while
    // Chromium decoded it. Other sources may still be in progress in this repo.
    for(const entry of [...report.assets,...report.historical]) {
      entry.sha256After=hash(await fs.readFile(path.join(root,entry.file)));
      if(entry.sha256After!==entry.sha256)throw new Error('Inspected asset changed during QA: '+entry.file);
    }
    report.status='passed';report.exitCode=0;
  } catch(error) {report.status='failed';report.exitCode=1;report.error=error.stack||String(error);throw error;}
  finally {await browser?.close();await server?.close();report.finishedAt=new Date().toISOString();await save();}
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const {values}=parseArgs({options:{root:{type:'string',default:'.'},output:{type:'string'}}});
  if(!values.output)throw new Error('Usage: node scripts/specialist-visual-assets.mjs --root . --output UNIQUE_DIRECTORY');
  try {const result=await runAssetQa({root:values.root,output:values.output});console.log(JSON.stringify({status:result.status,assets:result.assets.length,output:path.resolve(values.output)}));}
  catch(error){console.error(error.stack||String(error));process.exitCode=1;}
}
