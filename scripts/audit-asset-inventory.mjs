/**
 * Read-only runtime asset inventory audit.
 * Preserved files are explicit; unknown files and manifest omissions fail closed.
 * No game sources, assets, or existing tests are changed.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
export const PRESERVED=Object.freeze({});
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const sorted=values=>[...values].sort();

export function checkInventory({declared,disk,preserved=['assets/.gitkeep',...Object.keys(PRESERVED)],assetCount,expectedBytes,actualBytes}){
  const duplicates=declared.filter((name,index)=>declared.indexOf(name)!==index);
  const preservedDuplicates=preserved.filter((name,index)=>preserved.indexOf(name)!==index);
  const overlap=declared.filter(name=>preserved.includes(name));
  const expected=new Set([...declared,...preserved]);
  const missing=sorted([...expected].filter(name=>!disk.includes(name)));
  const unexpected=sorted(disk.filter(name=>!expected.has(name)));
  const errors=[];
  if(duplicates.length)errors.push('DUPLICATE_RUNTIME_ASSETS');
  if(preservedDuplicates.length)errors.push('DUPLICATE_PRESERVED_ASSETS');
  if(overlap.length)errors.push('RUNTIME_PRESERVED_OVERLAP');
  if(assetCount!==declared.length)errors.push('MANIFEST_COUNT_MISMATCH');
  if(expectedBytes!==actualBytes)errors.push('RUNTIME_BYTE_COUNT_MISMATCH');
  if(missing.length)errors.push('MISSING_FILES');
  if(unexpected.length)errors.push('UNDECLARED_FILES');
  return {ok:errors.length===0,errors,duplicates:sorted(duplicates),overlap:sorted(overlap),missing,unexpected,
    runtimeCount:declared.length,preservedCount:preserved.length};
}

export async function audit(root=ROOT){
  const manifest=JSON.parse(await readFile(join(root,'ASSET_MANIFEST.json'),'utf8'));
  const declared=[...manifest.groups.flatMap(group=>group.paths),...manifest.standalone.map(item=>item.path)];
  const disk=(await readdir(join(root,'assets'))).map(name=>'assets/'+name);
  const missingRuntime=declared.filter(path=>!disk.includes(path));
  const runtimeBuffers=await Promise.all(declared.filter(path=>disk.includes(path)).map(path=>readFile(join(root,path))));
  const actualBytes=runtimeBuffers.reduce((sum,buffer)=>sum+buffer.length,0);
  const result=checkInventory({declared,disk,assetCount:manifest.assetCount,
    expectedBytes:manifest.runtimeBytes,actualBytes});
  const hashMismatches=[];
  for(const [path,expected] of Object.entries(PRESERVED)){
    if(!disk.includes(path))continue;
    if(hash(await readFile(join(root,path)))!==expected)hashMismatches.push(path);
  }
  if(disk.includes('assets/.gitkeep') && (await readFile(join(root,'assets/.gitkeep'),'utf8')) !== 'keep\n') hashMismatches.push('assets/.gitkeep');
  if(hashMismatches.length){result.ok=false;result.errors.push('PRESERVED_CONTENT_MISMATCH');}
  return {...result,hashMismatches,expectedBytes:manifest.runtimeBytes,actualBytes};
}

function selfTest(){
  const base={declared:['assets/a.webp'],disk:['assets/a.webp','assets/old.webp'],
    preserved:['assets/old.webp'],assetCount:1,expectedBytes:10,actualBytes:10};
  assert.equal(checkInventory(base).ok,true);
  assert.ok(checkInventory({...base,disk:['assets/old.webp']}).errors.includes('MISSING_FILES'));
  assert.ok(checkInventory({...base,disk:[...base.disk,'assets/unknown.webp']}).errors.includes('UNDECLARED_FILES'));
  assert.ok(checkInventory({...base,declared:['assets/a.webp','assets/a.webp']}).errors.includes('DUPLICATE_RUNTIME_ASSETS'));
  assert.ok(checkInventory({...base,expectedBytes:11}).errors.includes('RUNTIME_BYTE_COUNT_MISMATCH'));
  assert.ok(checkInventory({...base,preserved:['assets/a.webp','assets/old.webp']}).errors.includes('RUNTIME_PRESERVED_OVERLAP'));
  console.log('PASS: 6 deterministic inventory scenarios');
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  if(process.argv.includes('--self-test'))selfTest();
  else {
    const result=await audit();
    console.log(JSON.stringify(result,null,2));
    if(!result.ok)process.exitCode=1;
  }
}
