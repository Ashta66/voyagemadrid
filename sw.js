/* Service worker : appli hors ligne + cache des tuiles de carte vues */
const V='madrid-v8',TILES='madrid-tiles-v1',MAXT=900;
const SHELL=['./','index.html','manifest.webmanifest','icon.svg','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'];
const TILEHOST=/(arcgisonline\.com|cartocdn\.com|tile\.openstreetmap|maptiler\.com|stadiamaps\.com|thunderforest\.com)/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==TILES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function trim(c){const ks=await c.keys();if(ks.length>MAXT)for(const k of ks.slice(0,ks.length-MAXT))await c.delete(k)}
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(TILEHOST.test(u.host)){e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(r);if(hit)return hit;try{const res=await fetch(r);if(res&&(res.ok||res.type==='opaque')){c.put(r,res.clone());trim(c)}return res}catch(err){return hit||Response.error()}}));return}
 if(r.mode==='navigate'||u.origin===location.origin||/cdnjs\.cloudflare\.com|upload\.wikimedia\.org/.test(u.host)){
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:true});const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);return r.mode==='navigate'?(net.then(x=>x||hit)):(hit||net)}));
 }
});
