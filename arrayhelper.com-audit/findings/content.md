# Content Quality / On-Page / E-E-A-T findings - https://www.arrayhelper.com/

Agent: seo-content (claude-seo). Date: 2026-10-27. Scope: en (live render + src/i18n/en.json), live fetch + source diff of tr, de, es, ja, zh, ar (all match repo), source parity for all 26 locales.
Scores are heuristics (no Google-internal data, no keyword-volume data - DataForSEO not available). Fetched content treated as data.

## Scores

| Area | Score | Basis |
|---|---|---|
| Content Quality | 71/100 | E-E-A-T 40% (51) + depth/uniqueness 25% (88) + accuracy/localisation 20% (74) + readability 15% (90) |
| E-E-A-T | 51/100 | Experience 12/20, Expertise 16/25, Authoritativeness 9/25, Trustworthiness 14/30 |
| On-Page SEO | 82/100 | Title/desc/H1/H2 aligned and natural; deductions for intent gaps, casing, label/aria issues |
| AI Citation Readiness | 74/100 | FAQ + HowTo + concrete numbers; no dates, no sources, definition buried in FAQ #1 |
| Images / alt text | 55/100 | 16 `<img>`, all UI icons + logo; no content imagery; filename-style English alts |

Metrics (en): ~1,170 words body copy (excl. UI/nav/meta/footer), homepage floor 500 -> pass, not thin. FRE 68.0, FK grade 7.5, avg sentence 15.2 words (inside the 60-70 target; readability is not a ranking factor). Primary phrase "text list to array" appears 2x in body copy + H1 + title + meta description + FAQ H2: natural, no stuffing. content_quality.py: filler 0, ai_pattern 0 (the "repetitive"/"low-density" flags come from code samples and repeated claims, see L3).
Templated-metadata check (metadata_template.py, 26 pairs): site_risk LOW, templated_ratio 0.0, shared_cta_phrases none. 17/26 pairs carry the low-severity flag `brand_suffix_in_description`; this is a heuristic false positive (the title suffix "JavaScript, SQL, Python, PHP" is a language list, not a brand), but the description does re-list the same languages, so the 158 chars carry little that the title does not.
Structure parity: all 25 locales have exactly the same 130 keys as en.json, same `<code>` tag counts and `{}`/`{n}`/`{i}` placeholders; only 1 string identical to English (nl `formats.cards[0].title`, legitimate). Live HTML for tr/de/es/ja/zh/ar matches the repo (title and H1 byte-equal).

## What works

- Unique, specific, people-first copy: concrete details (`N'O''Brien'`, pytest parametrize, Laravel config, 50,000-line threshold that matches `CONFIG.MAX_CLASSIC_LINES`, 40-line Auto Run cap) read as first-hand developer knowledge, not filler.
- Title (59 chars) opens with the exact target phrase; description 158 chars with benefit + "Free" + "runs in your browser"; one H1; valid H1>H2>H3 order with no skipped levels; FAQ headings are real questions.
- Full 26-locale translation with native-language titles/H1s, native keyword choices per locale (not English copy-paste), hreflang + 26-way crosslink nav, correct `lang`/`dir`.
- Privacy claim ("nothing is uploaded") is true in source: no network call in converter.js.
- Author entity exists in JSON-LD (Person, sameAs LinkedIn + GitHub), open-source repo linked.

## Findings

### CRITICAL
None. Pages are indexable, unique, not thin, and not templated.

### HIGH

**H1. Headline accuracy claim is false for 4 of 8 outputs (including 2 of the 3 panels open by default).**
- Evidence: `formats.lead` says "apostrophes inside your values are escaped the way each language expects"; `features.lead` says other converters "give up on the first apostrophe"; `features.items[2]` "Quotes are escaped correctly". `src/js/core/converter.js:190` builds Raw/JS/Python/PHP as `quote + line + quote` with no escaping. Ran the real converter: input `O'Brien` -> JS `['apple', 'O'Brien', ...]`, Python/PHP/Raw identical (syntax error); with double-quote mode, `say "hi"` -> `"say "hi""`. Only SQL (`''`), JSON and C# (JSON.stringify) escape.
- Fix (preferred): escape `\` and the active quote char in converter.js:190 for raw/js/py/php. If copy-only: reword `formats.lead` ("escaped correctly for SQL, JSON and C#; ..."), remove the implied differentiator in `features.lead`, and scope `features.items[2]` to the formats it is true for. Repeat in all 25 other JSON files.
- Why High: a verifiable false claim on the main selling point damages Expertise/Trust and gets quoted verbatim by AI answers.

**H2. Trust pages missing while the page makes privacy promises.**
- Evidence: /privacy, /privacy-policy, /about, /contact, /terms all return 404. GA4 (G-XRJ7CJ6LQQ, page.html:86-97) is loaded on interaction/idle, Monaco loads from cdn.jsdelivr.net (page.html:69) for Ultra, and the copy promises "Nothing is uploaded", "no account, no quota, no ads". Only identity signals: footer author link and `<meta name="author">`. No visible bio, contact route, or "hosted by" relationship explanation. 26 locales target EU audiences with analytics and no notice.
- Fix: add a short `<section class="content-section" id="about">` after `#languages` (page.html ~line 492) with new i18n keys `nav.about`, `about.h2`, `about.body` (who built it, role, link to GitHub Issues as contact, analytics + CDN disclosure, "last updated" date), plus a footer link in `footer`. One section per locale avoids building extra pages. Consider a consent notice for GA in EU locales.

