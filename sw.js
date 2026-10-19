const CACHE='greenops-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./tgp.png','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  const fonts=/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(url.origin!==self.location.origin && !fonts) return; // GitHub API and everything else: straight to network
  if(fonts){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req,c)); return r; })));
    return;
  }
  // app files: network first, cache fallback (offline)
  e.respondWith(fetch(req).then(r=>{ if(r.ok){ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req,c)); } return r; }).catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('./index.html'))));
});
