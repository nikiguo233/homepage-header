/** Drives --scroll-progress and data-compact on `.sticky-header` (pairs with styles.css). */
export function initStickyHeaderScroll(): void {
  const found = document.querySelector<HTMLElement>(".sticky-header");
  if (!found) return;
  const header = found;

  const RANGE = 120;
  const SMOOTH = 0.22;
  const EPS = 0.001;
  const COMPACT_AT = 0.32;

  let smoothP = 0;
  let rafId: number | null = null;
  let lastCompactStr: string | null = null;
  let rehomeClearTimer: ReturnType<typeof setTimeout> | null = null;

  function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Scroll distance that drives the header — window and any overflow ancestors (embeds / Figma often scroll a div, not the document). */
  function scrollDepth(): number {
    let y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    for (let n = header.parentElement; n; n = n.parentElement) {
      const { overflowY } = window.getComputedStyle(n);
      if (/^(auto|scroll|overlay)$/.test(overflowY) && n.scrollHeight > n.clientHeight + 1) {
        y = Math.max(y, n.scrollTop);
      }
    }
    return y;
  }

  function targetProgress(): number {
    const y = scrollDepth();
    if (prefersReducedMotion()) {
      return y > 24 ? 1 : 0;
    }
    return Math.min(1, Math.max(0, y / RANGE));
  }

  function applyLayout(p: number): void {
    header.style.setProperty("--scroll-progress", String(p));
    const compactStr = p >= COMPACT_AT ? "true" : "false";
    const compactToggled =
      lastCompactStr !== null && lastCompactStr !== compactStr && !prefersReducedMotion();

    if (compactToggled) {
      header.dataset.compact = compactStr;
      header.dataset.iconRehome = compactStr === "true" ? "to-compact" : "to-hero";
      header.classList.remove("sticky-header--icons-rehome");
      void header.offsetWidth;
      header.classList.add("sticky-header--icons-rehome");
      if (rehomeClearTimer != null) window.clearTimeout(rehomeClearTimer);
      rehomeClearTimer = window.setTimeout(() => {
        header.classList.remove("sticky-header--icons-rehome");
        delete header.dataset.iconRehome;
      }, 480);
    } else {
      header.dataset.compact = compactStr;
    }

    lastCompactStr = compactStr;
  }

  function frame(): void {
    const target = targetProgress();
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

  function kick(): void {
    if (rafId == null) {
      rafId = requestAnimationFrame(frame);
    }
  }

  /* capture: scroll does not bubble; nested scrollports still dispatch through capture on window */
  window.addEventListener("scroll", kick, { passive: true, capture: true });
  window.addEventListener("resize", kick, { passive: true });

  smoothP = targetProgress();
  applyLayout(smoothP);
  kick();
}