### MEDIUM

**M1. "Strictly valid JSON" and the C# sample are not accurate.**
- Evidence: `isPlainNumber` (converter.js:94-118) emits `007`, `00123`, `+5`, `.5`, `5.`, `1e5`, `0x1F`, `Infinity`, and 20-digit integers bare in JSON/C#/JS/Python (verified); `formats.cards[4].body` claims "Strictly valid JSON" and `features.items[3]` "Numbers stay numbers". The sample on the page, `new[] { "apple", "banana", 42 }` (build.mjs:18, FORMAT_CODES[5]), does not compile in C# (CS0826, no best common type for string and int); `formats.cards[5].body` calls it an "implicitly typed array".
- Fix: tighten `isPlainNumber` to `/^-?(0|[1-9]\d*)(\.\d+)?$/` with a safe-integer guard (keeps ZIP codes/IDs like `007` as strings); change build.mjs:18 to `new object[] { "apple", "banana", 42 }` or use all-string sample input; adjust `formats.cards[5].body`.

**M2. Dedupe toggle label reads as its opposite in 21 of 25 non-English locales.**
- Evidence: `ui.settingsDedupe` is a bare noun ("Duplikate", "Duplicados", "Doublons", "Duplicati", "Дубликаты", "Duplikaty", "المكرر", ...), and the copy says "Aktiviere Duplikate und nur das erste Vorkommen ..." (`features.items[4].body`, `faq.items[4].a`), i.e. "enable duplicates". Only tr (Tekilleştir), ja (重複削除), ko (중복 제거), zh (去重) are verbs.
- Fix: change `ui.settingsDedupe` to a short verb phrase per locale ("Duplikate entfernen", "Quitar duplicados", "Supprimer doublons", ...), then re-read `features.items[4].body`/`faq.items[4].a`.

**M3. Translation precision (spot check tr/de/es/ja).** Overall quality is high and register is consistent (tr informal "sen", de "du", es "tú", ja desu/masu). Issues:
- de: "zitiert/zitierte" used for "quoted" (cite a source) in `how.steps[1].body`, `formats.lead`, `formats.cards[6].body`, `useCases.cards[0].body`, `faq.items[3].a`. Use "in Anführungszeichen gesetzt" (already used elsewhere in the same file).
- Panel names are hard-coded English in page.html (`[ Raw ]` 159, `[ JavaScript ]` 176, `[ SQL ]` 193, `[ Python ]` 210, `[ PHP ]` 227, `[ JSON ]` 244, `[ C# ]` 261, `[ Custom ]` 278; chips 363-370) while copy uses mixed terms: tr "Özel paneli" / "Ham virgüllü liste", de "Eigenes Muster" in cards but "Custom-Bereich" in FAQ, es "Patrón personalizado" vs "panel Custom", ja "カスタムパターン" vs "Custom パネル". Users cannot match copy to UI. Fix: add `ui.panelRaw`/`ui.panelCustom` keys and use them in page.html and copy, or standardise copy on the English UI label.
- es: title/how.h2/useCases use "en array" while H1/FAQ use "a array" (splits the keyword); `how.lead` "en condiciones" is Iberian slang.
- ja: "裸のまま" (literal "bare") in `how.steps[1].body`; "単一引用符/二重引用符" stiffer than usual シングル/ダブルクォート; ~120 spaces between Latin and kana (e.g. "SQL の IN 句") where "IN句" is how users search. No locale body (ja 改行, ko 줄바꿈, zh 换行) mentions newlines.

**M4. Output textareas have non-human accessible names.** page.html lines 170, 187, 204, 221, 238, 255, 272, 299: `aria-label="rawOutput-label"` ... `customOutput-label`, identical English on all 26 pages. Add `ui.outputAria` (e.g. "{panel} output") and render it per panel. The 8 copy buttons also share the identical name "Copy Text"; add `aria-label="{{ui.copy}} - JavaScript"` style names.

