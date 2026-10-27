# Agent readiness (seo-agentic) - https://www.arrayhelper.com/

Audited 2026-10-27. Mode: audit only (no `fix`/`--ua-matrix`). Raw tool output: `arrayhelper.com-audit/raw/` (`agentic_check.json`, `agent_ux.json`, `lh_agentic.json`, `a11y_render.json`).

## Summary

| Measure | Result |
|---|---|
| Lighthouse Agentic Browsing | **Not measured.** PSI returned HTTP 429 (daily quota) for mobile and desktop, two attempts. Local Lighthouse 13.5 needs Node 22.19+, host has Node 20.14. No `X/N` is reported. |
| Lighthouse prediction (not a result) | Counted audits would be `agent-accessibility-tree` + `cumulative-layout-shift` = N 2. Both look likely to pass, so 2/2. `llms-txt` (404), `ard-schema` (no catalog), `webmcp-form-coverage` (0 forms), `webmcp-schema-validity` (no tools) drop out. Rerun when quota resets or with a Google API key. |
| Agent-UX heuristic (separate from Lighthouse) | **96/100**, `score_status: complete` (Playwright a11y tree: 773 nodes, 54 interactive, 0 unnamed interactive). The single deduction (-4) is `#customPattern`, which is labelled with `aria-label`; the axe `label` rule accepts that, so it is a heuristic artifact, not a defect. |
| P0 failures | 0 measured. WAF test not run (needs authorization). |
| Composite readiness (auditor judgment, not a tool score) | **74/100**. Basics are strong; the hover-only settings menu and unlabeled output controls limit what tree-driven agents can do. |

What most limits agents today: the Settings menu (which holds the switches for 5 of the 8 output formats) is hover-only, so agents that act through the accessibility tree or keyboard cannot reach it.

## What works

- Primary content is server-rendered: 1369 words with JS off, no JS-shell marker (`server-rendered` pass).
- Native controls only: 32 `<button>`, 40 `<a>`, 0 `div onclick` widgets. Auto Run and Dedupe are real `role="switch"` with `aria-checked` kept in sync (`src/js/ui/events.js:139`).
- Clean semantics: one `h1`, six `h2`, landmarks (header, main, nav x2, article, footer), no duplicate IDs, no positive `tabindex`, no `aria-hidden` focusable nodes, every `<img>` has `alt`.
- The core flow works for agents. Live test: typing `apple / banana / 42` into the labelled textbox "Text list input" produced `'apple', 'banana', 42` (Raw), `['apple', 'banana', 42]` (JS) and `IN (N'apple', N'banana', N'42')` (SQL) in the output textareas within the 50 ms debounce (`CONFIG.INPUT_DEBOUNCE`, `src/js/core/utils.js:14`). "Convert the list" is a named button for the >40-line case.
- No CAPTCHA, login or overlay. Real 404 for unknown URLs (`http-404` pass); robots.txt 200 (`robots-reachable` pass); sitemap 200.
- CLS measured 0 in a Chromium lab load (local observation, not a Lighthouse run).

## Findings

### Critical
None.

### High

**H1. Settings menu is hover-only on desktop; 5 of 8 output formats and all options are unreachable by tree or keyboard agents** (skill P1: "no hover-only menus")
- Evidence: `.editor-selector-menu` is `visibility:hidden; opacity:0` and shows only on `.options-container:hover` or `.open` (`src/styles/globals.css:45-83`, repeated at `:361`). `.open` is toggled only when `IS_MOBILE` (UA regex `/iPhone|iPad|iPod|Android/i`, `src/js/core/utils.js:5`, `src/js/ui/events.js:294-299`). No `:focus-within`, no `aria-expanded`/`aria-controls` on the Settings button (`src/page.html:325`).
- Observed on the live page with a desktop UA: Chrome's accessibility tree lists no Settings-menu control (Classic/Ultra, SQL dialect, Dedupe, Auto Run, panel chips) while closed; focusing the Settings button and calling click leaves `visibility:hidden` and `.open` false; `#classic-editor-btn.focus()` fails (hidden). A real pointer click opened the menu only through `:hover` (`.open` stayed false).
- Impact: the default view shows only Raw, JS, SQL. Python, PHP, JSON, C#, Custom, dialect, dedupe are enabled solely from this menu (`page.html:362-371`). Agents that rely on refs or keyboard (Playwright-style, accessibility-tree agents) cannot switch them on; pointer-hover agents can, fragilely.
- Fix: (1) `events.js:294`: drop the `IS_MOBILE &&` gate so a click/Enter toggles `.open` on all devices and sync `aria-expanded` on the `.options` button; (2) `globals.css:78` and `:361`: add `.options-container:focus-within .editor-selector-menu`; (3) add `aria-expanded="false" aria-haspopup="true"` to `page.html:325` and close on Escape. Re-test: tab to Settings, press Enter, confirm `read_page` lists the chips.

