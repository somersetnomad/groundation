/* Groundation site script. No tracking, no network requests except a YouTube video the visitor chooses to play. */
(function () {
"use strict";
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var hasGsap = function () { return !!(window.gsap && !reduce); };
function readJSON(id) { var n = document.getElementById(id); if (!n) return null; try { return JSON.parse(n.textContent); } catch (e) { return null; } }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

$$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });

/* ---------- Local storage: opt-in only ---------- */
var KEY = "groundation.v1";
var store = { progress: false, videos: false, seen: [], best: null };
(function load() { try { var raw = localStorage.getItem(KEY); if (!raw) return; var d = JSON.parse(raw) || {}; store.progress = !!d.progress; store.videos = !!d.videos; store.seen = Array.isArray(d.seen) ? d.seen : []; store.best = typeof d.best === "number" ? d.best : null; } catch (e) {} })();
function save() { try { if (!store.progress && !store.videos) { localStorage.removeItem(KEY); return; } var out = { progress: store.progress, videos: store.videos }; if (store.progress) { out.seen = store.seen; out.best = store.best; } localStorage.setItem(KEY, JSON.stringify(out)); } catch (e) {} }
function wipe() { store = { progress: false, videos: false, seen: [], best: null }; try { localStorage.removeItem(KEY); } catch (e) {} }

function setStatus(node, msg) { if (!node) return; node.textContent = msg; clearTimeout(node._t); node._t = setTimeout(function () { node.textContent = ""; }, 3500); }
function copyText(text, statusNode, okMsg) {
  function fallback() { var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); setStatus(statusNode, ok ? okMsg : "Select the text and copy it manually."); }
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { setStatus(statusNode, okMsg); }, fallback); else fallback(); } catch (e) { fallback(); }
}
$$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), null, ""); var t = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = t; }, 1800); }); });

/* ---------- Nav: progress dots and current chapter ---------- */
var pageKey = ($("#main") || {}).getAttribute ? $("#main").getAttribute("data-page") : "";
function markNav() { document.documentElement.classList.toggle("tracking", store.progress); $$(".nav a[data-sec]").forEach(function (a) { a.classList.toggle("seen", store.progress && store.seen.indexOf(a.getAttribute("data-sec")) > -1); }); }
if (store.progress && pageKey && $(".nav a[data-sec='" + pageKey + "']") && store.seen.indexOf(pageKey) < 0) { store.seen.push(pageKey); save(); }
markNav();
(function () { var cur = $(".nav a[aria-current='page']"); var nav = $(".nav"); if (cur && nav) nav.scrollLeft = cur.offsetLeft - nav.clientWidth / 2 + cur.clientWidth / 2; })();
var prog = $("#readProgress");
function onScroll() { if (!prog) return; var h = document.documentElement; var max = h.scrollHeight - h.clientHeight; prog.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")"; }
window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- Your data page ---------- */
var optP = $("#optProgress"), optV = $("#optVideos");
function refreshData() {
  if (optP) optP.checked = store.progress; if (optV) optV.checked = store.videos;
  var sum = $("#dataSummary"); if (sum) {
    var parts = [];
    if (store.progress) parts.push(store.seen.length + " chapter" + (store.seen.length === 1 ? "" : "s") + " marked as read" + (store.best !== null ? " and a best quiz score of " + store.best + " of 10" : ""));
    if (store.videos) parts.push("your choice to always play videos");
    sum.textContent = parts.length ? "Stored on this device now: " + parts.join("; ") + "." : "Nothing is stored on this device.";
  }
  markNav(); $$(".video-always").forEach(function (c) { c.checked = store.videos; });
}
if (optP) optP.addEventListener("change", function () { store.progress = optP.checked; if (!optP.checked) { store.seen = []; store.best = null; } save(); refreshData(); setStatus($("#clearStatus"), optP.checked ? "Reading progress is on. It stays on this device." : "Reading progress switched off and cleared."); });
if (optV) optV.addEventListener("change", function () { store.videos = optV.checked; save(); refreshData(); setStatus($("#clearStatus"), optV.checked ? "Videos will play without asking." : "Videos will ask before loading."); });
var clr = $("#clearData"); if (clr) clr.addEventListener("click", function () { wipe(); refreshData(); setStatus($("#clearStatus"), "Everything this site stored on your device has been deleted."); });
refreshData();