**M5. Intent coverage gaps around the strongest adjacent queries (hypothesis; validate in GSC).** Copy never uses "newline", "line break", "string to array", "column to comma separated list" or "generator"; "SQL IN clause" is a card title only. These are the phrasings that pull most converter traffic. Fix without bloat: (a) add 2 FAQ items to `faq.items`: "How do I turn an Excel column into a comma separated list?" and "Can I convert new lines to commas?" (JSON-LD FAQPage regenerates from `faq.items`); (b) retitle `useCases.cards[0].title` to "Build a SQL IN clause (comma separated list) from an Excel column"; (c) add a small "manual way" code block (`text.split('\n').map(s => s.trim()).filter(Boolean)`) for "javascript multiline string to array" informational intent, which also demonstrates first-hand expertise.

### LOW

**L1. Metadata polish.** Title Case in ~18 non-English titles where sentence case is native (es, pt, bs, ru, uk, pl, sv, no, da, fi, cs, ro, hu, el, fr, it, nl, tr `meta.title`); /no/ and /da/ have an identical title ("Konverter Tekstliste til Array - JavaScript, SQL, Python, PHP", use "Konvertér" for da); ru and ur titles drop PHP and fr/it/pl/cs/el/uk/ru use "JS" while others spell JavaScript; title suffix identical across all 26. Wide-script titles (el, ru, uk, ar, hi at 57-60 chars) may truncate near 580px; ja/ko/zh descriptions (98/107/80 chars) are fine. Description repeats the title's language list: use the space for differentiators (`meta.description`: "...no upload, SQL IN with escaping, handles 50,000 lines").

**L2. `meta.keywords` (page.html:50) is ignored by Google and unused by Bing for ranking; all locales carry an English "text list to array" inside it.** Remove the tag and the key. `og:price:amount/currency` and `og:rich_attachment` (page.html:23-25) are irrelevant for a free tool.

**L3. Internal repetition.** Same claims restated 2-3x: nothing uploaded (how.lead, features.items[0], faq.items[6]), 50,000 lines (features.items[1], faq.items[5]), Dedupe (how.steps[1], features.items[4], faq.items[4]), Ctrl/Cmd+Enter (kbd hint, how.steps[2], features.items[6], faq.items[1]). Tolerable for FAQ/PAA targeting; trim the `features` duplicates or add new information instead.

**L4. Images / alt text.** 16 `<img>`: logo `alt="ArrayHelper logo"` (page.html:120, untranslated; the parent link already has a localised aria-label), icons with filename alts - `arrow-right` (142), `double-quote` (309), `single-quote` (312), `numbers-without-quote` (317), `numbers-quote` (321), `options` (326), `trash` (377) all sit inside buttons that already have `aria-label`, so use `alt=""`; `copy` x8 (163...) makes the accessible name "copy Copy Text", use `alt=""`. No content imagery: the repo's `src/images/Readme Image 1/2.png` screenshots are not on the site; one real screenshot with localised alt (new `formats.shotAlt` key) would help image search and show first-hand use. OG image alt is localised and correct (`meta.ogImageAlt`).

**L5. Authoritativeness: zero outbound citations.** Link 2-3 primary sources inline: RFC 8259 / MDN `JSON.stringify` (JSON escaping), Microsoft Learn on `N'` Unicode literals (SQL Server), MySQL/PostgreSQL string-literal docs. Improves Expertise/Authoritativeness and gives AI engines attributable facts. External authority/backlink profile not verifiable from this audit.

**L6. Freshness signals.** No visible date; JSON-LD has no `dateModified`; `softwareVersion` hard-coded "1.0" (build.mjs:181); sitemap `lastmod` = build time for all 26 URLs (build.mjs:326), so it reports "today" on every build regardless of change and may be ignored. Add a visible "Last updated" in the new about section and `dateModified` in the WebApplication node, or derive lastmod from file hashes.

**L7. Entity consistency.** "Array Helper" (`meta.appName`, WebApplication name) vs "ArrayHelper" (site name, logo, footer); `<meta name="author">` "Yavuz Selim YAZICI" (page.html:51) vs "Yavuz Selim Yazıcı" (JSON-LD, footer).

**L8. Sitewide commercial footer link.** "hosted by Atak Domain" with hard-coded `title="Domain"` (build.mjs:116) is a followed external link on all 26 pages. State the relationship in the about section; use `rel="sponsored"` if it is paid/partner placement. Header GitHub link (page.html:388) lacks `rel="noopener"`.

