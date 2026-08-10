// AIPM shared block. Source of truth: tools/shared/aipm.js
// Copied into every app by tools/build_apps.py. Never edit the copy inside an app.
//
// What lives here:
//   1. tiny DOM helpers
//   2. the store: one localStorage document, migration, read-modify-write
//   3. metrics with their plain-language definitions
//   4. the clipboard handoff to Claude Code
//   5. applying state Claude Code injected into the page
//   6. shared chrome: width control, reset dialog, toasts
//   7. a self-test you can run by adding #selftest to the URL

const AIPM = (() => {

  /* ---------- 1. helpers ---------- */

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function toast(message, ms) {
    let el = $("#aipm-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "aipm-toast";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.className = "on";
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = ""; }, ms || 3200);
  }

  /* ---------- 2. the store ---------- */

  const KEY = "aipm.v2";
  const RESCUE = "aipm.v2.rescue";
  const SCHEMA = 2;

  // Old per-module keys. Kept on disk after migration, never deleted, because
  // they are the only backup if the migration turns out to be wrong.
  const V1 = {
    labels: "aipm.m1.labels",
    clusters: "aipm.m1.clusters",
    prefs: "aipm.m1.prefs",
    prompt: "aipm.m2.prompt",
    runs: "aipm.m2.runs",
    triage: "aipm.m2.triage"
  };

  function blank() {
    return {
      v: SCHEMA,
      labels: {},        // id -> {verdict, critique, seconds, modes:{modeId:{v,by}}}
      taxonomy: { modes: [], placed: {} },   // placed: traceId -> modeId
      judge: { activeModeId: null, prompt: { role: "", context: "", measure: "", labels: "" }, shots: [] },
      runs: [],
      triage: {},
      split: null,       // {dev:[ids], holdout:[ids]} injected by Claude Code
      appliedStamps: [],
      prefs: { width: 1200, metricDefsOpen: false, briefOpen: {} }
    };
  }

  function rec(state, id) {
    const k = String(id);
    if (!state.labels[k]) state.labels[k] = { verdict: null, critique: "", seconds: 0, modes: {} };
    if (!state.labels[k].modes) state.labels[k].modes = {};
    return state.labels[k];
  }

  function migrate(raw) {
    if (raw) {
      const doc = JSON.parse(raw);
      if (doc && doc.v === SCHEMA) return doc;
    }
    // No v2 document. Build one from whatever v1 keys exist.
    const s = blank();
    let found = false;
    try {
      const oldLabels = JSON.parse(localStorage.getItem(V1.labels) || "null");
      if (oldLabels && typeof oldLabels === "object") {
        found = true;
        Object.keys(oldLabels).forEach(id => {
          const o = oldLabels[id] || {};
          s.labels[String(id)] = {
            verdict: o.verdict || null,
            critique: o.critique || "",
            seconds: o.seconds || 0,
            modes: {}
          };
        });
      }
      const oldClusters = JSON.parse(localStorage.getItem(V1.clusters) || "null");
      if (oldClusters && Array.isArray(oldClusters.buckets)) {
        found = true;
        // Bucket array indexes become stable ids, so a later delete cannot
        // silently relabel traces into a neighbouring category.
        s.taxonomy.modes = oldClusters.buckets.map((b, n) => ({
          id: "m" + (n + 1),
          name: b.name || "",
          definition: b.definition || "",
          example: b.example == null ? null : b.example,
          closestPass: null
        }));
        Object.keys(oldClusters.placed || {}).forEach(traceId => {
          const idx = oldClusters.placed[traceId];
          const mode = s.taxonomy.modes[idx];
          if (mode) {
            s.taxonomy.placed[String(traceId)] = mode.id;
            rec(s, traceId).modes[mode.id] = { v: "fail", by: "cluster" };
          }
        });
      }
      const oldPrompt = JSON.parse(localStorage.getItem(V1.prompt) || "null");
      if (oldPrompt) {
        found = true;
        s.judge.prompt = {
          role: oldPrompt.role || "", context: oldPrompt.context || "",
          measure: oldPrompt.measure || "", labels: oldPrompt.labels || ""
        };
        s.judge.shots = (oldPrompt.shots || []).map(x => ({
          id: x.id, verdict: x.verdict || "fail", critique: x.critique || ""
        }));
      }
      const oldRuns = JSON.parse(localStorage.getItem(V1.runs) || "null");
      if (Array.isArray(oldRuns) && oldRuns.length) { found = true; s.runs = oldRuns; }
      const oldTriage = JSON.parse(localStorage.getItem(V1.triage) || "null");
      if (oldTriage) { found = true; s.triage = oldTriage; }
      const oldPrefs = JSON.parse(localStorage.getItem(V1.prefs) || "null");
      if (oldPrefs && oldPrefs.width) s.prefs.width = oldPrefs.width;
    } catch (e) { /* partial migration is still better than none */ }
    if (found) s.migratedFrom = "v1";
    return s;
  }

  let _cache = null;

  function load() {
    if (_cache) return _cache;
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    try {
      _cache = migrate(raw);
    } catch (e) {
      // Never hand the learner a blank page. Keep the unreadable string so
      // Claude Code can recover it, and say so on screen.
      try { if (raw) localStorage.setItem(RESCUE, raw); } catch (e2) {}
      _cache = blank();
      _cache.rescued = true;
    }
    return _cache;
  }

  // Read, mutate, write. Never write a whole in-memory document back, because a
  // second tab would lose everything it did since this tab loaded.
  function update(fn) {
    let s;
    try { s = migrate(localStorage.getItem(KEY)); }
    catch (e) { s = _cache || blank(); }
    fn(s);
    s.v = SCHEMA;
    s.updatedAt = new Date().toISOString();
    _cache = s;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {
      toast("This browser refused to save. Your work is only in this tab.");
    }
    return s;
  }

  function reload() { _cache = null; return load(); }

  /* selectors */

  const verdictOf = (s, id) => (s.labels[String(id)] || {}).verdict || null;
  const critiqueOf = (s, id) => (s.labels[String(id)] || {}).critique || "";
  const labelledCount = s => Object.values(s.labels).filter(l => l.verdict).length;
  const completeCount = s => Object.values(s.labels).filter(l => l.verdict && (l.critique || "").trim()).length;
  const failures = s => Object.keys(s.labels).filter(id => s.labels[id].verdict === "fail").map(Number).sort((a, b) => a - b);
  const modeById = (s, modeId) => s.taxonomy.modes.find(m => m.id === modeId) || null;
  const tracesInMode = (s, modeId) => Object.keys(s.taxonomy.placed)
    .filter(id => s.taxonomy.placed[id] === modeId).map(Number).sort((a, b) => a - b);

  // The gold label for one trace under one failure mode: "fail", "pass", or
  // null when the learner has not confirmed it yet. Unconfirmed traces are
  // excluded from scoring rather than guessed at.
  function goldFor(s, id, modeId) {
    const m = (s.labels[String(id)] || {}).modes || {};
    return m[modeId] ? m[modeId].v : null;
  }
  function setGold(s, id, modeId, v, by) {
    rec(s, id).modes[modeId] = { v: v, by: by || "me" };
  }
  const devIds = s => (s.split && s.split.dev) ? s.split.dev.slice() : null;
  const isHoldout = (s, id) => !!(s.split && s.split.holdout && s.split.holdout.indexOf(Number(id)) > -1);

  function nextModeId(s) {
    let n = 1;
    const taken = new Set(s.taxonomy.modes.map(m => m.id));
    while (taken.has("m" + n)) n++;
    return "m" + n;
  }

  /* ---------- 3. metrics, each with its wording ---------- */

  const METRICS = {
    labelled: {
      label: "labelled",
      def: "How many of the drafts you have given a verdict and a written reason.",
      formula: "traces with both a verdict and a critique / all traces"
    },
    failrate: {
      label: "fail rate",
      def: "The share of drafts you would not let go out unedited. This is the headline number of module 1.",
      formula: "your fails / all traces you labelled"
    },
    agreement: {
      label: "agreement",
      def: "How often the judge and you said the same thing, counting everything. On its own it flatters a lazy judge, because when failures are rare a judge that passes everything still scores high.",
      formula: "(both said fail + both said pass) / traces scored"
    },
    precision: {
      label: "precision on fail",
      def: "Of the drafts this judge called failures, the share you also called failures. Low precision means it cries wolf and your team stops trusting the flags.",
      formula: "both said fail / everything the judge called fail"
    },
    recall: {
      label: "recall on fail",
      def: "Of the failures you found, the share the judge also caught. Low recall means bad replies slip through while the dashboard looks calm.",
      formula: "both said fail / everything you called fail"
    },
    baserate: {
      label: "always-pass baseline",
      def: "What a judge that answered pass to everything would score on this set. Your agreement has to beat this to mean anything at all.",
      formula: "traces you passed / traces scored"
    },
    nscored: {
      label: "traces scored",
      def: "How many traces the numbers above are computed from, after removing anything used as an example and anything you have not yet judged for this mode.",
      formula: "development traces - few-shot examples - unconfirmed"
    },
    coverage: {
      label: "top modes cover",
      def: "How much of your failure surface the biggest few modes account for. A small number of modes usually explains most failures, and that concentration is what makes the list a roadmap.",
      formula: "traces in the largest modes / all failures"
    }
  };

  const pct = x => (x === null || x === undefined || isNaN(x)) ? "n/a" : Math.round(x * 100) + "%";

  function confusion(rows) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    rows.forEach(r => {
      if (r.gold === "fail" && r.judge === "fail") tp++;
      else if (r.gold === "pass" && r.judge === "fail") fp++;
      else if (r.gold === "pass" && r.judge === "pass") tn++;
      else if (r.gold === "fail" && r.judge === "pass") fn++;
    });
    const n = tp + fp + tn + fn;
    return {
      tp: tp, fp: fp, tn: tn, fn: fn, n: n,
      agreement: n ? (tp + tn) / n : null,
      precision: (tp + fp) ? tp / (tp + fp) : null,
      recall: (tp + fn) ? tp / (tp + fn) : null,
      baserate: n ? (tn + fp) / n : null
    };
  }

  // A metric tile with its definition one click away, inline rather than on
  // hover, because hover does not exist on touch and cannot be tabbed to.
  function metricTile(key, value) {
    const m = METRICS[key];
    if (!m) return "";
    return `<div class="aipm-metric" data-metric="${key}">
      <b>${esc(value)}</b>
      <span>${esc(m.label)} <button class="aipm-why" data-why="${key}" title="what this means" aria-label="what ${esc(m.label)} means">?</button></span>
    </div>`;
  }

  function metricRow(pairs) {
    const s = load();
    const defs = pairs.map(p => {
      const m = METRICS[p[0]];
      return `<div class="aipm-def" data-def="${p[0]}"><b>${esc(m.label)}</b> ${esc(m.def)}<br><i>${esc(m.formula)}</i></div>`;
    }).join("");
    return `<div class="aipm-metrics">${pairs.map(p => metricTile(p[0], p[1])).join("")}</div>
      <div class="aipm-defs${s.prefs.metricDefsOpen ? " on" : ""}">${defs}</div>`;
  }

  function wireMetrics(root) {
    (root || document).querySelectorAll("[data-why]").forEach(b => {
      b.onclick = e => {
        e.preventDefault();
        const box = b.closest(".aipm-metrics").nextElementSibling;
        const open = box.classList.toggle("on");
        update(s => { s.prefs.metricDefsOpen = open; });
      };
    });
  }

  /* ---------- 4. the handoff to Claude Code ---------- */

  const TAG = "AIPM-HANDOFF v1";
  const END = "AIPM-END";

  // Payloads carry trace ids, never trace text. Claude Code is running inside
  // the repo and already has data/session1_bot_replies.json.
  function payload(app, kind, body) {
    const n = body.n != null ? body.n
      : (body.labels ? body.labels.length : (body.modes ? body.modes.length : 0));
    const head = `${TAG} app=${app} kind=${kind} n=${n} ts=${new Date().toISOString()}`;
    return head + "\n" + JSON.stringify(Object.assign({ v: 1, kind: kind }, body)) + "\n" + END;
  }

  function copyText(text, okMessage) {
    const done = () => toast(okMessage || "Copied. Paste it into the chat with Claude Code.");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => legacy(text, done));
    } else {
      legacy(text, done);
    }
  }

  function legacy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) done(); else manual(text);
  }

  // Last resort, and the one that actually saves the day on browsers that
  // refuse clipboard access to a page opened from a file.
  function manual(text) {
    let box = $("#aipm-manual");
    if (!box) {
      box = document.createElement("div");
      box.id = "aipm-manual";
      box.innerHTML = `<div class="aipm-manual-inner">
        <p><b>Your browser blocked the clipboard.</b> The text below is selected. Press Cmd+C (or Ctrl+C), then paste it into the chat with Claude Code.</p>
        <textarea readonly></textarea>
        <p style="text-align:right"><button id="aipm-manual-close">Close</button></p>
      </div>`;
      document.body.appendChild(box);
      $("#aipm-manual-close").onclick = () => { box.className = ""; };
    }
    box.className = "on";
    const ta = box.querySelector("textarea");
    ta.value = text;
    ta.focus();
    ta.select();
  }

  function download(text, name, type) {
    const blob = new Blob([text], { type: type || "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  }

  /* ---------- 5. state Claude Code injected into this page ---------- */

  // Applied once per stamp, so reloading does not keep re-applying an old
  // patch over newer local work. Additive only: a patch may add or fill in,
  // never remove. That rule is enforced here rather than trusted to the writer.
  function applyInjected(injected) {
    if (!injected || !injected.stamp || !injected.patch) return null;
    const s = load();
    if ((s.appliedStamps || []).indexOf(injected.stamp) > -1) return null;
    let what = null;
    update(st => {
      const p = injected.patch;
      if (p.split) { st.split = p.split; what = "the development and held-out split"; }
      if (p.labels) {
        Object.keys(p.labels).forEach(id => {
          const incoming = p.labels[id];
          const cur = rec(st, id);
          if (!cur.verdict && incoming.verdict) cur.verdict = incoming.verdict;
          if (!cur.critique && incoming.critique) cur.critique = incoming.critique;
          if (incoming.modes) Object.keys(incoming.modes).forEach(mid => {
            if (!cur.modes[mid]) cur.modes[mid] = incoming.modes[mid];
          });
        });
        what = "your labels";
      }
      if (p.taxonomy) {
        if (!st.taxonomy.modes.length && p.taxonomy.modes) st.taxonomy.modes = p.taxonomy.modes;
        if (p.taxonomy.placed) Object.keys(p.taxonomy.placed).forEach(id => {
          if (!st.taxonomy.placed[id]) st.taxonomy.placed[id] = p.taxonomy.placed[id];
        });
        what = "your failure modes";
      }
      if (p.run) {
        const dup = st.runs.some(r => r.stamp === injected.stamp);
        if (!dup) { st.runs.push(Object.assign({ stamp: injected.stamp }, p.run)); }
        what = "judge results, round " + (p.run.round || st.runs.length);
      }
      st.appliedStamps = (st.appliedStamps || []).concat([injected.stamp]);
    });
    return what;
  }

  /* ---------- 6. shared chrome ---------- */

  const CSS = `
  #aipm-toast { position: fixed; left: 50%; bottom: 1.4rem; transform: translateX(-50%) translateY(2rem);
    background: CanvasText; color: Canvas; padding: .6rem 1rem; border-radius: 8px; font-size: .9rem;
    opacity: 0; pointer-events: none; transition: opacity .18s, transform .18s; z-index: 50; max-width: 90vw; }
  #aipm-toast.on { opacity: 1; transform: translateX(-50%) translateY(0); }
  #aipm-manual { position: fixed; inset: 0; background: #0009; display: none; align-items: center;
    justify-content: center; z-index: 60; padding: 1rem; }
  #aipm-manual.on { display: flex; }
  .aipm-manual-inner { background: Canvas; border-radius: 12px; padding: 1rem; max-width: 640px; width: 100%; }
  .aipm-manual-inner textarea { width: 100%; min-height: 9rem; font: inherit; font-size: .8rem; }
  .aipm-metrics { display: flex; gap: 1.5rem; flex-wrap: wrap; margin: .9rem 0 .4rem; }
  .aipm-metric b { display: block; font-size: 1.5rem; font-weight: 600; line-height: 1.15; }
  .aipm-metric span { font-size: .78rem; color: #8889; }
  .aipm-why { border: 1px solid #8884; background: transparent; color: inherit; border-radius: 50%;
    width: 1.05rem; height: 1.05rem; line-height: 1; font-size: .7rem; padding: 0; cursor: pointer; opacity: .7; }
  .aipm-why:hover { opacity: 1; }
  .aipm-defs { display: none; border-left: 2px solid #8884; padding: .2rem 0 .2rem .7rem; margin-bottom: .9rem; }
  .aipm-defs.on { display: block; }
  .aipm-def { font-size: .85rem; margin-bottom: .45rem; line-height: 1.5; }
  .aipm-def i { color: #8889; font-size: .95em; }
  #aipm-width { width: 100px; cursor: pointer; }
  .aipm-reload { font-size: .84rem; color: #8889; border-left: 2px solid #8884; padding-left: .7rem; margin: .8rem 0; line-height: 1.5; }
  `;

  function chrome(opts) {
    const s = load();
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    if (!opts || opts.width !== false) {
      const apply = w => document.documentElement.style.setProperty("--aipm-w", w + "px");
      apply(s.prefs.width || 1200);
      const host = $("#aipm-chrome");
      if (host) {
        host.innerHTML = `<label class="aipm-widthwrap" style="display:flex;gap:.4rem;align-items:center;font-size:.82rem;color:#8889">
          width <input type="range" id="aipm-width" min="700" max="2000" step="50" value="${s.prefs.width || 1200}">
        </label>`;
        $("#aipm-width").oninput = e => {
          apply(e.target.value);
          update(st => { st.prefs.width = +e.target.value; });
        };
      }
    }

    if (s.rescued) {
      const b = document.createElement("div");
      b.className = "aipm-reload";
      b.textContent = "Your previous session could not be read. Nothing was deleted. Tell Claude Code and it can recover it.";
      document.body.insertBefore(b, document.body.firstChild);
    }
  }

  function resetDialog() {
    const s = load();
    const parts = [
      ["labels", "your 30 labels and critiques", labelledCount(s) + " labelled"],
      ["taxonomy", "your failure modes", s.taxonomy.modes.length + " modes"],
      ["judge", "your judge prompt, examples, runs and triage", s.runs.length + " runs"]
    ];
    const lines = parts.map(p => `  ${p[1]} (${p[2]})`).join("\n");
    if (!confirm("Start over will delete:\n\n" + lines + "\n\nThis cannot be undone. Copy your state first if you are unsure.\n\nContinue?")) return false;
    update(st => {
      st.labels = {};
      st.taxonomy = { modes: [], placed: {} };
      st.judge = { activeModeId: null, prompt: { role: "", context: "", measure: "", labels: "" }, shots: [] };
      st.runs = []; st.triage = {}; st.split = null; st.appliedStamps = [];
    });
    return true;
  }

  /* ---------- 7. self-test ---------- */

  function selftest(DATA) {
    const results = [];
    const ok = (name, cond) => results.push({ name: name, pass: !!cond });

    const s = blank();
    setGold(s, 2, "m1", "fail", "cluster");
    setGold(s, 19, "m1", "pass", "me");
    ok("goldFor returns fail", goldFor(s, 2, "m1") === "fail");
    ok("goldFor returns pass", goldFor(s, 19, "m1") === "pass");
    ok("goldFor returns null when unconfirmed", goldFor(s, 5, "m1") === null);
    ok("goldFor is per mode", goldFor(s, 2, "m2") === null);

    const c = confusion([
      { gold: "fail", judge: "fail" }, { gold: "fail", judge: "fail" },
      { gold: "pass", judge: "fail" }, { gold: "pass", judge: "pass" },
      { gold: "fail", judge: "pass" }
    ]);
    ok("confusion counts", c.tp === 2 && c.fp === 1 && c.tn === 1 && c.fn === 1);
    ok("precision", Math.abs(c.precision - 2 / 3) < 1e-9);
    ok("recall", Math.abs(c.recall - 2 / 3) < 1e-9);
    ok("agreement", Math.abs(c.agreement - 3 / 5) < 1e-9);
    ok("baserate", Math.abs(c.baserate - 2 / 5) < 1e-9);

    const p = payload("selftest", "labels", { labels: [{ id: 1, verdict: "pass", critique: "x" }] });
    const head = p.split("\n")[0];
    const body = JSON.parse(p.split("\n")[1]);
    ok("payload tag", head.indexOf(TAG) === 0 && head.indexOf("kind=labels") > -1 && head.indexOf("n=1") > -1);
    ok("payload terminator", p.trim().slice(-END.length) === END);
    ok("payload round trip", body.labels[0].id === 1 && body.kind === "labels");
    ok("payload carries no trace text", p.indexOf("bot_reply") === -1 && p.indexOf("customer") === -1);

    // Migration from the v1 keys, using the real shapes those keys held.
    const v1labels = { "1": { verdict: "pass", critique: "fine", seconds: 12 }, "2": { verdict: "fail", critique: "invented a cause", seconds: 20 } };
    const v1clusters = { buckets: [{ name: "A", definition: "d", example: 2 }, { name: "B", definition: "", example: null }], placed: { "2": 0 } };
    const stash = {};
    [V1.labels, V1.clusters].forEach(k => { stash[k] = localStorage.getItem(k); });
    const prevDoc = localStorage.getItem(KEY);
    try {
      localStorage.removeItem(KEY);
      localStorage.setItem(V1.labels, JSON.stringify(v1labels));
      localStorage.setItem(V1.clusters, JSON.stringify(v1clusters));
      const m = migrate(null);
      ok("migration brings labels", m.labels["2"].critique === "invented a cause");
      ok("migration gives stable mode ids", m.taxonomy.modes[0].id === "m1" && m.taxonomy.modes[1].id === "m2");
      ok("migration maps placed to a mode id", m.taxonomy.placed["2"] === "m1");
      ok("migration seeds per-mode gold from clustering", goldFor(m, 2, "m1") === "fail" && m.labels["2"].modes.m1.by === "cluster");
      ok("migration keeps the old keys", localStorage.getItem(V1.labels) !== null);
    } finally {
      Object.keys(stash).forEach(k => { if (stash[k] === null) localStorage.removeItem(k); else localStorage.setItem(k, stash[k]); });
      if (prevDoc === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, prevDoc);
      _cache = null;
    }

    // Injection: applied once, and never destructive.
    const prev2 = localStorage.getItem(KEY);
    try {
      _cache = null;
      update(st => { st.labels = {}; st.appliedStamps = []; rec(st, 1).verdict = "fail"; rec(st, 1).critique = "mine"; });
      const inj = { stamp: "TEST-1", patch: { labels: { "1": { verdict: "pass", critique: "theirs" } }, split: { dev: [1], holdout: [2] } } };
      applyInjected(inj);
      const after = reload();
      ok("injection does not overwrite my verdict", after.labels["1"].verdict === "fail");
      ok("injection does not overwrite my critique", after.labels["1"].critique === "mine");
      ok("injection applies the split", after.split && after.split.dev[0] === 1);
      const before = reload().appliedStamps.length;
      applyInjected(inj);
      ok("injection is applied once only", reload().appliedStamps.length === before);
    } finally {
      if (prev2 === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, prev2);
      _cache = null;
    }

    if (DATA) ok("trace data is embedded", Array.isArray(DATA) && DATA.length > 0);

    const failed = results.filter(r => !r.pass);
    const box = document.createElement("pre");
    box.id = "selftest";
    box.style.cssText = "padding:1rem;font-size:.85rem;white-space:pre-wrap";
    box.textContent = (failed.length ? "SELFTEST FAILED " : "SELFTEST OK ")
      + (results.length - failed.length) + "/" + results.length
      + (failed.length ? "\n" + failed.map(f => "  FAIL " + f.name).join("\n") : "");
    document.body.innerHTML = "";
    document.body.appendChild(box);
    return failed.length === 0;
  }

  return {
    $: $, $$: $$, esc: esc, toast: toast,
    KEY: KEY, blank: blank, migrate: migrate, load: load, update: update, reload: reload, rec: rec,
    verdictOf: verdictOf, critiqueOf: critiqueOf, labelledCount: labelledCount, completeCount: completeCount,
    failures: failures, modeById: modeById, tracesInMode: tracesInMode,
    goldFor: goldFor, setGold: setGold, devIds: devIds, isHoldout: isHoldout, nextModeId: nextModeId,
    METRICS: METRICS, pct: pct, confusion: confusion, metricRow: metricRow, wireMetrics: wireMetrics,
    payload: payload, copyText: copyText, download: download, manual: manual,
    applyInjected: applyInjected, chrome: chrome, resetDialog: resetDialog, selftest: selftest
  };
})();
