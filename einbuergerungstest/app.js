(() => {
  const QUESTIONS = window.QUESTIONS || [];
  const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
  const LETTERS = ["A", "B", "C", "D"];
  const PDF_URL = "https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile";
  const STORE = { progress: "lid.progress.v1", settings: "lid.settings.v1", deck: "lid.deck.v1" };
  const DEFAULTS = { set: "all", status: "all", topic: "all", order: "seq" };

  const $ = (id) => document.getElementById(id);
  const el = {
    card: $("card"), qnum: $("qnum"), qtopic: $("qtopic"), question: $("question"), questionZh: $("question-zh"),
    picture: $("picture"), options: $("options"), empty: $("empty"), position: $("position"), badge: $("badge"),
    bar: $("progress-bar"), prev: $("prev-btn"), next: $("next-btn"), known: $("known-btn"), learning: $("learning-btn"),
    settingsBtn: $("settings-btn"), settings: $("settings"), topic: $("topic"), stats: $("stats"),
    reset: $("reset-btn"), jumpForm: $("jump-form"), jump: $("jump"),
  };

  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: keep in memory */ }
  };

  let progress = load(STORE.progress, {});
  let settings = { ...DEFAULTS, ...load(STORE.settings, {}) };
  let deck = [];
  let pos = 0;
  let revealed = false;
  let picked = null;

  // ---------- deck ----------
  function matches(q) {
    if (settings.set !== "all" && q.set !== settings.set) return false;
    if (settings.topic !== "all" && q.topic !== settings.topic) return false;
    const s = progress[q.id];
    if (settings.status === "todo") return s !== "known";
    if (settings.status === "learning") return s === "learning";
    if (settings.status === "known") return s === "known";
    return true;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildDeck(keepId) {
    deck = QUESTIONS.filter(matches).map((q) => q.id);
    if (settings.order === "shuffle") shuffle(deck);
    const i = keepId ? deck.indexOf(keepId) : -1;
    pos = i >= 0 ? i : 0;
    persistDeck();
  }

  function persistDeck() {
    save(STORE.deck, { settings, deck, pos });
  }

  function restoreDeck() {
    const saved = load(STORE.deck, null);
    const sameSettings = saved && JSON.stringify(saved.settings) === JSON.stringify(settings);
    if (sameSettings && Array.isArray(saved.deck) && saved.deck.every((id) => BY_ID.has(id))) {
      deck = saved.deck;
      pos = Math.min(Math.max(saved.pos | 0, 0), Math.max(deck.length - 1, 0));
    } else {
      buildDeck();
    }
  }

  // ---------- render ----------
  function render() {
    const q = BY_ID.get(deck[pos]);
    el.card.hidden = !q;
    el.empty.hidden = !!q;
    [el.prev, el.next, el.known, el.learning].forEach((b) => (b.disabled = !q));
    renderStats();
    if (!q) {
      el.position.textContent = "0 / 0";
      el.badge.hidden = true;
      el.bar.style.width = "0";
      return;
    }

    el.card.classList.toggle("revealed", revealed);
    el.qnum.textContent = q.set === "B" ? `Berlin ${q.n}` : `Frage ${q.n}`;
    el.qtopic.textContent = q.topic;
    el.question.textContent = q.q;
    el.questionZh.textContent = q.qz;

    if (q.pic) {
      el.picture.hidden = false;
      el.picture.innerHTML = "";
      const note = document.createElement("div");
      note.append("📷 圖片題：圖在官方題庫 PDF 第 " + q.pic + " 頁 · ");
      const link = document.createElement("a");
      link.href = `${PDF_URL}#page=${q.pic}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "開啟 PDF";
      link.addEventListener("click", (e) => e.stopPropagation());
      note.append(link);
      const hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = "💡 " + q.hint;
      el.picture.append(note, hint);
    } else {
      el.picture.hidden = true;
    }

    el.options.innerHTML = "";
    q.o.forEach(([de, zh], i) => {
      const li = document.createElement("li");
      li.className = "option" + (i === q.a ? " correct" : "") + (i === picked ? " picked" : "");
      li.dataset.index = i;
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = revealed && i === q.a ? "✓" : revealed && i === picked ? "✗" : LETTERS[i];
      const text = document.createElement("div");
      const deEl = document.createElement("div");
      deEl.className = "de";
      deEl.textContent = de;
      const zhEl = document.createElement("div");
      zhEl.className = "zh";
      zhEl.lang = "zh-Hant";
      zhEl.textContent = zh && zh !== de ? zh : "";
      text.append(deEl, zhEl);
      li.append(letter, text);
      el.options.append(li);
    });

    el.position.textContent = `${pos + 1} / ${deck.length}`;
    el.bar.style.width = `${((pos + 1) / deck.length) * 100}%`;
    const s = progress[q.id];
    el.badge.hidden = !s;
    el.badge.className = "badge " + (s || "");
    el.badge.textContent = s === "known" ? "✓ 已熟" : s === "learning" ? "✗ 不熟" : "";
  }

  function renderStats() {
    const values = Object.values(progress);
    const known = values.filter((v) => v === "known").length;
    const learning = values.filter((v) => v === "learning").length;
    el.stats.innerHTML = `已熟 <b>${known}</b> · 不熟 <b>${learning}</b> · 未看 <b>${QUESTIONS.length - known - learning}</b>`;
  }

  function renderSettings() {
    document.querySelectorAll(".seg").forEach((seg) => {
      seg.querySelectorAll("button").forEach((b) => b.classList.toggle("on", settings[seg.dataset.key] === b.dataset.val));
    });
    const pool = QUESTIONS.filter((q) => settings.set === "all" || q.set === settings.set);
    const counts = new Map();
    pool.forEach((q) => counts.set(q.topic, (counts.get(q.topic) || 0) + 1));
    if (settings.topic !== "all" && !counts.has(settings.topic)) settings.topic = "all";
    el.topic.innerHTML = "";
    el.topic.append(new Option(`全部主題（${pool.length}）`, "all"));
    [...counts].sort((a, b) => b[1] - a[1]).forEach(([t, n]) => el.topic.append(new Option(`${t}（${n}）`, t)));
    el.topic.value = settings.topic;
  }

  // ---------- actions ----------
  function go(delta) {
    if (!deck.length) return;
    const nextPos = pos + delta;
    if (nextPos < 0 || nextPos >= deck.length) {
      toast(nextPos < 0 ? "已經是第一題" : "這一輪結束了 🎉");
      return;
    }
    const cls = delta > 0 ? "slide-left" : "slide-right";
    el.card.classList.add(cls);
    setTimeout(() => {
      pos = nextPos;
      revealed = false;
      picked = null;
      persistDeck();
      render();
      el.card.classList.remove(cls);
    }, 140);
  }

  function mark(status) {
    const id = deck[pos];
    if (!id) return;
    progress[id] = status;
    save(STORE.progress, progress);
    if (pos < deck.length - 1) go(1);
    else { render(); toast("這一輪結束了 🎉"); }
  }

  function flip(optionIndex) {
    if (!revealed && optionIndex != null) picked = optionIndex;
    revealed = !revealed;
    if (!revealed) picked = null;
    render();
  }

  function applySettings(patch) {
    const keepId = deck[pos];
    settings = { ...settings, ...patch };
    renderSettings();
    save(STORE.settings, settings);
    buildDeck(settings.order === "shuffle" ? null : keepId);
    revealed = false;
    picked = null;
    render();
  }

  let toastTimer;
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.lang = "zh-Hant";
      document.body.append(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

  // ---------- events ----------
  let swiped = false;
  el.card.addEventListener("click", (e) => {
    if (swiped) { swiped = false; return; }
    const opt = e.target.closest(".option");
    flip(opt ? Number(opt.dataset.index) : null);
  });

  let touch = null;
  el.card.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touch = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  el.card.addEventListener("touchend", (e) => {
    if (!touch) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped = true;
      setTimeout(() => (swiped = false), 400);
      go(dx < 0 ? 1 : -1);
    }
  });

  el.prev.addEventListener("click", () => go(-1));
  el.next.addEventListener("click", () => go(1));
  el.known.addEventListener("click", () => mark("known"));
  el.learning.addEventListener("click", () => mark("learning"));

  el.settingsBtn.addEventListener("click", () => {
    const open = el.settings.hidden;
    el.settings.hidden = !open;
    el.settingsBtn.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".seg").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) applySettings({ [seg.dataset.key]: b.dataset.val });
    });
  });
  el.topic.addEventListener("change", () => applySettings({ topic: el.topic.value }));

  el.jumpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const n = parseInt(el.jump.value, 10);
    if (!n) return;
    const inDeck = deck.findIndex((id) => BY_ID.get(id).n === n && (settings.set !== "all" || BY_ID.get(id).set === "N"));
    if (inDeck >= 0) {
      pos = inDeck;
    } else {
      const target = settings.set === "B" ? `B${n}` : `N${n}`;
      if (!BY_ID.has(target)) { toast("沒有這個題號"); return; }
      settings = { ...DEFAULTS, set: settings.set === "B" ? "B" : "all" };
      save(STORE.settings, settings);
      renderSettings();
      buildDeck(target);
    }
    revealed = false;
    picked = null;
    persistDeck();
    render();
    el.jump.value = "";
    el.settings.hidden = true;
    el.settingsBtn.setAttribute("aria-expanded", "false");
  });

  el.reset.addEventListener("click", () => {
    if (!confirm("確定要清除所有「已熟／不熟」紀錄嗎？")) return;
    progress = {};
    save(STORE.progress, progress);
    buildDeck(deck[pos]);
    render();
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, select, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "enter") { e.preventDefault(); flip(null); }
    else if (k === "arrowright") go(1);
    else if (k === "arrowleft") go(-1);
    else if (k === "arrowup" || k === "arrowdown") { e.preventDefault(); mark(k === "arrowup" ? "known" : "learning"); }
    else if (["a", "b", "c", "d"].includes(k)) flip(LETTERS.indexOf(k.toUpperCase()));
    else if (k === "k") mark("known");
    else if (k === "j") mark("learning");
  });

  // ---------- init ----------
  renderSettings();
  restoreDeck();
  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
})();
