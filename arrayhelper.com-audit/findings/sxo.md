# SXO Analysis: https://www.arrayhelper.com/

Target keyword: **text list to array converter** (secondary: list to array converter, sql in clause generator, convert list to javascript array, comma separated list generator)
Date of analysis: 2026-10-27. Analyst: seo-sxo subagent (claude-seo `seo-audit`).

**SXO Gap Score: 63/100** (separate from SEO Health Score; lower = bigger gap to SERP expectations)

---

## 1. SERP landscape (WebSearch data only, see Limitations)

| Query | Observed top results (types) | Consensus |
|---|---|---|
| text list to array converter | charset.org/text-to-array (tool), listdiff.com learn article (guide + tool CTA), github.com/yavuzyazici/arrayHelper (repo), Lucee/Novell/IDL `ListToArray` docs (reference), npm `list-to-array` (library), Bubble plugin | **Fragmented**: ~30-40% tool, ~40% language-API docs/libs |
| list to array converter online | listdiff.com guide, GitHub repo, dotnetperls, npm lib, ArrayCat (peerpush), Mapbox/Java docs | Fragmented / mixed |
| sql in clause generator | chat2db.ai tool, chartdb.io tool, bushe.co tool, plus Oracle forum, MS Learn EF API, Codemia/GfG parameterization Q&A | **Strong Tool** (~60%+ single-purpose SQL IN tool pages) |
| comma separated list generator | devtoollab tool, retool utility, Excel TEXTJOIN how-tos (thebricks, valpo.edu), Boomi recipe, Thunderstone docs | Mixed: tools + Excel how-to + docs |
| convert list to javascript array online | listdiff.com learn article, npm `list-to-array`, GeeksforGeeks jQuery, Finxter | Mixed informational / tool |

Notable data points
- listdiff.com ranks with **four separate ~850-word guide pages** (JSON array, JavaScript array, SQL IN clause, comma separated string), each with 8 FAQs and a CTA into one tool. The query space is split into per-output-format intents.
- Tool pages that rank for "sql in clause generator" are **single-purpose** (H1 = "SQL IN Clause Generator"), prefilled with sample data, and expose quoting modes (Auto/Always/Never, numbers bare), column name, dedupe (chat2db), a Free / Private / In-Browser badge (bushe), or IN / NOT IN and per-database dialects (chartdb).
- "list to array" also pulls ColdFusion/Java/C# function documentation: part of this traffic is off-intent for a web tool.
- **arrayhelper.com itself did not appear in any of the six result sets; the GitHub repo did** (twice, near the top). WebSearch is not Google, so this is a prompt to check Search Console, not a ranking finding.
- SERP features (PAA, ads, featured snippet, AI Overview) **could not be observed** with this tool.

## 2. Page-type alignment