/* ---------- Click-to-play YouTube ---------- */
function loadVideo(fig) {
  if (fig.classList.contains("playing")) return;
  var id = fig.getAttribute("data-video"), title = fig.getAttribute("data-title") || "Video";
  var f = document.createElement("iframe");
  f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&modestbranding=1";
  f.title = title; f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
  f.referrerPolicy = "strict-origin-when-cross-origin"; f.loading = "lazy";
  $(".video-frame", fig).appendChild(f); fig.classList.add("playing"); f.focus();
}
$$(".video").forEach(function (fig) {
  var btn = $(".video-play", fig), always = $(".video-always", fig);
  if (always) { always.checked = store.videos; always.addEventListener("change", function () { store.videos = always.checked; save(); refreshData(); }); }
  if (btn) btn.addEventListener("click", function () { loadVideo(fig); });
});

/* ---------- Embers ---------- */
$$("canvas.embers").forEach(function (cv) {
  var c2 = cv.getContext("2d"); if (!c2) return; var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], running = true;
  function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; c2.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); window.addEventListener("resize", size);
  var cols = ["245,185,10", "228,55,47", "47,184,102"];
  for (var i = 0; i < 60; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + 0.6, v: Math.random() * 0.5 + 0.15, d: Math.random() * 6.28, c: cols[Math.random() < 0.6 ? 0 : Math.random() < 0.6 ? 1 : 2], a: Math.random() * 0.6 + 0.2 });
  function dot(p, a) { c2.beginPath(); c2.fillStyle = "rgba(" + p.c + "," + a.toFixed(3) + ")"; c2.arc(p.x, p.y, p.r, 0, 6.283); c2.fill(); }
  if (reduce) { parts.forEach(function (p) { dot(p, p.a * 0.6); }); return; }
  function frame() { if (!running) return; c2.clearRect(0, 0, W, H); parts.forEach(function (p) { p.y -= p.v; p.d += 0.01; p.x += Math.sin(p.d) * 0.3; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; } dot(p, p.a * Math.min(1, p.y / H * 1.4)); }); requestAnimationFrame(frame); }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { var vis = e[0].isIntersecting; if (vis && !running) { running = true; requestAnimationFrame(frame); } else if (!vis) running = false; }).observe(cv);
  requestAnimationFrame(frame);
});

/* ---------- Generic tabs (Mansions, Places) ---------- */
function tabs(listSel, onShow) {
  var list = $(listSel); if (!list) return null; var btns = $$("[role=tab]", list);
  function show(i, focus) { btns.forEach(function (b, j) { var on = i === j; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; var p = document.getElementById(b.getAttribute("aria-controls")); if (p) p.hidden = !on; }); if (focus) btns[i].focus(); if (onShow) onShow(i); }
  btns.forEach(function (b, i) { b.addEventListener("click", function () { show(i); }); b.addEventListener("keydown", function (e) { var n = null; if (e.key === "ArrowRight") n = (i + 1) % btns.length; if (e.key === "ArrowLeft") n = (i - 1 + btns.length) % btns.length; if (n !== null) { e.preventDefault(); show(n, true); } }); });
  return show;
}
tabs("#mTabs", function (i) { if (!hasGsap()) return; var p = $$(".mansion")[i]; if (!p) return; gsap.fromTo($(".mansion-badge svg", p), { rotate: -25, scale: .8 }, { rotate: 0, scale: 1, duration: .8, ease: "back.out(1.6)" }); gsap.fromTo($$(".facts dt, .facts dd", p), { y: 12, opacity: .2 }, { y: 0, opacity: 1, duration: .45, stagger: .03, ease: "power2.out" }); });

