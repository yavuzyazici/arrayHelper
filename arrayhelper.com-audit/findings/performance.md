# Performance findings - https://www.arrayhelper.com/

Agent: seo-performance | Date: 2026-10-27 | Scope: `/` (EN), spot-checks `/tr/`, `/ja/` (+ `/ar/ /ko/ /zh/ /hi/ /ru/ /de/` for layout cost)

## Score: 91 / 100 (lab-estimated, no Lighthouse/CrUX)

PageSpeed Insights returned "rate limit exceeded" for both strategies (no API key), and there is no CrUX field data. The
score is therefore my own estimate from Playwright/Chromium lab runs (CDP throttling) and Lighthouse-style weighting,
not a PSI number. Treat all CWV values below as lab data, not Google's ranking input.

Lab profiles
- Mobile: 412x823 @1.75 DPR, CPU 4x slowdown, 1.6 Mbps / 150 ms RTT / 750 kbps up, cache disabled, 3 runs per URL.
- Desktop: 1350x940, no throttling, cache disabled, 3 runs per URL.

## Measured metrics

| URL | Profile | FCP = LCP | CLS | TBT (after FCP) | TTFB | Requests | First-party bytes |
|---|---|---|---|---|---|---|---|
| `/` | mobile 4x | 1.02 - 1.42 s (LCP element: `<h1>` text) | 0.000 | 237 - 314 ms (100% GA4) | 219 - 317 ms | 16 | ~50 KB |
| `/tr/` | mobile 4x | 1.06 - 1.12 s | 0.000 | 233 - 261 ms | 161 - 242 ms | 16 | ~51 KB |
| `/ja/` | mobile 4x | 1.85 - 2.01 s | 0.000 | 240 - 300 ms | 246 - 264 ms | 16 | ~51 KB |
| `/ar/` | mobile 4x | 1.98 - 2.18 s | 0 | n/m | n/m | | |
| `/`, `/tr/`, `/ja/` | desktop | 0.41 - 0.62 s | 0.000 | 0 ms | 149 - 270 ms | | |

- CWV status (lab): LCP pass, CLS pass (0, also 0 after a full-page scroll), INP pass on first-party code (worst
  first-party event 32 ms), with one GA4-induced exception (240 ms, see M1).
- DOM size 444 elements (limit ~1,500). HTML 49 KB decoded / 9.4 KB Brotli. app.css 26 KB / 6.0 KB Brotli. main.js 14.5 KB / 4.9 KB Brotli.
- Server: TTFB ~0.20-0.25 s total from this vantage (DNS 4-16 ms, TCP 80 ms, TLS 155 ms; server think time ~65 ms). HTTP/2 + HTTP/3 (alt-svc) on assets.
- Field data: none available (no CrUX / Google credentials).

## What works well

- LCP is a text node (H1) with no image dependency; the critical path is HTML -> 1 render-blocking stylesheet (6 KB br) + 2 preloaded fonts in parallel (all requested at ~360 ms, finished ~680 ms in the 4x/slow-4G profile).
- `modulepreload` of `/js/main.js?v=<hash>` exactly matches the `<script type="module">` URL; font preloads carry `crossorigin` and match the `@font-face` URLs (one request each, no double fetch). `build.mjs` collapses the 5 source `modulepreload` links into 1 bundle link.
- JS is a single esbuild bundle, 4.9 KB Brotli, deferred (module). No render-blocking JS.
- Hashed assets served `public, max-age=31536000, immutable`; HTML `no-cache, must-revalidate` with working `Last-Modified` 304 revalidation; Brotli active for HTML/CSS/JS/SVG (gzip fallback works); WOFF2/PNG correctly not double-compressed.
- Fonts: `font-display: swap`, two latin subsets only (7.9 KB + 8.0 KB).
- CLS 0: logo has width/height, icons are fixed-size, no late-injected content, no ads/embeds.
- GA4 is deferred (idle callback <=5 s or first interaction), never blocks parse or LCP.
- Converter code (`src/js/core/converter.js`) is genuinely optimised: output capped at 200 K chars, two-phase pass, hidden panels not computed, auto-run limited to 40 lines. Typical typing events are 16-32 ms even at 4x CPU.
- Legacy `m.js`/`l.js` in the repo root are NOT shipped: `build.mjs` only copies `STATIC_ENTRIES`, `/m.js` and `/l.js` return 404 live, and nothing in `src/` references them.

## Findings

### Critical
None.

### High
None.

### Medium

