import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('./dist/data.json',import.meta.url)));
test('all 33 guide pages link to real MP3 files in all three languages',()=>{
 for(const work of data) for(const language of ['zh','it','en']){
  assert.ok(work.audio[language].startsWith(`audio/${work.id}-${language}.mp3?v=`));
  assert.ok(statSync(new URL('./dist/'+work.audio[language],import.meta.url)).size>1000);
 }
});
test('opening chapter has trilingual audio',()=>{for(const language of ['zh','it','en'])assert.ok(data[0].audio[language]);});
test('English text is present on every guide page',()=>{
 for(const work of data){assert.ok(work.title.en);assert.ok(work.body.en.length);}
});