tabs("#eraTabs", function (i) { if (!hasGsap()) return; var p = $$(".era-panel")[i]; if (p) gsap.fromTo(p.children, { y: 24, opacity: .2 }, { y: 0, opacity: 1, duration: .5, stagger: .08, ease: "power3.out" }); });

var showPlace = tabs("#placeList", function (i) {
  var id = $$("#placeList [role=tab]")[i].getAttribute("aria-controls").replace("place-", "");
  $$("#pins .pin").forEach(function (g) { g.classList.toggle("on", g.getAttribute("data-id") === id); });
  $$("#arcs .arc").forEach(function (a) { var on = a.getAttribute("data-id") === id; a.style.stroke = on ? "var(--red)" : ""; a.style.strokeWidth = on ? "3" : ""; });
  if (hasGsap()) gsap.fromTo("#place-" + id, { y: 14, opacity: .3 }, { y: 0, opacity: 1, duration: .4, ease: "power2.out" });
});
if (showPlace) $$("#pins .pin").forEach(function (g) { g.style.cursor = "pointer"; g.addEventListener("click", function () { showPlace(+g.getAttribute("data-i")); }); });

/* ---------- Lexicon ---------- */
(function () { var list = $("#lexList"); if (!list) return; var btns = $$(".word", list);
  btns.forEach(function (b, i) { b.addEventListener("click", function () { btns.forEach(function (x, j) { x.setAttribute("aria-pressed", String(i === j)); var c = document.getElementById(x.getAttribute("aria-controls")); if (c) c.hidden = i !== j; }); var card = document.getElementById(b.getAttribute("aria-controls")); if (card && hasGsap()) gsap.fromTo($(".w", card), { y: 30, opacity: .2, skewY: 4 }, { y: 0, opacity: 1, skewY: 0, duration: .5, ease: "power3.out" }); }); });
})();

/* ---------- Debates ---------- */
$$(".debate > button").forEach(function (btn) { var body = document.getElementById(btn.getAttribute("aria-controls")); btn.addEventListener("click", function () { var open = btn.getAttribute("aria-expanded") === "true"; btn.setAttribute("aria-expanded", String(!open)); body.hidden = open; if (!open && hasGsap()) gsap.fromTo(body, { y: -8, opacity: .3 }, { y: 0, opacity: 1, duration: .35 }); if (window.ScrollTrigger) ScrollTrigger.refresh(); }); });