- Target page type (taxonomy #8): **Tool / Interactive**, with a Hybrid-style guide layer (about 1,214 words, 6 H2 / 25 H3 / 9 FAQ) below the tool. Functional tool above the fold, no login wall, SoftwareApplication/WebApplication schema present.
- SERP expects: Tool for sql-in/comma-list queries; mixed Tool + Guide for "list to array / javascript array"; Reference docs for "ListToArray".
- **Verdict: ALIGNED on page type** for the primary keyword and for "sql in clause generator". No CRITICAL/HIGH mismatch.
- **Specificity gap (MEDIUM mismatch severity)** for the secondary clusters: the SERP rewards purpose-built pages per output format (SQL IN, JSON array, JavaScript array, comma separated), while this site serves one multi-format page with SQL as the 3rd of 8 panels and an H1 that does not mention "IN clause" or "comma separated". See H4.
- The decisive problems on this page are not page type. They are **time-to-value and correctness** inside the tool (C1, C2, H1-H3), which the SERP competitors handle better.

## 3. User stories (each cites its SERP signal)

1. **Awareness/Decision - Data analyst with an Excel column.** As an analyst pulling a report, I want to paste a column of order numbers and get an `IN (...)` list, because I am mid-task and want to move on, but I am blocked by quoting ambiguity (numeric IDs vs strings, leading zeros) and long lists. *Signals: chat2db "Auto quoting mode leaves numeric bare... zip codes with leading zeros choose always-quote"; listdiff "no quotes for integers"; Oracle 1,000-item limit; codeshack/devtoollab "column to comma separated list" results.* (stage: Decision)
2. **Consideration - Developer handling internal/customer data.** As a developer pasting customer IDs, I want assurance nothing is uploaded, because pasted lists are sensitive, but I am blocked by uncertainty about a free web tool. *Signals: bushe "Free · Private · In-Browser" badge above the fold; codeshack/devtoollab/charset "runs entirely in your browser".* (stage: Consideration)
3. **Decision - Python/PHP/C#/JSON developer.** As a dev who does not write JavaScript, I want my language's literal in one step, because retyping quotes is tedious, but I am blocked by not knowing which tool supports my language. *Signals: "newline separated list to python list" returned no dedicated tool (PlanetCalc, a Sublime plugin, snippets) = unmet demand; charset.org advertises JS/Python/PHP/JSON/CSV.* (stage: Decision)
4. **Awareness - Spreadsheet/ops generalist.** As a non-developer, I want a comma separated list from a column, because I need it for a filter box or email, but I am blocked by thinking I need TEXTJOIN formulas. *Signals: Excel TEXTJOIN guides in results; devtoollab "List to Comma Separated".* (stage: Awareness)
5. **Awareness - Language-API seeker (off-intent).** As a ColdFusion/Java/C# dev, I want the `ListToArray`/`toArray` function, because I am coding in that language, but the results are reference docs. *Signals: docs.lucee.org, novell.com, mapbox, dotnetperls, educative.* (stage: Awareness; low value, only serve with a snippet)

## 4. Gap analysis (SXO Gap Score: 63/100)

| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 13/15 | Tool above fold, no login, `{{ui.h1}}` states the converter. Loses points for specificity vs per-format SERP pages and an empty initial state. |
| Content Depth | 12/15 | 1,214 words, 6 H2, 25 H3, 9 FAQ, six use-case cards, eight format cards with code. Beats competitor norms (250-850 words). Missing: delimiter handling, Oracle 1,000-value limit, parameterized-query caveat, per-language "in code" snippet. |
| UX Signals | 7/15 | Tool above fold, auto-run, shortcuts, saved settings, copy per panel. Loses for: blank outputs after paste of >40 lines (C1), empty first view with no sample (H1), 5 of 8 panels hidden (H2), mobile first screen is a 720px empty editor (M1), copy label hidden until hover (M4), 14px H1. |
| Schema | 11/15 | Valid single JSON-LD block: WebSite, Organization, Person, WebApplication+SoftwareApplication (price 0), HowTo, FAQPage. HowTo/FAQPage no longer earn rich results, no aggregateRating, `softwareVersion` static "1.0", no `dateModified`/`screenshot`. |
| Media Richness | 8/15 | 16 images, nearly all UI icons. No demo GIF/screenshot in the guide although `src/images/Readme Image 1.png` and `Readme Image 2.png` exist. OG image is the logo. The static code samples in the format cards are a plus. |
| Authority Signals | 7/15 | Person schema, GitHub link (open source), hosted-by link. Missing: visible author/story (README has a real origin story, absent from the page), privacy page, usage/GitHub-star proof; correctness claims contradicted by behaviour (C2). |
| Freshness | 5/10 | `Last-Modified` 2026-09-06 (about 7 weeks); no visible updated date; `publication_date` null; no changelog. |
| **Total** | **63/100** | |

## 5. Persona scores

| Persona (SERP source) | Relevance | Clarity | Trust | Action | Total | Rating |
|---|---|---|---|---|---|---|
| Spreadsheet-to-SQL analyst (chat2db/bushe/listdiff SQL) | 20 | 12 | 14 | 12 | **58** | Needs Work |
| Front-end/Node dev, JS/JSON array (listdiff JS, npm) | 21 | 16 | 10 | 18 | **65** | Good (borderline) |
| Python/PHP/C# dev (unserved python query, charset.org) | 16 | 8 | 11 | 14 | **49** | Needs Work |
| Privacy-conscious dev (bushe badge, codeshack) | 22 | 13 | 18 | 17 | **70** | Good |
| Spreadsheet/ops generalist (TEXTJOIN guides, devtoollab) | 12 | 9 | 13 | 12 | **46** | Needs Work |
| Language-API seeker (Lucee/Java docs) | 7 | 9 | 11 | 6 | **33** | Critical Mismatch (off-intent) |

Weighted by tool-intent share (30/25/15/10/10/10): about **56/100**.
- Weakest high-weight persona: **Spreadsheet-to-SQL analyst (58)**. Top issue: a typical column paste (>40 rows) shows nothing until a 28x28px button is clicked, and the SQL panel quotes numeric IDs as `N'42'`.
- Systemic: **Clarity** is the lowest dimension (average about 11.2/25) and **Trust** drops for developer personas because of the escaping defect.

## 6. Findings (ranked)

### CRITICAL

**C1. Auto Run silently stops at 40 lines, so a realistic paste yields blank outputs with no message.**
Evidence (live test on production): pasting 60 lines left `#rawOutput` at 0 characters; clicking `#convertBtn` (a 28x28px icon) produced 469 characters. Source: `src/js/core/utils.js:15` `AUTO_RUN_MAX_LINES: 40`; `src/js/ui/events.js:115-124` `maybeAutoRun()` returns without feedback. The copy promises the opposite: `how.steps[2].body` ("leave Auto Run on and watch the output follow your typing") and `faq.items[1].a` ("press Ctrl/Cmd+Enter or leave Auto Run on"). On touch devices there is no Ctrl+Enter, and the outputs sit below a 720px editor.
Fix: remove the cap for single paste events (run convert on `paste`/`input` when line count > 40 once, debounced, since `convertText` is already capped at `OUTPUT_LIMIT` 200,000 chars) or, at minimum, show a visible hint in the outputs ("Press Convert or Ctrl/Cmd+Enter - Auto Run is off above 40 lines"). Add a labelled "Convert" button next to the arrow icon (`src/page.html` ~L140) with new i18n key `ui.convert`.

**C2. Quote escaping claim is false for the default JS/Python/PHP/Raw output.**
Evidence (live): input `O'Brien` gave `['apple', 'O'Brien', 007, 42, 3.14]` in the JavaScript panel (invalid JS). `src/js/core/converter.js:190` builds `quote + line + quote` with no escaping (same for the phase-2 length math at `:227`), and backslashes are not escaped either. Contradicting copy: `features.items[2]` ("Quotes are escaped correctly... so nothing breaks downstream") and `faq.items[2].a` ("values with apostrophes, backslashes or tabs stay valid in the target language"). Only SQL (`:193`) and JSON/C# (`JSON.stringify`) are escaped. Also `007` is emitted as a bare number (`isPlainNumber`), which is a JS octal-literal problem and corrupts IDs/zip codes.
Fix: in `converter.js` escape `\` and the active quote char for the RAW intermediate (single-quote mode: `\\` and `\'`; double: `JSON.stringify`) and update the Phase 2 `grow()` length to count added escapes; treat `/^[-+]?0\d/` as a string. Until fixed, soften `features.items[2]` and `faq.items[2]` in `src/i18n/en.json` (and all 25 locale files). Hand off to `/seo technical`/dev.

### HIGH

**H1. First view is empty: no sample, no example button, three blank output panels.**
Evidence: desktop and 375px screenshots show only the placeholder "Start typing..." (`ui.editorPlaceholder`) and empty `[ Raw ] [ JavaScript ] [ SQL ]` panels. Competitors prefill sample data (bushe, chat2db) or offer "Load Example" / "Insert sample text" (devtoollab, charset.org). A searcher cannot see the payoff before supplying data, and a crawler/thumbnail sees an empty tool.
Fix: add `ui.loadExample` (new key in `en.json` + 25 locales) and a button beside `.hero-jump` in `src/page.html` (~L380) that fills `apple\nO'Brien\n42` and triggers convert. Optionally prefill on first visit when `localStorage.userOptions` is null (`src/js/main.js:48`). Replace the generic placeholder with a multi-line example.

**H2. Python/PHP/JSON/C# outputs are hidden by default although the title, H1 and meta promise them.**
Evidence: `<title>`/`meta.title` and `ui.h1` name "JavaScript, SQL, Python, PHP", but `options.visiblePanels` defaults to `['raw','js','sql']` (`src/js/main.js:46`) and the chips live inside the unlabeled gear menu (`src/page.html` L360-371) with a 3-panel cap. `convertText` computes only visible panels (`converter.js:145-149`), yet `formats.lead` says "converted into all eight formats at the same moment" and `formats.outputLead` says "Eight ready-to-paste outputs, generated as you type".
Fix: surface a visible format chip/tab row above the outputs (move `#panel-chips` out of `.editor-selector-menu`), support deep links (`/?panel=py`, `#python`) so per-format pages/links open the right panel, and reword `formats.lead`/`outputLead` to "eight formats, three on screen at a time".

**H3. SQL IN output lags the SQL-generator SERP norm (numbers, dialect default, NOT IN, column).**
Evidence: live SQL panel output `IN (N'apple', N'O''Brien', N'007', N'42', N'3.14')`. `converter.js:192-195` ignores `numbersFormat`, so numeric IDs are always quoted (and `N'` forces nvarchar), and `src/js/main.js:44` defaults `sqlDialect: 'mssql'`. SERP competitors: numeric-bare "Auto" mode (chat2db), numeric toggle (bushe), IN/NOT IN + dialects (chartdb), Oracle 1,000-limit FAQ (chat2db). The use-case card `useCases.cards[0]` ("order-number or e-mail column... IN (...)") is exactly the numeric-ID case.
Fix: honour `plainNumbers` in the SQL sink (bare ints, quoted for leading-zero values), default `sqlDialect` to `'standard'` unless analytics shows SQL Server dominates, add `NOT IN` and optional column-name controls (SQL settings row, `src/page.html` L353-359), and add an FAQ on the Oracle 1,000-expression limit and parameterized queries (`faq.items`).

**H4. No dedicated landing pages for the secondary keyword clusters the SERP splits by output format.**
Evidence: SERP signals above (listdiff's four per-format guides; single-purpose SQL IN tool pages). `build.mjs` generates only locale routes (`localeUrl`/`localePath`), so every intent is served by one URL whose H1 does not contain "IN clause", "JSON array" or "comma separated".
Fix: extend `build.mjs` to emit intent pages (e.g. `/sql-in-clause-generator/`, `/list-to-json-array/`, `/comma-separated-list-generator/`, `/list-to-python/`) from the same template with per-page `meta`, `ui.h1`, default `visiblePanels` and a 300-500 word focused guide + 3 FAQ, cross-linked from the main guide and sitemap/hreflang. This also resolves H2/H3 specificity.

### MEDIUM

**M1. Mobile first screen is a 720px empty editor; controls are about two screens down.**
Evidence (375x812 live): `.text-editor` height 720px (`src/styles/globals.css` ~L142-146 `main > .text-editor { height: 720px }`); outputs start at y=865, quote/number toolbar y=1591, gear y=1726, Guide link y=1839; page height 9,702px. The `Ctrl / Cmd + Enter` hint (`ui.kbdBefore/kbdAfter`) is irrelevant on touch.
Fix: cap mobile editor to about 40vh, hide the kbd hint when `IS_MOBILE`, move the quote/number toolbar above the outputs, keep the Convert button visible.

**M2. Input handling: only newline splitting; no delimiter split and no reverse direction.**
Evidence (live): `apple, banana, cherry` -> `['apple, banana, cherry']` (one element); tab row stays one element. `converter.js:168` `text.split('\n')`. charset.org (newline/custom/regex split, array-to-text) and devtoollab (separators, reverse mode, sort, upload) cover the "comma separated list" cluster.
Fix: add a "Split by: line / comma / tab / auto" option in `convertText`, a reverse (array -> list) mode, and a matching FAQ ("Can I paste a comma separated list?").

**M3. Trust/E-E-A-T gaps: privacy promise below the fold, no privacy/about page, real origin story unused.**
Evidence: "Nothing is uploaded" appears only in `features.items[0]` and `faq.items[6]`; tagline (`ui.tagline`) omits it. Competitor badge "Free · Private · In-Browser" is above the fold. Footer has no Privacy link although GA (`G-XRJ7CJ6LQQ`) loads and 26 locales include EU markets. README.md tells a first-hand story (junior developer at Atak Domain building SQL IN lists) that is not on the page.
Fix: append "Runs in your browser - nothing is uploaded" to `ui.tagline`; add `footer.privacy` + privacy page; add a short "Why I built this" block with author name/GitHub link (new `about` section in `src/page.html` + `en.json`); show GitHub stars if available.

**M4. Primary conversion (Copy) is weak on affordance and unmeasured.**
Evidence: the "Copy Text"/"Copied" label has `opacity: 0` at rest (measured) and appears only on `:hover` (`src/page.html` L160-168 pattern x8); on touch/keyboard the "Copied" feedback may never be visible. No `gtag('event', ...)` in `src/js/**` (grep: none), so copy/convert success cannot be measured.
Fix: show the label at all times (or a toast with `aria-live`), and send `gtag('event','copy_output',{format:key})` and `gtag('event','convert')` from `events.js` (`copy()` / `convertText` calls).

### LOW

**L1. Contradictory limit claims.** `faq.items[1].a` says "no row limit"; `faq.items[5]` and `features.items[1]` say classic is comfortable to 50,000 lines (`CONFIG.MAX_CLASSIC_LINES`), and on-screen output is truncated at 200,000 chars (`OUTPUT_LIMIT`). Align wording in `en.json`.

**L2. Schema dead weight and gaps.** `HowTo` and `FAQPage` in the JSON-LD block (`_jsonld` in `build.mjs`) do not earn rich results today; `softwareVersion` is a static "1.0"; no `dateModified`, `screenshot`, `aggregateRating`. Keep `WebApplication`/`SoftwareApplication`; add `dateModified`/`screenshot` (reuse `Readme Image 1.png`). Hand off to `/seo schema`.

**L3. Labels and semantics.** H1 renders at 14-15px (`src/page.html` L130); the "[ Raw ]" panel is the "comma separated list" output - rename to "Comma separated (raw)"; output textareas use `aria-label="rawOutput-label"` etc. (L170-299), which are meaningless to screen readers (use `ui.*Aria` keys); the copy-button icon alt text is "copy" in English on all locales.

**L4. Off-intent "ListToArray" traffic.** Add one in-code snippet per format card (e.g. `text.split('\n')`, Python `splitlines()`) in `formats.cards[].body` rather than building function-reference content.

### INFO

- **What works:** tool-first layout with a working converter above the fold, no login; eight formats, custom pattern with `{}`/`{n}`/`{i}` tokens, dialect switch, dedupe, saved settings and drag-to-reorder panels (none of the fetched competitors combine these); 1,214-word guide with the right section order (How it works, Formats, Features, Use cases, FAQ, Languages); concrete input/output samples; titles/H1/meta carry the exact keyword and are localized idiomatically (checked tr, de, es, ja, fr, pt); 26 locales with a full hreflang set and x-default; open source with Person/Organization entities; sub-50KB HTML, 200 OK, no console errors.
- SERP visibility check: `arrayhelper.com` absent from all six WebSearch result sets while its GitHub repo appears; verify indexation and queries in Search Console and ensure the repo "Website" field points to the site.
- Differentiation to lean into: multi-output side-by-side and custom templates are unique among fetched competitors, so keep them but lead with the SQL/JSON/JS use case per page.

## 7. Priority actions

1. C1: make conversion run on paste regardless of size and add a labelled Convert button/hint.
2. C2: escape quotes/backslashes in raw/JS/Python/PHP output, stop emitting leading-zero numbers bare; soften claims until shipped.
3. H1 + H2: example button and visible format tabs (including Python/PHP) so the title promise is visible in the first screen.
4. H3: numeric-aware SQL IN, standard dialect default, NOT IN/column name, Oracle-limit FAQ.
5. H4: per-intent pages via `build.mjs` (SQL IN first, then JSON array, comma separated, Python).
6. M1-M4: mobile first screen, delimiter split, privacy/about, copy affordance + analytics events.

## 8. Cross-skill hand-offs

- E-E-A-T gaps (M3): `/seo content`. Schema (L2): `/seo schema`. Tool/page defects and performance: `/seo technical`. Image/media (Readme screenshots): `/seo images`. No local intent in the SERP, so `/seo local` is not needed.

## 9. Limitations

- WebSearch is not Google: no PAA, ads, featured snippet, related searches or AI Overview data, and no volume/difficulty metrics; consensus percentages are estimates from 5 queries x about 9 results. DataForSEO was not available.
- Competitor pages were summarized from WebFetch (small-model summaries); word counts are approximate.
- Output behaviour was tested on the live production page with scripted input events in the built-in browser (Chromium), not on real devices; mobile metrics come from a 375x812 emulation.
- Google Search Console / analytics data (queries, device split, SQL dialect mix, copy rates) was not available, so persona weights and the dialect-default recommendation are judgement calls.
- Locale pages other than titles/H1 of six languages were not reviewed.

Offer: Generate a PDF report? Use `/seo google report`.

## 10. audit-data.json fragment (category: Search Experience)

```json
{
  "category": "Search Experience",
  "sxo_gap_score": 63,
  "serp_consensus": {"primary": "fragmented (tool 30-40%, docs/libs ~40%)", "sql_in_clause_generator": "tool, strong"},
  "page_type": {"target": "Tool", "verdict": "ALIGNED", "specificity_gap": "MEDIUM"},
  "persona_weighted_score": 56,
  "findings": [
    {"id": "C1", "severity": "critical", "title": "Auto Run stops at 40 lines silently", "files": ["src/js/core/utils.js:15", "src/js/ui/events.js:115"]},
    {"id": "C2", "severity": "critical", "title": "Quotes/backslashes not escaped in raw/JS/PY/PHP; leading zeros emitted bare; contradicts en.json features.items[2] and faq.items[2]", "files": ["src/js/core/converter.js:190", "src/i18n/en.json"]},
    {"id": "H1", "severity": "high", "title": "Empty first state, no example", "files": ["src/page.html", "src/i18n/en.json:ui.editorPlaceholder"]},
    {"id": "H2", "severity": "high", "title": "Python/PHP/JSON/C# panels hidden by default", "files": ["src/js/main.js:46", "src/page.html:360", "src/i18n/en.json:formats.lead"]},
    {"id": "H3", "severity": "high", "title": "SQL IN output: numerics always quoted, mssql default, no NOT IN/column", "files": ["src/js/core/converter.js:192", "src/js/main.js:44"]},
    {"id": "H4", "severity": "high", "title": "No per-intent landing pages for SQL IN/JSON/comma-separated/python", "files": ["build.mjs"]},
    {"id": "M1", "severity": "medium", "title": "Mobile first screen is 720px empty editor", "files": ["src/styles/globals.css:142"]},
    {"id": "M2", "severity": "medium", "title": "No delimiter split / reverse mode", "files": ["src/js/core/converter.js:168"]},
    {"id": "M3", "severity": "medium", "title": "Privacy/E-E-A-T signals below fold or missing", "files": ["src/i18n/en.json:ui.tagline", "src/page.html"]},
    {"id": "M4", "severity": "medium", "title": "Copy label hover-only; no conversion events", "files": ["src/page.html:160", "src/js/ui/events.js"]},
    {"id": "L1", "severity": "low", "title": "Contradictory row-limit claims", "files": ["src/i18n/en.json:faq.items[1],faq.items[5]"]},
    {"id": "L2", "severity": "low", "title": "HowTo/FAQPage JSON-LD earn no rich results; missing dateModified/screenshot", "files": ["build.mjs"]},
    {"id": "L3", "severity": "low", "title": "Tiny H1, 'Raw' label, placeholder aria-labels", "files": ["src/page.html:130,170"]},
    {"id": "L4", "severity": "low", "title": "Off-intent ListToArray traffic: add in-code snippets", "files": ["src/i18n/en.json:formats.cards"]}
  ]
}
```
