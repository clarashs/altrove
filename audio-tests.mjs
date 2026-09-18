import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('./dist/data.json',import.meta.url)));
test('all 33 guide pages link to real Chinese and Italian MP3 files',()=>{
 for(const work of data) for(const language of ['zh','it']){
  assert.ok(work.audio[language].startsWith(`audio/${work.id}-${language}.mp3?v=`));
  assert.ok(statSync(new URL('./dist/'+work.audio[language],import.meta.url)).size>1000);
 }
});
test('opening chapter has bilingual audio',()=>{assert.ok(data[0].audio.zh);assert.ok(data[0].audio.it);});
test('English remains unavailable without translated text',()=>{
 for(const work of data)assert.equal(work.audio.en,null);
});