/* ---------- Timeline filter + keys ---------- */
(function () { var track = $("#tlTrack"); if (!track) return; var sc = $("#tlScroller");
  $$(".tl-filter .chip").forEach(function (b) { b.addEventListener("click", function () { var f = b.getAttribute("data-f"); $$(".tl-filter .chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); $$(".tl-card", track).forEach(function (c) { c.hidden = !(f === "all" || c.getAttribute("data-cat") === f); }); sc.scrollLeft = 0; if (window.ScrollTrigger) ScrollTrigger.refresh(); }); });
  sc.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); sc.scrollBy({ left: e.key === "ArrowRight" ? 320 : -320, behavior: reduce ? "auto" : "smooth" }); } });
})();

/* ---------- Drums ---------- */
(function () {
  if (!$("#drumStage")) return;
  var ctx = null, master = null, noiseBuf = null, playing = false, nextTime = 0, step = 0, timer = null;
  function ensure() { if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC(); master = ctx.createGain(); master.gain.value = $("#vol").value / 100 * 0.9; var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination); noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); var ch = noiseBuf.getChannelData(0); for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; } if (ctx.state === "suspended") ctx.resume(); return true; }
  function tone(t, f0, f1, dur, gain, type) { var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); }
  function slap(t, freq, dur, gain) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = 1.4; var g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02); }
  function flash(id, v) { var box = $("#drum-" + id); if (!box) return; box.classList.add("hit"); setTimeout(function () { box.classList.remove("hit"); }, 90); if (hasGsap()) gsap.fromTo($(".ring", box), { scale: 1, opacity: .9 * v }, { scale: 1.35, opacity: 0, duration: .6, ease: "power2.out" }); }
  function hit(id, t, v) { if (id === "bass") { tone(t, 110, 48, 1.1 * v + 0.2, 0.9 * v); slap(t, 180, 0.08, 0.25 * v); } else if (id === "funde") { tone(t, 190, 120, 0.35, 0.55 * v); slap(t, 700, 0.05, 0.18 * v); } else { tone(t, 420, 300, 0.18, 0.42 * v, "triangle"); slap(t, 2200, 0.04, 0.22 * v); } setTimeout(function () { flash(id, v); }, Math.max(0, (t - ctx.currentTime) * 1000)); }
  var phrases = [[0,0,1,0,0,1,0,1],[1,0,0,1,1,0,1,0],[0,1,0,1,0,0,1,1],[0,0,0,1,0,1,1,0],[1,0,1,0,0,0,1,0]], phrase = phrases[0];
  function on(id) { var c = $("#on-" + id); return c && c.checked; }
  function schedule() { var six = 60 / +$("#tempo").value / 4; while (nextTime < ctx.currentTime + 0.15) { var s = step % 16;
    if (on("bass")) { if (s === 0) hit("bass", nextTime, 1); if (s === 8) hit("bass", nextTime, 0.45); }
    if (on("funde")) { if (s % 4 === 2) hit("funde", nextTime, 0.45); if (s % 4 === 0) hit("funde", nextTime, 0.95); }
    if (on("rep")) { if (s === 0 && Math.random() < 0.5) phrase = phrases[Math.floor(Math.random() * phrases.length)]; if (phrase[s % 8] && Math.random() > 0.1) hit("rep", nextTime + Math.random() * 0.02, 0.5 + Math.random() * 0.5); }
    nextTime += six; step++; } }
  var btn = $("#drumPlay");
  function start() { if (!ensure()) return; playing = true; step = 0; nextTime = ctx.currentTime + 0.08; timer = setInterval(schedule, 25); schedule(); btn.classList.add("playing"); btn.setAttribute("aria-pressed", "true"); $("#drumIcon").textContent = "■"; $("#drumLabel").textContent = "Stop"; }
  function stop() { playing = false; clearInterval(timer); btn.classList.remove("playing"); btn.setAttribute("aria-pressed", "false"); $("#drumIcon").textContent = "▶"; $("#drumLabel").textContent = "Play the rhythm"; }
  btn.addEventListener("click", function () { playing ? stop() : start(); });
  $("#tempo").addEventListener("input", function () { $("#tempoVal").textContent = this.value; });
  $("#vol").addEventListener("input", function () { if (master) master.gain.value = this.value / 100 * 0.9; });
  $$(".drum svg").forEach(function (svg) { svg.style.cursor = "pointer"; svg.addEventListener("click", function () { if (ensure()) hit(svg.parentNode.getAttribute("data-drum"), ctx.currentTime + 0.01, 1); }); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && playing) stop(); });
})();

/* ---------- Reasoning of the day ---------- */
(function () { var R = readJSON("reasonData"); if (!R || !R.length) return;
  var d = new Date(); var day = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); var today = day % R.length, i = today;
  function render(anim) { var r = R[i]; $("#h-reason").textContent = r.word; $("#reasonText").textContent = r.text; $("#reasonQ").textContent = "Reason on this: " + r.question; $("#reasonCount").textContent = (i + 1) + " of " + R.length + (i === today ? " · today's" : ""); if (anim && hasGsap()) gsap.fromTo("#h-reason", { yPercent: 30, opacity: .2 }, { yPercent: 0, opacity: 1, duration: .5, ease: "power3.out" }); }
  $("#reasonDate").textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  $("#reasonPrev").addEventListener("click", function () { i = (i - 1 + R.length) % R.length; render(true); });
  $("#reasonNext").addEventListener("click", function () { i = (i + 1) % R.length; render(true); });
  $("#reasonToday").addEventListener("click", function () { i = today; render(true); });
  render(false);
})();