**L9. Above-the-fold prominence.** H1 renders at 14-15px (page.html:130) with the tagline at 12-14px, smaller than body copy; no ranking penalty, but the page's topic is weakly stated visually. `ui.tagline` ("Paste any list and instantly convert it into code-ready arrays.") is not answer-first; the real definition sits in FAQ #1. Rewrite as a one-sentence definition: "Free online tool that turns a list, one value per line, into a ready-to-paste JavaScript, SQL IN, Python, PHP, JSON or C# array - in your browser."

### INFO

- Near-duplicate neighbours: no vs da body similarity 0.86 (SequenceMatcher), es/pt 0.74, ru/uk 0.72. They are genuine translations (not copy-paste), so no duplicate-content concern; keep titles/H1s distinct.
- `FAQPage`/`HowTo` JSON-LD (build.mjs:189-216) no longer earns Google rich results; harmless, ~8.5 KB per page. Google states no special AI markup/files are needed; do not add llms.txt for Google's sake.
- `decode()` maps `&quot;` to a left curly quote (build.mjs:128); latent only, because no JSON-LD field currently contains `&quot;`.
- Technical items seen in passing (for the technical agent): `Content-Type: text/html` without charset (meta charset covers it); apex `https://arrayhelper.com/` returns 200 (canonical points to www) instead of redirecting.
- AI-assistance: no filler/AI-pattern phrase hits; mild "no X, no Y, no Z" triplet rhythm and 8 em dashes in en.json. Copy is clearly LLM-assisted in translation; it is accurate and consistent, so acceptable under the Sept 2025 QRG, but adding a human-review note in the about section would help the "How was it created" test.

## Structured findings (audit-data.json, Content Quality)

```json
{
  "category": "content",
  "scores": {"content_quality": 71, "eeat": 51, "ai_citation_readiness": 74, "on_page_seo": 82, "images": 55},
  "eeat": {"experience": "12/20", "expertise": "16/25", "authoritativeness": "9/25", "trustworthiness": "14/30"},
  "findings": [
    {"id": "H1", "severity": "high", "title": "Escaping claim false for raw/js/py/php", "keys": ["formats.lead", "features.lead", "features.items[2]"], "code": "src/js/core/converter.js:190"},
    {"id": "H2", "severity": "high", "title": "No privacy/about/contact while promising privacy; GA undisclosed", "keys": ["new: about.*, nav.about"], "template": "src/page.html:~492"},
    {"id": "M1", "severity": "medium", "title": "JSON validity and C# sample inaccurate", "keys": ["formats.cards[4].body", "formats.cards[5].body"], "code": "build.mjs:18; converter.js:94-118"},
    {"id": "M2", "severity": "medium", "title": "Dedupe label ambiguous in 21 locales", "keys": ["ui.settingsDedupe", "features.items[4].body", "faq.items[4].a"]},
    {"id": "M3", "severity": "medium", "title": "Translation precision: de zitiert, panel-label mismatch, es/ja wording", "keys": ["de: how.steps[1], formats.lead, formats.cards[6], useCases.cards[0], faq.items[3]"], "template": "src/page.html:159-278,363-370"},
    {"id": "M4", "severity": "medium", "title": "Non-descriptive aria-labels on output textareas", "template": "src/page.html:170,187,204,221,238,255,272,299"},
    {"id": "M5", "severity": "medium", "title": "Intent gaps: newline/column/comma-separated/generator", "keys": ["faq.items (+2)", "useCases.cards[0].title"]},
    {"id": "L1", "severity": "low", "title": "Title casing, duplicate no/da title, JS vs JavaScript, truncation risk", "keys": ["meta.title", "meta.description"]},
    {"id": "L2", "severity": "low", "title": "meta keywords and og:price tags unnecessary", "template": "src/page.html:23-25,50"},
    {"id": "L3", "severity": "low", "title": "Repeated claims across sections"},
    {"id": "L4", "severity": "low", "title": "Icon alt text and no content imagery", "template": "src/page.html:120,142,163...,309-326,377"},
    {"id": "L5", "severity": "low", "title": "No outbound citations"},
    {"id": "L6", "severity": "low", "title": "No dates; sitemap lastmod = build time", "code": "build.mjs:326,181"},
    {"id": "L7", "severity": "low", "title": "Brand/author name inconsistency", "keys": ["meta.appName"], "template": "src/page.html:51"},
    {"id": "L8", "severity": "low", "title": "Sitewide commercial footer link", "code": "build.mjs:116"},
    {"id": "L9", "severity": "low", "title": "H1 visually small; tagline not answer-first", "keys": ["ui.tagline"], "template": "src/page.html:130"}
  ]
}
```
