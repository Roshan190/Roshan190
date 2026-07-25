/**
 * Life at DEPT® — scroll-linked image grid
 *
 * Recreated from the live deptagency.com culture page implementation
 * (webpack module `heading-text-image/assets/index.js`).
 *
 * Library: Motion (formerly Motion One) — same API the site uses:
 *   scroll(animate(el, { transform, gap }), { target, offset })
 *
 * Grid density (from site breakpoints helper):
 *   mobile / tablet  → 10 rows × 8 cols
 *   desktop+         →  5 rows × 15 cols
 *
 * Scroll animation (exact site values):
 *   transform: scale(1) → scale(3)
 *   gap: 0.2rem → 0.4rem
 *   offset: ["1 0", "0 1.5"]
 */

(() => {
  "use strict";

  const { animate, scroll } = window.Motion;

  /** Breakpoints from site config: {"mobile":767,"tablet":991,...} */
  const BREAKPOINTS = {
    mobile: 767,
    tablet: 991,
    desktop: 1199,
    large: 1200,
    "very-large": 1439,
    "extra-large": 1800,
  };

  /** matchMedia map mirroring the site's `hZ` helper */
  const MEDIA_QUERIES = {
    mobile: `(max-width: ${BREAKPOINTS.mobile / 16}em)`,
    tablet: `(min-width: ${(BREAKPOINTS.mobile + 1) / 16}em) and (max-width: ${BREAKPOINTS.tablet / 16}em)`,
    desktop: `(min-width: ${(BREAKPOINTS.tablet + 1) / 16}em) and (max-width: ${BREAKPOINTS.desktop / 16}em)`,
    large: `(min-width: ${(BREAKPOINTS.desktop + 1) / 16}em) and (max-width: ${BREAKPOINTS["extra-large"] / 16}em)`,
    veryLarge: `(min-width: ${(BREAKPOINTS["very-large"] + 1) / 16}em) and (max-width: ${BREAKPOINTS["extra-large"] / 16}em)`,
    extraLarge: `(min-width: ${(BREAKPOINTS["extra-large"] + 1) / 16}em)`,
  };

  const BLOCK_SELECTOR = ".js-block-heading-text-image";

  /**
   * Create a single grid image element.
   * @param {{ url: string }} item
   * @param {string} itemClass
   * @returns {HTMLImageElement}
   */
  function createImage(item, itemClass) {
    const img = document.createElement("img");
    img.src = item?.url ?? "";
    img.alt = "";
    img.decoding = "async";
    // No loading="lazy" — original creates imgs without it; the zoomed
    // grid needs cells ready as soon as they enter the overflow clip.
    if (itemClass) img.classList.add(itemClass);
    return img;
  }

  /**
   * Fill the grid by cycling through data-items until rows × cols is reached.
   * Matches site helper `j(rows, cols, items, itemClass, wrap)`.
   * @param {number} rows
   * @param {number} cols
   * @param {Array<{ url: string }>} items
   * @param {string} itemClass
   * @param {HTMLElement} wrap
   */
  function populateGrid(rows, cols, items, itemClass, wrap) {
    const total = rows * cols;
    let keys = Object.keys(items);
    wrap.innerHTML = "";

    for (let i = 0; i < total; ) {
      if (keys.length === 0) {
        keys = Object.keys(items);
      }
      const key = keys.shift();
      wrap.appendChild(createImage(items[key], itemClass));
      i += 1;
    }
  }

  /**
   * Subscribe to viewport breakpoint changes (site `hZ` equivalent).
   * @param {(name: string) => void} callback
   * @param {boolean} [fireImmediately=true]
   */
  function onBreakpoint(callback, fireImmediately = true) {
    Object.entries(MEDIA_QUERIES).forEach(([name, query]) => {
      const mql = window.matchMedia(query);
      if (fireImmediately && mql.matches) {
        callback(name);
      }
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", (event) => {
          if (event.matches) callback(name);
        });
      }
    });
  }

  /**
   * Resolve rows/cols for a breakpoint name.
   * Site defaults: 5 × 15; mobile & tablet: 10 × 8.
   * @param {string} name
   * @returns {{ rows: number, cols: number }}
   */
  function gridConfigForBreakpoint(name) {
    if (name === "mobile" || name === "tablet") {
      return { rows: 10, cols: 8 };
    }
    return { rows: 5, cols: 15 };
  }

  /**
   * Initialize one `.js-block-heading-text-image` instance.
   * @param {HTMLElement} block
   */
  function initBlock(block) {
    const media = block.querySelector(`${BLOCK_SELECTOR}-grid-media`);
    if (!media?.dataset?.items) return;

    let items;
    try {
      items = JSON.parse(media.dataset.items);
    } catch {
      return;
    }
    if (!items?.length) return;

    const itemClass = media.dataset.itemClass;
    const wrap = media.querySelector(
      `${BLOCK_SELECTOR}-grid-media-wrap`
    );
    if (!wrap) return;

    // Rebuild image cells whenever the active breakpoint band changes.
    onBreakpoint((name) => {
      const { rows, cols } = gridConfigForBreakpoint(name);
      populateGrid(rows, cols, items, itemClass, wrap);
    });

    // Prefer-reduced-motion: keep the static grid, skip scroll zoom.
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !animate || !scroll) return;

    /**
     * Exact Motion call from the production bundle:
     * scroll(
     *   animate(wrap, {
     *     transform: ["scale(1)", "scale(3)"],
     *     gap: ["0.2rem", "0.4rem"],
     *   }),
     *   { target: block, offset: ["1 0", "0 1.5"] }
     * )
     *
     * Progress 0 → scale(1) / gap 0.2rem
     * Progress 1 → scale(3) / gap 0.4rem
     * Offset "1 0": bottom of block meets top of viewport
     * Offset "0 1.5": top of block meets 1.5× viewport height
     */
    scroll(
      animate(
        wrap,
        {
          transform: ["scale(1)", "scale(3)"],
          gap: ["0.2rem", "0.4rem"],
        },
        { ease: "linear" }
      ),
      {
        target: block,
        offset: ["1 0", "0 1.5"],
      }
    );
  }

  function init() {
    document.querySelectorAll(BLOCK_SELECTOR).forEach(initBlock);
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
