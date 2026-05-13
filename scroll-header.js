(function () {
  var header = document.querySelector(".sticky-header");
  if (!header) return;

  /** Scroll distance (px) for --scroll-progress to reach 1 */
  var RANGE = 120;
  var SMOOTH = 0.22;
  var EPS = 0.001;
  /** When true, one horizontal row: title | search+icons (synced with visual morph) */
  var COMPACT_AT = 0.32;

  var smoothP = 0;
  var rafId = null;
  var lastCompactStr = null;
  var rehomeClearTimer = null;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function targetProgress() {
    var y = window.scrollY || window.pageYOffset;
    if (prefersReducedMotion()) {
      return y > 24 ? 1 : 0;
    }
    return Math.min(1, Math.max(0, y / RANGE));
  }

  function applyLayout(p) {
    header.style.setProperty("--scroll-progress", String(p));
    var compactStr = p >= COMPACT_AT ? "true" : "false";
    if (lastCompactStr !== null && lastCompactStr !== compactStr && !prefersReducedMotion()) {
      header.dataset.iconRehome = compactStr === "true" ? "to-compact" : "to-hero";
      header.classList.remove("sticky-header--icons-rehome");
      void header.offsetWidth;
      header.classList.add("sticky-header--icons-rehome");
      window.clearTimeout(rehomeClearTimer);
      rehomeClearTimer = window.setTimeout(function () {
        header.classList.remove("sticky-header--icons-rehome");
        delete header.dataset.iconRehome;
      }, 480);
    }
    lastCompactStr = compactStr;
    header.dataset.compact = compactStr;
  }

  function frame() {
    var target = targetProgress();
    smoothP += (target - smoothP) * SMOOTH;
    if (Math.abs(target - smoothP) < EPS) {
      smoothP = target;
    }
    applyLayout(smoothP);

    if (Math.abs(target - smoothP) > EPS) {
      rafId = requestAnimationFrame(frame);
    } else {
      rafId = null;
    }
  }

  function kick() {
    if (!rafId) {
      rafId = requestAnimationFrame(frame);
    }
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });

  smoothP = targetProgress();
  applyLayout(smoothP);
  kick();
})();