**M1. GA4 (gtag.js) is the entire TBT budget and can push a mobile INP interaction past 200 ms.**
- Evidence: gtag.js = 165,670 B transferred (3.5x the whole first-party payload of 46,924 B). In the 4x profile it produces two long tasks (EvaluateScript 197-256 ms + timer callback 134-165 ms) ~1.2 s after it is requested. With GA blocked: TBT 0 ms. INP-style test (typing 1 line / 120 ms right after click): with GA4 the worst `keydown` was **240 ms** (223 ms input delay), without GA4 the worst event was **32 ms**. On desktop (no throttle) the same tasks are ~50-65 ms (harmless), so this is a low-end-mobile risk.
- Root cause: `loadGtag` is triggered by `pointerdown/keydown/touchstart/scroll` as well as idle, so the script download + 330 ms of execution lands precisely inside the user's first typing/paste burst, the one workflow this tool exists for.
- Fix (`src/page.html`, inline gtag block ~lines 81-107): remove the interaction listeners and load only from `requestIdleCallback` after `load` with a short delay, so evaluation finishes before most users start typing; or load via `scheduler.postTask(..., {priority:'background'})`, or run it off-thread with Partytown, or switch to a lighter first-party-beacon analytics. Re-measure INP with the same typing test.

**M2. First layout of the below-the-fold article is paid before first paint; worst on non-Latin locales (`/ja/`, `/ar/`, `/hi/`, `/zh/`).**
- Evidence (mobile 4x): trace shows a single 354 ms (EN) / 1,133 ms (JA) main-thread task around DOMContentLoaded dominated by `Layout` (309 ms EN, 1,005 ms JA). Baseline LCP: EN 1.09-1.44 s, JA 1.67-2.01 s, **AR 2.14-2.18 s (close to the 2.5 s limit)**. Injecting `.content-section{content-visibility:auto;contain-intrinsic-size:auto 600px}` (no other change) gave EN 0.82-0.87 s, JA 1.27-1.30 s, AR 1.06-1.14 s, and CLS stayed 0 after scrolling the full page. The guide/FAQ/language sections (`.content-section` blocks at `src/page.html` lines ~411-486, plus `.site-footer`) are all below the editor viewport (`.app-shell` fills 100 dvh).
- Fix (`src/styles/globals.css`, near `.content-section` ~line 625): add `content-visibility: auto; contain-intrinsic-size: auto 600px;` to `.content-section` and `.site-footer`. Content stays in the DOM and indexable; verify `#guide/#faq` anchor jumps and CLS after the change.

**M3. Large paste freezes the main thread: one `<div>` per line number (up to 50,000 DOM nodes).**
- Evidence (mobile 4x, classic editor, GA blocked): pasting 100 / 1,000 / 10,000 / 50,000 lines blocked the page for 104 / 194 / 1,202 / 5,649 ms (auto-run is skipped above 40 lines, so this is almost entirely `updateLineNumbers` DOM creation + layout). The home page promises "Large lists stay fast" and the classic cap is 50,000 lines (`CONFIG.MAX_CLASSIC_LINES`).
- Fix (`src/js/core/editor.js` `updateLineNumbers`, lines ~137-170): render line numbers as a single text node/`<pre>` (`textContent = numbers.join('\n')`) or virtualise to the visible window; move `highlightActiveLine` to class-free CSS or a single highlight element; also consider lowering the classic limit or auto-switching to Ultra sooner than 50,000 lines.

### Low

**L1. Poppins files ship Latin only, but 6 supported locales need Latin-Extended.**
- Evidence: `cmap` check of the preloaded `pxiEyp8kv8JHgFVrJJfecg.woff2` (400) lacks U+011E/011F/015E/015F/0130 (tr), U+0105/0119/0142/... (pl), U+010D/0159/0161/017E (cs, bs), U+0151/0171 (hu), U+0103/0219/021B (ro). Those letters render in a system fallback font mid-word on `/tr/ /pl/ /cs/ /hu/ /ro/ /bs/` (typography inconsistency, fallback-metric differences). The Latin-Extended files already exist in `src/fonts/` (`pxiEyp8kv8JHgFVrJJnecmNE.woff2` = 400, `pxiByp8kv8JHgFVrLEj6Z1JlFc-K.woff2` = 600) but no `@font-face` references them (`src/styles/poppins-wide-selection.css` is unused).
- Fix (`src/styles/globals.css` lines 1-15): add latin-ext `@font-face` rules with the `unicode-range` from `poppins-wide-selection.css`, keep the existing latin faces as-is (with their latin `unicode-range`) so Latin-ext only downloads on those locales. Do not preload them.