### Medium

**M1. Output textareas are named `rawOutput-label`, `jsOutput-label`, ... and are not read-only**
- Evidence: `src/page.html:170,187,204,221,238,255,272,299` (`aria-label="rawOutput-label"` etc.). Playwright tree: `textbox 'rawOutput-label'`. The visible titles (`[ Raw ]`, `[ JavaScript ]`, `page.html:159,176,...`) are not linked. The label is hard-coded English identifier text in all 26 locales. `textarea.readOnly` is false for all 8, so an agent cannot tell outputs from inputs.
- Fix: no new i18n keys needed. Give each `.output-title` span an id (e.g. `id="rawTitle"`) and replace the aria-label with `aria-labelledby="rawTitle"`; add `readonly` to the output textareas (confirm users do not edit outputs). Name then reads "[ Raw ]", "[ JavaScript ]".

**M2. Eight Copy buttons share one accessible name**
- Evidence: Playwright tree gives `button 'copy Copy Text'` for every panel (decorative `<img alt="copy">` plus the opacity-0 label, `page.html:160-168`, repeated for js/sql/py/php/json/cs/custom). The browser pane's own `read_page` shows them with no name at all. Which output a button copies is not in its name.
- Fix: set `alt=""` on the icon imgs (`page.html:163,180,197,214,231,248,265,282`), give the label div an id and the title span an id, and set `aria-labelledby="rawCopyLbl rawTitle"` (name: "Copy Text [ Raw ]"). Add `type="button"`.

**M3. Control state is visual only (no `aria-pressed`)**
- Evidence: quote style and number-format buttons (`page.html:308-322`), Classic/Ultra, SQL dialect and panel chips toggle a CSS `.active` class only (`events.js:157,230,359-362,364-372`). `aria-pressed` is absent on all 12. Only the two switches expose state.
- Impact: an agent cannot read which quote style or dialect is currently selected; it must infer from output text.
- Fix: set `aria-pressed` wherever `.active` is toggled (same lines). Also stop keying behavior on `img.alt` (`events.js:357`): use `data-` attributes, or setting `alt=""` for accessibility will silently break quote settings.

### Low

- **L1. Output cap and auto-run cap are invisible to agents.** Auto Run stops above 40 lines (`utils.js:15`, `AUTO_RUN_MAX_LINES`); textareas truncate at 200 000 chars with a notice while Copy gets the full text (`converter.js:253`, `utils.js:12`). An agent reading the textarea for a large list gets truncated data and may have no clipboard access. Mention in the guide copy or expose full output through a tool (see opportunity below).
- **L2. No live region for conversion or copy feedback.** Copy feedback only swaps label text (`events.js:78-98`); add `role="status"` to a visible status node if you want it announced.
- **L3. Ultra mode swaps the textarea for Monaco** (`#editor` hidden, `#monaco-editor-container`). Classic mode (default) is the agent-friendly path; do not make Ultra the default.
- **L4. Small targets.** In-page nav and footer links are 17-21 px tall (below 24 px, WCAG 2.2 AA). P3.

### Info (opportunities, not defects)