/* ---------- Quiz ---------- */
(function () { var Q = readJSON("quizData"), box = $("#quizBox"); if (!Q || !box) return; var qi = 0, score = 0;
  function render() { if (qi >= Q.length) return result(); var q = Q[qi];
    box.innerHTML = "<div class='quiz-top'><span class='tabular'>Question " + (qi + 1) + " of " + Q.length + "</span><span class='tabular' id='qScore'>Score " + score + "</span></div><div class='quiz-bar'><i style='width:" + (qi / Q.length * 100) + "%'></i></div><h2 class='quiz-q'>" + esc(q.q) + "</h2><div class='opts'>" + q.options.map(function (o, j) { return "<button type='button' class='opt' data-j='" + j + "'><b>" + "ABCD"[j] + "</b><span>" + esc(o) + "</span></button>"; }).join("") + "</div><div id='qExplain'></div><div class='quiz-actions'></div>";
    $$(".opt", box).forEach(function (b) { b.addEventListener("click", function () { answer(+b.getAttribute("data-j")); }); }); if (qi > 0) $(".opt", box).focus(); }
  function answer(j) { var q = Q[qi], right = j === q.answer; if (right) score++; $$(".opt", box).forEach(function (b, k) { b.disabled = true; if (k === q.answer) b.classList.add("right"); else if (k === j) b.classList.add("wrong"); });
    $("#qExplain").innerHTML = "<p class='explain'><strong style='color:var(--ink)'>" + (right ? "Right." : "Not quite.") + "</strong> " + esc(q.explain) + "</p>"; $("#qScore").textContent = "Score " + score;
    var next = document.createElement("button"); next.type = "button"; next.className = "btn"; next.textContent = qi === Q.length - 1 ? "See my score" : "Next question"; next.addEventListener("click", function () { qi++; render(); }); $(".quiz-actions", box).appendChild(next); next.focus(); }
  function result() { var msg = score >= 9 ? "Higher heights. You overstand." : score >= 6 ? "Strong roots. Keep reasoning." : score >= 3 ? "A good start. The chapters hold every answer." : "Every elder was once a beginner. Read on and try again.";
    var best = ""; if (store.progress) { if (store.best === null || score > store.best) { store.best = score; save(); } best = "<p class='small muted'>Your best on this device: " + store.best + " of " + Q.length + "</p>"; }
    box.innerHTML = "<div class='quiz-bar'><i style='width:100%'></i></div><div class='score tabular'>" + score + "/" + Q.length + "</div><p class='lede' style='margin-top:12px'>" + esc(msg) + "</p>" + best + "<div class='quiz-actions' style='justify-content:flex-start'><button type='button' class='btn' id='qAgain'>Try again</button><a class='btn ghost' href='#share' style='text-decoration:none'>Make a share card</a></div>";
    $("#qAgain").addEventListener("click", function () { qi = 0; score = 0; render(); }); if (hasGsap()) gsap.from(".score", { scale: .6, opacity: .2, duration: .7, ease: "back.out(1.8)" }); }
  render();
})();

