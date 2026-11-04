const deck = document.getElementById("deck");
    const slides = [...deck.querySelectorAll(".slide")];
    const bars = document.getElementById("bars");
    const count = document.getElementById("count");
    const notes = document.getElementById("notes");
    const help = document.getElementById("help");
    const overview = document.getElementById("overview");
    const overviewGrid = document.getElementById("overview-grid");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;

    const ACTIVE = 48;
    const DECAY = 0.62;
    const MIN = 6;

    function barWidth(distance) {
      return Math.max(MIN, Math.round(ACTIVE * Math.pow(DECAY, distance)));
    }
    function barOpacity(distance) {
      return distance === 0 ? 1 : Math.max(0.12, 0.32 * Math.pow(0.78, distance - 1));
    }

    slides.forEach((slide, idx) => {
      const word = slide.dataset.word || String(idx + 1);
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = "<i></i><span></span>";
      b.querySelector("span").textContent = word;
      b.setAttribute("aria-label", "Slide " + (idx + 1) + ", " + word);
      b.addEventListener("click", () => go(idx));
      bars.appendChild(b);

      const o = document.createElement("button");
      o.type = "button";
      o.innerHTML = "<small>" + String(idx + 1).padStart(2, "0") + "</small><span>" + word + "</span>";
      o.addEventListener("click", () => { hide(overview); go(idx); });
      overviewGrid.appendChild(o);
    });

    const barButtons = [...bars.children];
    const overviewButtons = [...overviewGrid.children];

    function pad(n) { return String(n).padStart(2, "0"); }

    function go(next) {
      const clamped = Math.max(0, Math.min(slides.length - 1, next));
      i = clamped;
      slides.forEach((s, idx) => s.classList.toggle("is-on", idx === i));
      barButtons.forEach((b, idx) => {
        const d = Math.abs(idx - i);
        b.classList.toggle("is-on", idx === i);
        const bar = b.querySelector("i");
        bar.style.width = barWidth(d) + "px";
        if (idx !== i) bar.style.opacity = String(barOpacity(d));
        else bar.style.opacity = "1";
      });
      overviewButtons.forEach((b, idx) => b.classList.toggle("is-on", idx === i));
      count.textContent = pad(i + 1) + " / " + pad(slides.length);
      notes.textContent = slides[i].dataset.notes || "";
      history.replaceState(null, "", "#" + (i + 1));
      slides[i].scrollTop = 0;
    }

    function show(el) { el.hidden = false; el.classList.add("is-on"); }
    function hide(el) { el.classList.remove("is-on"); el.hidden = true; }
    function toggle(el) { if (el.classList.contains("is-on")) hide(el); else show(el); }

    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const overlay = help.classList.contains("is-on") || overview.classList.contains("is-on");
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) { e.preventDefault(); hide(overview); toggle(help); return; }
      if (e.key === "Escape") {
        if (help.classList.contains("is-on")) { hide(help); return; }
        toggle(overview);
        return;
      }
      if (e.key === "o" || e.key === "O") { e.preventDefault(); hide(help); toggle(overview); return; }
      if (overlay && !["ArrowRight", "ArrowLeft", " ", "Home", "End"].includes(e.key)) return;
      if (e.key === "n" || e.key === "N") { notes.classList.toggle("is-on"); return; }
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown" || e.key === "j") { e.preventDefault(); hide(help); hide(overview); go(i + 1); }
      if (e.key === "ArrowLeft" || e.key === "Backspace" || e.key === "PageUp" || e.key === "k") { e.preventDefault(); hide(help); hide(overview); go(i - 1); }
      if (e.key === "Home") { e.preventDefault(); go(0); }
      if (e.key === "End") { e.preventDefault(); go(slides.length - 1); }
      if (/^[1-9]$/.test(e.key)) go(Number(e.key) - 1);
    }

    let touchX = 0;
    deck.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    deck.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) < 48) return;
      go(i + (dx < 0 ? 1 : -1));
    });

    document.getElementById("prev").addEventListener("click", (e) => { e.stopPropagation(); go(i - 1); });
    document.getElementById("next").addEventListener("click", (e) => { e.stopPropagation(); go(i + 1); });

    document.addEventListener("click", (e) => {
      if (e.target.closest("button, a, .bars, .help, .overview, .top, .foot, .notes, .stepper")) return;
      if (help.classList.contains("is-on")) { hide(help); return; }
      if (overview.classList.contains("is-on")) { hide(overview); return; }
      if (window.matchMedia("(max-width: 720px)").matches) return;
      const x = e.clientX / window.innerWidth;
      go(i + (x < 0.22 ? -1 : 1));
    });

    document.addEventListener("keydown", onKey);

    help.addEventListener("click", (e) => { if (e.target === help) hide(help); });
    overview.addEventListener("click", (e) => { if (e.target === overview) hide(overview); });

    const fromHash = Number(location.hash.replace("#", "")) - 1;
    go(Number.isFinite(fromHash) && fromHash >= 0 ? fromHash : 0);
    deck.focus();
