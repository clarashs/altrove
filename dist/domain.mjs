export function search(works,query){const q=query.trim();if(!q)return works;if(/^\d+$/.test(q))return works.filter(w=>[w.id,...(w.aliases||[])].some(id=>Number(id)===Number(q)));const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();return works.filter(w=>Object.values(w.title).some(t=>norm(t).includes(norm(q))));}
export function preferences(raw){let p;try{p=JSON.parse(raw)}catch{}return {language:['zh','it','en'].includes(p?.language)?p.language:'it',size:p?.size==='A'?'A':'A+'};}
export function neighbours(works,id){const i=works.findIndex(w=>w.id===id);return {previous:i>0?works[i-1]:null,next:i>=0?works[i+1]??null:null};}
export function audioCredit(language){return {zh:'AI 配音',it:'Voce IA',en:'AI narration'}[language]||'AI narration';}
export function routeKind(hash){if(!hash||hash==='#/'||hash==='#main')return 'catalogue';return /^#\/works\/\d{2}$/.test(hash)?'detail':'notfound';}
export function adjacentImages(works,id){const {previous,next}=neighbours(works,id);return [previous,next].filter(Boolean).flatMap(work=>work.images?.map(image=>image.src)||[work.image]);}
export function retryUrl(src){return `${src}${src.includes('?')?'&':'?'}retry=1`;}