/* ---------- Share cards ---------- */
(function () { var F = readJSON("factsData"), img = $("#shareImg"); if (!F || !img) return; var si = 0, ti = 0, status = $("#shareStatus"), lastUrl = "", lastBlob = null;
  var THEMES = [{ bg: "#f5b90a", fg: "#130e09", ac: "#e4372f" }, { bg: "#130e09", fg: "#f4ead4", ac: "#f5b90a" }, { bg: "#0f6b38", fg: "#f4ead4", ac: "#f5b90a" }, { bg: "#8e1c16", fg: "#f4ead4", ac: "#f5b90a" }];
  function wrap(x, text, maxW) { var words = text.split(" "), lines = [], line = ""; words.forEach(function (w) { var t = line ? line + " " + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }); if (line) lines.push(line); return lines; }
  function draw() { var c = document.createElement("canvas"); c.width = 1080; c.height = 1350; var x = c.getContext("2d"), th = THEMES[ti];
    x.fillStyle = th.bg; x.fillRect(0, 0, 1080, 1350); ["#2fb866", "#f5b90a", "#e4372f"].forEach(function (col, i) { x.fillStyle = col; x.fillRect(0, i * 34, 1080, 34); }); if (th.bg === "#f5b90a") { x.fillStyle = "#130e09"; x.fillRect(0, 34, 1080, 34); x.fillStyle = "#f5b90a"; x.fillRect(0, 40, 1080, 22); }
    x.fillStyle = th.ac; x.font = "600 34px ui-monospace, Menlo, monospace"; x.fillText("DID YOU KNOW", 90, 220);
    var size = 96, lines; x.fillStyle = th.fg; do { x.font = "900 " + size + "px 'Big Shoulders Display', Impact, sans-serif"; lines = wrap(x, F[si].toUpperCase(), 900); size -= 4; } while (lines.length * size > 820 && size > 40);
    lines.forEach(function (l, i) { x.fillText(l, 90, 320 + i * size * 1.02); });
    x.fillStyle = th.ac; x.fillRect(90, 1180, 90, 8); x.fillStyle = th.fg; x.font = "900 52px 'Big Shoulders Display', Impact, sans-serif"; x.fillText("GROUNDATION", 90, 1260); x.globalAlpha = .8; x.font = "400 28px Literata, Georgia, serif"; x.fillText(location.host || "", 420, 1258); x.globalAlpha = 1;
    try { lastUrl = c.toDataURL("image/png"); img.src = lastUrl; if (c.toBlob) c.toBlob(function (b) { lastBlob = b; }, "image/png"); } catch (e) {} img.alt = "Share card: " + F[si]; }
  function text() { return F[si] + " (Groundation: " + location.origin + ")"; }
  $$(".share-opt").forEach(function (b) { b.addEventListener("click", function () { si = +b.getAttribute("data-i"); $$(".share-opt").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); }); });
  $("#shareColour").addEventListener("click", function () { ti = (ti + 1) % THEMES.length; draw(); });
  $("#shareCopy").addEventListener("click", function () { copyText(text(), status, "Copied to your clipboard."); });
  $("#shareSave").addEventListener("click", function () { var a = document.createElement("a"); a.href = lastUrl; a.download = "groundation-card-" + (si + 1) + ".png"; document.body.appendChild(a); a.click(); a.remove(); setStatus(status, "If nothing downloaded, right-click or long-press the image to save it."); });
  $("#shareNative").addEventListener("click", function () { var fallback = function () { copyText(text(), status, "Sharing isn't available here, so the text was copied instead."); };
    if (!navigator.share) return fallback();
    var data = { text: text() }; try { if (lastBlob && window.File) { var file = new File([lastBlob], "groundation.png", { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file]; } } catch (e) {} navigator.share(data).catch(function (e) { if (!e || e.name !== "AbortError") fallback(); }); });
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load("900 40px 'Big Shoulders Display'"), document.fonts.load("400 20px Literata")]).then(draw, draw); draw();
})();