**L2. `preconnect` + `dns-prefetch` to `cdn.jsdelivr.net` on every page view.** (`src/page.html` lines 69-70)
- Used only when the optional Ultra (Monaco) editor is opened. Classic users (default) pay an unused TLS handshake each visit. Fix: delete both hints; `prewarmMonaco()` (hover/touch/focus on the settings menu) already warms it on intent, or add the preconnect from JS inside `prewarmMonaco`.

**L3. Monaco (Ultra mode) costs ~883 KB over 4 requests and ~1.2 s of long tasks at 4x.**
- Evidence: clicking Ultra loads 883 KB from jsDelivr (editor.main.js alone 834 KB Brotli) and creates tasks of 565 ms + 681 ms. A returning user whose `localStorage.editorMode === 'ultra'` pays this on every page load (extra ~1.1 s of long tasks, LCP unaffected at 1.04 s). Monaco is pinned to 0.41.0 (2023) with no SRI, loaded through the AMD loader (`src/js/core/editor.js` `MONACO_VS`). `prewarmMonaco()` also fires on `touchstart/pointerenter/focusin` over the settings menu, so a mobile tap on the gear downloads ~0.9 MB.
- Fix: for a persisted `ultra` mode, start Monaco in `requestIdleCallback` after first paint (show the textarea until ready); skip the prewarm on `Save-Data`/slow connections (`navigator.connection`); consider a lighter editor (CodeMirror 6) if only plain text is needed; bump to a current pinned Monaco with SRI.

**L4. `selectionchange` handler walks the whole text to find the caret line (O(n) per event).** (`src/js/core/utils.js` `getCurrentLineIndex`, called from `highlightActiveLine` in `editor.js` ~line 177 and the `selectionchange` listener in `src/js/ui/events.js`)
- Harmless for short lists, adds to jank on 10 K+ line inputs. Fix: cache line starts or count only the delta between the previous and new caret position.

### Info

- **I1. Dead assets deployed**: `STATIC_ENTRIES` in `build.mjs` (line 23) copies the whole `src/images` and `src/fonts` folders. Live today: `Readme Image 1.png` (78 KB), `Readme Image 2.png` (267 KB) and 16 unused font subsets (`/fonts/pxiEyp8kv8JHgFVrJJnecmNE.woff2` returns 200). No user impact, but remove README images from `src/images` (or move to `docs/`) and delete unused font files once L1 is decided.
- **I2. Repo-root `m.js` (3.4 MB, Monaco editor.main) and `l.js` (30 KB, loader.js)** are tracked in git but unreferenced and not deployed (live 404). Safe to delete from the repo.
- **I3. Icons are 9 separate SVG requests** (0.4-1.9 KB each) plus the 3.9 KB logo; HTTP/2 makes this cheap and none is LCP. Inlining the sprite would remove 9 requests (optional). Images/SVGs use `max-age=2592000` (30 days) without hashes, which is an acceptable trade-off.
- **I4. `preload_check.py` suggestions** (Speculation Rules, `fetchpriority=high` on LCP image) are not applicable: LCP is text, and the only internal navigations are language links (low value). bfcache: no `unload`, no `no-store`; could not verify in headless (bfcache disabled by the harness).
- **I5. Outside perf scope, noted for the orchestrator**: `https://arrayhelper.com/` (apex) and `/index.html` return `200` rather than 301 to the `www` canonical (canonical tag mitigates); no HSTS header observed; `og:price:*` meta tags on a free tool are unnecessary. `src/.htaccess` is correct and matches live headers.
- **I6. Single-origin hosting** (185.46.40.47, no CDN header). TTFB is fine from this vantage (~65 ms server time) but 26 locales imply a global audience; a CDN would flatten far-region TTFB. Cannot verify without field data.

## Prioritised action list

1. M2: `content-visibility:auto` on `.content-section` / `.site-footer` (one CSS rule, -25 to -55% lab LCP on non-Latin locales).
2. M1: stop loading gtag on first interaction; idle-only, or off-main-thread.
3. M3: line-number rendering without per-line DOM nodes.
4. L1: wire up latin-ext Poppins faces (assets already in `src/fonts/`).
5. L2/L3: drop the jsDelivr preconnect; defer Monaco for returning Ultra users.
6. I1/I2: clean dead assets from `src/images`, `src/fonts`, and repo root.

## Evidence and reproducibility

Scripts and raw data are kept in the session scratchpad (`scratchpad\perf\` and sibling files). Key commands: Playwright Chromium via the bundled `.claude/skills/seo/.venv` with `Emulation.setCPUThrottlingRate=4` and `Network.emulateNetworkConditions`. Raw copy of the audited HTML/CSS/JS is in `arrayhelper.com-audit\home.html`, `app.css`, `main.js`. `psi.json` records the PSI rate-limit error.