- **llms.txt: 404** (`llms-txt` info; Lighthouse N/A, so it does not count today). Publishing a valid one (H1, a `>` summary, 1+ Markdown links, 50+ chars) adds a counted audit: 3/3. Google ignores llms.txt and no consumer agent is confirmed to read it. How: create `src/llms.txt`, add `'llms.txt'` to `STATIC_ENTRIES` (`build.mjs:23-29`). Keep unknown URLs returning 404 (currently true).
- **Markdown delivery: none** (`markdown-delivery` info). Page is already server-rendered; optional.
- **ai-catalog.json, A2A card, API catalog, OAuth, UCP: absent, N/A.** The site has no agent resources, so none should be published.
- **Tool caveat:** `markdown.negotiation.vary_accept: true` in `agentic_check.json` is a false positive: the live header is `Vary: Accept-Encoding` only.
- **WebMCP opportunity (P2, optional; W3C CG draft, checked 2026-09-23).** The tool is a pure client-side function with no forms (`forms: 0`, so declarative attributes are N/A). One imperative, read-only tool would let ChatGPT-desktop-style agents skip the UI:
  - `convert_list`: input `{ items: string, quoteStyle: "single"|"double", numbers: "plain"|"quoted", dedupe: boolean, sqlDialect: "mssql"|"standard", format: enum[raw|js|sql|py|php|json|cs|custom] }`, each property with a `description`.
  - Bind to the existing `buildFullOutput(text, options, key)` (`src/js/core/converter.js:259`, already exported, returns uncapped output, so it also solves L1); register in `src/js/main.js` after `initEvents(...)`, feature-detecting `document.modelContext ?? navigator.modelContext`; `annotations: { readOnlyHint: true }`; no network, no side effects, no confirmation needed.
  - Effect on Lighthouse: adds `webmcp-schema-validity` as a counted audit (a parameter without a description scores 0.5 and fails), so annotate fully. Consumers: ChatGPT desktop calls imperative tools by default; Claude in Chrome, Gemini in Chrome and Comet show no public signal. A Chrome origin-trial token meta is needed for ordinary Chrome visitors (trial M149-M156, reported end 2026-11-17, secondary source). No traffic or citation effect should be expected.

## Access policy (robots.txt: `User-agent: *` / `Disallow: /cgi-bin/` / Sitemap; one group, no named AI groups, no Content-Signal)

- **Training** (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended): allowed at root via `*`; vendors honour robots.txt. Implicit policy, never stated.
- **Search** (OAI-SearchBot, Claude-SearchBot, PerplexityBot): allowed at root via `*`; honoured.
- **User-triggered** (ChatGPT-User, Claude-User, Perplexity-User, Google-Agent): allowed at root. Only Claude-User is documented to honour robots.txt; ChatGPT-User "may not apply"; Perplexity-User and Google-Agent generally ignore it. Nothing private exists on the site (static client-side tool), so no auth gap.
- WAF behaviour: not tested (`--ua-matrix` needs authorization). Default fetcher and a real headless Chrome both got 200s, no challenge page.
- Optional: state a purpose policy in `src/robots.txt` (copied by `build.mjs:26`), for example `Content-Signal: search=yes, ai-input=yes, ai-train=<owner's choice>`. Ask the owner for the training choice; Content-Signal is a stated preference, not enforcement, and Google does not act on it.

## Standards status (labels per `vendor-matrix.md`, last full check 2026-09-23, 34 days old, within the 60-day window)

WebMCP: W3C Web Machine Learning CG draft, not a standard (WebKit opposes, Mozilla neutral). Content-Signal: Cloudflare CC0 policy, IETF draft expired 2026-04-04. ai-catalog.json/ARD: spec 1.0, Lighthouse 13.5 `ard-schema`. Web Bot Auth: IETF draft-00. Lighthouse Agentic Browsing: "under development"; version used for predictions 13.5.0 (not run).

## Recommendations in order

