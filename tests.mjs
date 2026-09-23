import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import * as domain from './dist/domain.mjs';
const { search, preferences, neighbours } = domain;
const works=JSON.parse(readFileSync(new URL('./dist/data.json',import.meta.url)));
test('opening plus 33 complete trilingual artworks',()=>{assert.equal(works.length,33);assert.equal(works[0].id,'00');assert.equal(works[0].title.zh,'一趟没有终点的远行');assert.equal(works[0].title.it,'Un viaggio senza fine');assert.equal(works[0].title.en,'A Journey Without End'); for(const w of works){assert.ok(w.body.zh.length);assert.ok(w.body.it.length);assert.ok(w.body.en.length);assert.ok(w.image);}});
test('number and cross-language search',()=>{assert.equal(search(works,'0')[0].id,'00');assert.equal(search(works,'00')[0].id,'00');assert.equal(search(works,'1')[0].id,'01'); assert.equal(search(works,'01')[0].id,'01');assert.equal(search(works,'bambola')[0].id,'01');assert.equal(search(works,'失落')[0].id,'01');assert.equal(search(works,'99').length,0);assert.equal(search(works,'').length,33);});
test('safe defaults and persisted preferences',()=>{assert.deepEqual(preferences(null),{language:'it',size:'A+'});assert.deepEqual(preferences('{bad'),{language:'it',size:'A+'});assert.deepEqual(preferences('{"language":"zh","size":"A"}'),{language:'zh',size:'A'});});
test('non circular navigation',()=>{assert.equal(neighbours(works,'00').previous,null);assert.equal(neighbours(works,'00').next.id,'01');assert.equal(neighbours(works,'01').previous.id,'00');assert.equal(neighbours(works,'33').next,null);assert.equal(neighbours(works,'12').next.id,'13');});

test('30 and 31 share one page and navigate to 32',()=>{assert.equal(search(works,'31')[0].id,'30');assert.equal(search(works,'30')[0].id,'30');assert.equal(neighbours(works,'30').next.id,'32');assert.equal(neighbours(works,'32').previous.id,'30');assert.equal(works.find(w=>w.id==='30').images.length,2);});

test('audio credit omits temporary-version wording in every language',()=>{
  assert.equal(typeof domain.audioCredit,'function');
  assert.deepEqual(['zh','it','en'].map(domain.audioCredit),['AI 配音','Voce IA','AI narration']);
});

test('the root URL opens the catalogue while artwork URLs open details',()=>{
  assert.equal(typeof domain.routeKind,'function');
  assert.equal(domain.routeKind(''),'catalogue');
  assert.equal(domain.routeKind('#/'),'catalogue');
  assert.equal(domain.routeKind('#main'),'catalogue');
  assert.equal(domain.routeKind('#/works/01'),'detail');
});

test('mobile artwork images stay within the download budget',()=>{
  const directory=new URL('./dist/images/',import.meta.url);
  const sizes=readdirSync(directory).filter(name=>name.endsWith('.webp')).map(name=>statSync(new URL(name,directory)).size);
  assert.ok(sizes.reduce((sum,size)=>sum+size,0)<=4_500_000);
  assert.ok(Math.max(...sizes)<=180_000);
});

test('mobile narration stays within each language download budget',()=>{
  const directory=new URL('./dist/audio/',import.meta.url);
  for(const language of ['zh','it','en']){
    const sizes=readdirSync(directory).filter(name=>name.endsWith(`-${language}.mp3`)).map(name=>statSync(new URL(name,directory)).size);
    assert.ok(sizes.length>=33);
    assert.ok(sizes.reduce((sum,size)=>sum+size,0)<=25_000_000);
    assert.ok(Math.max(...sizes)<=1_500_000);
  }
});

test('detail pages prefetch only adjacent artwork images',()=>{
  assert.equal(typeof domain.adjacentImages,'function');
  assert.deepEqual(domain.adjacentImages(works,'09'),['images/08.webp','images/10.webp']);
  assert.deepEqual(domain.adjacentImages(works,'00'),['images/01.webp']);
});

test('media retry URLs preserve existing version parameters',()=>{
  assert.equal(typeof domain.retryUrl,'function');
  assert.equal(domain.retryUrl('images/09.webp'),'images/09.webp?retry=1');
  assert.equal(domain.retryUrl('audio/09-zh.mp3?v=abc'),'audio/09-zh.mp3?v=abc&retry=1');
});