/* ---------- Motion ---------- */
function motion() {
  if (!window.gsap || !window.ScrollTrigger || reduce) return;
  gsap.registerPlugin(ScrollTrigger);
  if ($(".hero h1")) { var tl = gsap.timeline({ defaults: { ease: "power4.out" } }); tl.from(".hero h1 .ln > span", { yPercent: 105, duration: 1.1, stagger: .12 }).from(".hero .bands i", { scaleX: 0, duration: 1.2, stagger: .12, ease: "expo.out" }, "-=.7").from(".hero-grid > *, .hero-cta", { y: 24, opacity: .2, duration: .8, stagger: .1 }, "-=1"); gsap.to(".hero .bands", { yPercent: -60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } }); }
  if ($(".ch-title")) { gsap.from(".ch-title", { y: 50, opacity: .1, duration: 1, ease: "power4.out" }); gsap.from(".chapter-head .bands i", { scaleX: 0, duration: 1.1, stagger: .1, ease: "expo.out", delay: .2 }); }
  $$(".sec h2").forEach(function (h) { if (h.id === "h-reason" || h.closest(".mansion,.place-card,.debate,.ital,.voice,.path,.respect,.quiz")) return; gsap.from(h, { y: 50, opacity: .15, duration: 1, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 90%" } }); });
  ScrollTrigger.batch(".reveal", { start: "top 92%", onEnter: function (b) { gsap.from(b, { y: 36, opacity: .2, duration: .8, stagger: .08, ease: "power3.out", overwrite: true }); } });
  $$(".photo img").forEach(function (im) { gsap.fromTo(im, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: im, start: "top bottom", end: "bottom top", scrub: true } }); });
  $$(".photo").forEach(function (f) { f.style.overflow = "hidden"; });
  if ($(".pinnacle-art")) { gsap.from(".pinnacle-art", { scale: .92, rotate: -2, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".pinnacle", start: "top 80%" } }); gsap.to(".pinnacle-art .smoke circle", { y: -14, opacity: 0, duration: 2.4, stagger: .5, repeat: -1, ease: "sine.out" }); }
  if ($(".paths")) { gsap.from(".path", { y: 50, opacity: .2, duration: .8, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: ".paths", start: "top 85%" } }); gsap.from(".path .lvl i.on", { scaleX: 0, transformOrigin: "0 50%", duration: .5, stagger: .06, scrollTrigger: { trigger: ".paths", start: "top 85%" } }); }
  if ($("#mapSvg")) { $$(".arc").forEach(function (a) { var L = a.getTotalLength(); a.style.strokeDasharray = L; a.style.strokeDashoffset = L; }); gsap.to(".arc", { strokeDashoffset: 0, duration: 1.6, stagger: .12, ease: "power2.inOut", scrollTrigger: { trigger: "#mapSvg", start: "top 85%" }, onComplete: function () { $$(".arc").forEach(function (a) { a.style.strokeDasharray = ""; }); } }); $$(".halo").forEach(function (h, i) { gsap.to(h, { attr: { r: 18 }, opacity: 0, duration: 2, repeat: -1, delay: i * .25, ease: "power1.out" }); }); }
  if ($(".video")) ScrollTrigger.batch(".video", { start: "top 92%", onEnter: function (b) { gsap.from(b, { y: 40, opacity: .2, duration: .9, stagger: .12, ease: "power3.out" }); } });
  if ($("#tlTrack")) { var mm = gsap.matchMedia(); mm.add("(min-width: 900px)", function () { var wrap = $("#tlWrap"), trk = $("#tlTrack"); wrap.classList.add("tl-pinned"); $("#tlHint").textContent = "Keep scrolling: the timeline moves sideways";
    gsap.to(trk, { x: function () { return -(trk.scrollWidth - window.innerWidth); }, ease: "none", scrollTrigger: { trigger: wrap, start: "center center", end: function () { return "+=" + (trk.scrollWidth - window.innerWidth); }, pin: wrap, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
    return function () { wrap.classList.remove("tl-pinned"); $("#tlHint").textContent = "Scroll or swipe sideways · Use arrow keys when focused"; gsap.set(trk, { x: 0 }); }; }); }
  if ($(".plate-bits")) gsap.to(".plate-bits", { rotate: 40, transformOrigin: "200px 200px", ease: "none", scrollTrigger: { trigger: ".plate", start: "top bottom", end: "bottom top", scrub: true } });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
}
motion();
})();