1. H1 (menu reachable by click/focus/keyboard, expose `aria-expanded`). Confirm: re-run `agent_ux_check.py` and the browser `read_page`, confirm Python/PHP/JSON/C#/Custom chips appear after Enter on Settings.
2. M1-M3 together (names, readonly, `aria-pressed`). Confirm: Playwright tree shows distinct button and textbox names; rerun Lighthouse `agent-accessibility-tree` once PSI quota returns.
3. Rerun `lighthouse_agentic.py ... --strategy both` with a Google API key to replace the predicted 2/2 with a measured X/N.
4. Optional: `llms.txt` (+1 counted audit), a `convert_list` WebMCP tool, an explicit robots.txt purpose policy.

## Structured findings (for audit-data.json, category "AI Search Readiness")

```json
{
  "category": "AI Search Readiness (agentic)",
  "score": 74,
  "lighthouse_agentic": "not measured (PSI 429); predicted 2/2",
  "agent_ux_heuristic": 96,
  "what_works": [
    "Server-rendered content (1369 words without JS)",
    "Native buttons/links/textareas, 0 unnamed interactive nodes in the accessibility tree",
    "Core paste-and-convert flow verified live; labelled input and Convert button",
    "Real 404s, robots.txt 200, no CAPTCHA or overlays; CLS 0 in lab load"
  ],
  "findings": [
    {"title": "Settings menu is hover-only on desktop", "severity": "High", "description": "src/styles/globals.css:78 reveals .editor-selector-menu on :hover only; .open is gated to mobile UAs (events.js:294). Controls for Python/PHP/JSON/C#/Custom panels, dialect, dedupe are absent from the accessibility tree and not keyboard reachable.", "recommendation": "Toggle .open on click for all devices, add :focus-within, aria-expanded/aria-haspopup on the Settings button (page.html:325), close on Escape."},
    {"title": "Output textareas named rawOutput-label etc. and not readonly", "severity": "Medium", "description": "page.html:170,187,204,221,238,255,272,299 use identifier-style aria-labels, not linked to visible [ Raw ] titles; outputs are editable-looking.", "recommendation": "Use aria-labelledby to the output title spans and add readonly."},
    {"title": "Eight Copy buttons share the name 'copy Copy Text'", "severity": "Medium", "description": "page.html:160-168 and repeats; name omits which panel is copied; img alt 'copy' adds noise.", "recommendation": "alt='' on the icons and aria-labelledby combining the copy label and panel title; type='button'."},
    {"title": "Toggle state is visual only (no aria-pressed)", "severity": "Medium", "description": "Quote/number/editor/dialect/panel buttons toggle only .active (events.js:157,230,359-372); behavior also keyed to img.alt (events.js:357).", "recommendation": "Set aria-pressed with .active; use data attributes instead of img.alt."},
    {"title": "Auto-run and output caps are invisible to agents", "severity": "Low", "description": "AUTO_RUN_MAX_LINES 40 and OUTPUT_LIMIT 200000 (utils.js:12,15); textarea truncates while Copy returns full text.", "recommendation": "Document the caps and expose full output via a WebMCP tool or a visible status note."},
    {"title": "No llms.txt", "severity": "Info", "description": "/llms.txt returns 404; Lighthouse treats it as N/A. Google ignores llms.txt.", "recommendation": "Optional: add src/llms.txt and list it in build.mjs STATIC_ENTRIES (lines 23-29); valid file adds a counted audit (3/3)."},
    {"title": "WebMCP convert_list tool is a good fit (draft standard)", "severity": "Info", "description": "Stateless client-side converter with no forms; W3C CG draft checked 2026-09-23; only ChatGPT desktop calls tools by default.", "recommendation": "Optional read-only imperative tool bound to buildFullOutput (converter.js:259), fully described parameters."},
    {"title": "AI crawler policy is implicit", "severity": "Info", "description": "robots.txt has only a * group; training, search and user-triggered agents are all allowed; no Content-Signal.", "recommendation": "Owner decides purpose policy; optionally add Content-Signal in src/robots.txt."}
  ]
}
```
