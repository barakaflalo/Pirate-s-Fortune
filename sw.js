/* ── AppNest · Cloudflare Pages fix (Oct 2026) ──
   Cloudflare redirects *.html to clean URLs (/index.html -> /). Chrome refuses a
   "redirected" response that a Service Worker hands to a page load (ERR_FAILED).
   This strips the redirect flag from every response the SW fetches or reads from cache. */
(function(){
  var NB={101:1,204:1,205:1,304:1};
  function clean(r){
    if(!r||!r.redirected||NB[r.status])return r;
    return r.blob().then(function(b){return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers});});
  }
  var _fetch=self.fetch.bind(self);
  self.fetch=function(input,init){
    if(input&&typeof input==='object'&&input.mode==='navigate')input=input.url;
    return _fetch(input,init).then(clean);
  };
  var cm=Cache.prototype.match;
  Cache.prototype.match=function(){return cm.apply(this,arguments).then(clean);};
  var sm=CacheStorage.prototype.match;
  CacheStorage.prototype.match=function(){return sm.apply(this,arguments).then(clean);};
})();

/* Pirate's Fortune — AppNest service worker (network-first shell) */
const VERSION = "piratefortune-v2";
const CORE = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png", "./privacy_policy.html",
  "./art/char_admiral.webp",
  "./art/char_bosun.webp",
  "./art/char_captain.webp",
  "./art/char_inspector.webp",
  "./art/char_keeper.webp",
  "./art/char_lender.webp",
  "./art/char_mapman.webp",
  "./art/char_merchant.webp",
  "./art/char_navy.webp",
  "./art/char_oldsalt.webp",
  "./art/char_pirates.webp",
  "./art/char_rival.webp",
  "./art/char_shipwright.webp",
  "./art/city_barbados.webp",
  "./art/city_campeche.webp",
  "./art/city_cartagena.webp",
  "./art/city_curacao.webp",
  "./art/city_havana.webp",
  "./art/city_maracaibo.webp",
  "./art/city_martinique.webp",
  "./art/city_nassau.webp",
  "./art/city_portobelo.webp",
  "./art/city_portroyal.webp",
  "./art/city_sanjuan.webp",
  "./art/city_santodomingo.webp",
  "./art/city_tortuga.webp",
  "./art/city_veracruz.webp",
  "./art/end_broke.webp",
  "./art/end_win.webp",
  "./art/ev_escape.webp",
  "./art/ev_fight_win.webp",
  "./art/ev_inspect.webp",
  "./art/ev_lucky_cash.webp",
  "./art/ev_lucky_crate.webp",
  "./art/ev_lucky_map.webp",
  "./art/ev_merchant.webp",
  "./art/ev_mutiny.webp",
  "./art/ev_navy.webp",
  "./art/ev_pirates.webp",
  "./art/ev_plunder.webp",
  "./art/ev_quiet.webp",
  "./art/ev_storm.webp",
  "./art/ev_trap.webp",
  "./art/ev_treasure.webp",
  "./art/good_gold.webp",
  "./art/good_rum.webp",
  "./art/good_silk.webp",
  "./art/good_spices.webp",
  "./art/good_sugar.webp",
  "./art/good_tobacco.webp",
  "./art/home_hero.webp",
  "./art/map_caribbean.webp",
  "./art/prot_gunners.webp",
  "./art/prot_marque.webp",
  "./art/prot_pilot.webp",
  "./art/prot_pouch.webp",
  "./art/rank_1.webp",
  "./art/rank_2.webp",
  "./art/rank_3.webp",
  "./art/rank_4.webp",
  "./art/rank_5.webp",
  "./art/route_flag.webp",
  "./art/route_islands.webp",
  "./art/route_ocean.webp",
  "./art/ship_brig.webp",
  "./art/ship_frigate.webp",
  "./art/ship_galleon.webp",
  "./art/ship_sloop.webp",
  "./art/tv_forecast.webp",
  "./art/tv_rumors.webp",
  "./art/up_cannons.webp",
  "./art/up_hidden.webp",
  "./art/up_hold.webp",
  "./art/up_hull.webp",
  "./art/up_sails.webp"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // only handle same-origin app shell; everything else passes through untouched
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || (req.mode === "navigate" ? caches.match("./") : undefined)))
  );
});
