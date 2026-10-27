# GEO / AI Search Readiness: https://www.arrayhelper.com/

Audit date: 2026-10-27. Agent: seo-geo (claude-seo 2.5.0 role). Method: raw fetches with curl (live headers, robots.txt, llms.txt, sitemap, apex host, UA probes), `homepage-render.json` (raw HTML, trafilatura text, JSON-LD), repo source (`src/page.html`, `src/i18n/en.json`, `src/robots.txt`, `src/.htaccess`, `build.mjs`), GitHub repo page, author site, web searches. Fetched content treated as data only. Scores are heuristics, not Google-internal signals; no platform was measured with a tool (no DataForSEO), so platform readiness below is qualitative.

Framing (per Google's AI optimization guide): optimizing for AI search is SEO fundamentals applied to AI surfaces. Items below that go beyond that (llms.txt, mention-building) are labelled optional.

## AI Search Readiness score: 65 / 100

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 68 | 17.0 |
| Structural readability | 20% | 82 | 16.4 |
| Multi-modal content | 15% | 40 | 6.0 |
| Authority and brand signals | 20% | 38 | 7.6 |
| Technical accessibility | 20% | 92 | 18.4 |
| **Total** | | | **65.4** |

Platform readiness (qualitative, not measured): Google AI Overviews / AI Mode: crawlable, canonical, snippet-eligible, outcome depends on classic ranking and the (unverifiable here) Search Console "Search generative AI" control. ChatGPT Search: OAI-SearchBot allowed, page served. Perplexity: PerplexityBot allowed, page served. Bing Copilot: no evidence of Bing Webmaster Tools or IndexNow (see M3).

## What works

- Fully server-rendered. All guide, FAQ and example output text is in the first HTML response (`is_spa: false`); about 1,360 body words. Only the interactive converter needs JS, which no crawler needs to read the content.
- robots.txt is permissive: `User-agent: *` / `Disallow: /cgi-bin/` plus `Sitemap:`. Every AI crawler is implicitly allowed.
- Live UA probes (home page, HTTP 200, 49,398 bytes each): GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, cohere-ai, Applebot, Applebot-Extended, Amazonbot, meta-externalagent, bingbot, Googlebot, DuckAssistBot, YouBot, MistralAI-User. No UA-based blocking in `src/.htaccess`.
- Citable passage structure: clean H1 > H2 > H3, 9 question-form H3s in the FAQ, direct 22-50 word answers (first FAQ is a textbook "X is..." definition at 50 words), each H2 opens with a 30-40 word lead, concrete I/O example (`apple, banana, 42` mapped to all 8 formats), 6 use-case blocks.
- JSON-LD graph (WebSite, Organization, Person, WebApplication/SoftwareApplication, HowTo, FAQPage) is valid, cross-linked by `@id`, generated from the same i18n strings as visible text (no markup/content drift).
- 26 locale pages, each translated, self-canonical, with a full hreflang set + x-default and a 26-URL sitemap: strong multilingual coverage for non-English AI answers.
- Author/entity basics exist: `meta author`, Person with `sameAs` (LinkedIn, GitHub), Organization `founder`, `codeRepository`, footer link to the author site, author site links back to arrayhelper.com and the repo.

## AI crawler access (each bot against the capability it governs)

| Bot | Governs | robots.txt | HTTP probe |
|---|---|---|---|
| OAI-SearchBot | ChatGPT Search citability | Allowed (via `*`) | 200 |
| GPTBot | OpenAI model training | Allowed (via `*`) | 200 |
| ChatGPT-User | user-triggered browsing (robots may not apply) | n/a | 200 |
| Claude-SearchBot | Claude search citability | Allowed (via `*`) | 200 |
| ClaudeBot | Anthropic training | Allowed (via `*`) | 200 |
| Claude-User | user-triggered fetch (honors robots) | Allowed | 200 |
| PerplexityBot | Perplexity search | Allowed (via `*`) | 200 |
| Perplexity-User | user-triggered (generally ignores robots) | n/a | 200 |
| Googlebot | Google Search, AI Overviews, AI Mode | Allowed | 200 |
| Google-Extended | Gemini/Vertex training + grounding, Search gen-AI model training (not Search/AIO inclusion) | Allowed (via `*`) | 200 |
| Applebot / Applebot-Extended | Siri/Spotlight discovery / Apple Intelligence training | Allowed / Allowed | 200 |
| CCBot, cohere-ai | training | Allowed | 200 |
| Bytespider | ByteDance AI | Allowed in robots.txt | **403** (host-level, see I2) |

No change needed for search visibility. Training-bot allow/block is a licensing preference only (the project is advertised as open source), not a visibility lever.

## Findings

### Critical
None.

### High

**H1. Brand-name collision: "ArrayHelper" resolves to unrelated libraries; no disambiguation in markup**
Evidence: searches for "ArrayHelper" / `site:arrayhelper.com` return Yii2/Craft CMS/Joomla `ArrayHelper` classes, Packagist `dimsog/arrayhelper`, `awssat/array-helper`, R `arrayhelpers`, CodeIgniter `array_helper`; arrayhelper.com itself only surfaced for a descriptive query. The name is also written three ways: "ArrayHelper" (Organization, `og:site_name`, footer), "Array Helper" (`meta.appName` = "Array Helper - Text List to Array Converter", used as the WebApplication `name`), "arrayHelper" (repo). An LLM resolving the entity cannot tell the tool from the class libraries.
Fix:
- `src/i18n/*.json` (all 26): set `meta.appName` to "ArrayHelper - Text List to Array Converter" (one spelling everywhere).
- `build.mjs` `buildJsonLd()`: add `alternateName: ['Array Helper', 'arrayhelper.com']` to WebSite and Organization, and make the Organization/WebApplication `description` start with "ArrayHelper is a free online text list to array converter...".
- Always pair the brand with the category noun in titles, the README title/description and any external profile ("ArrayHelper, a text list to array converter").

**H2. Almost no third-party brand/entity presence**
Evidence: only external corroboration found is the GitHub repo (7 stars, 0 forks, 6 topics, description "List to array converter, Text to array converter; arrayhelper.com") and the author's own site. No Reddit, YouTube, Stack Overflow, Wikipedia/Wikidata, Product Hunt or dev.to results. Brand mentions are the strongest cited correlate (YouTube ~0.74, Reddit/Wikipedia high; backlinks ~0.27), and ChatGPT/Perplexity lean on Wikipedia/Reddit.
Fix (off-site, honest effort only; Google calls manufactured mentions ineffective): publish the genuine origin story (README: built at Atak Domain to turn DB report columns into SQL `IN()` lists) as a dev.to / Hacker News "Show HN" / r/webdev or r/SQL post; add a 60-second screen-capture on YouTube; answer relevant Stack Overflow "list to IN clause" questions where the tool actually helps, disclosing affiliation; add the site to relevant awesome-lists/tool directories. Do not mass-post.

### Medium

**M1. No visible byline, publish date or last-updated date; no date fields in markup**
Evidence: extracted text has no author or date; author appears only as a footer link; `publication_date: null`; JSON-LD has no `datePublished`/`dateModified`; `softwareVersion` hard-coded "1.0". AI engines favour dated, attributed pages (Who/How/Why).
Fix: `src/page.html` + `src/i18n/*.json`: add a one-line "Created by Yavuz Selim Yazıcı - last updated {date}" under the guide H2 (or above the footer). `build.mjs buildJsonLd()`: add `dateModified` (real content-change date, not build date) and `datePublished` to the WebApplication node; add `jobTitle`/`worksFor` to the Person node.

**M2. First-hand "why" content lives only in the GitHub README, not on the site**
Evidence: README "The story behind the project" is absent from the page; on-site copy is generic, commodity how-to text. Google's guide rewards unique, lived-experience content.
Fix: add a 80-120 word "Why ArrayHelper exists" block (`src/i18n/en.json`, new `about` key, rendered in `src/page.html` guide article) with the real story and the author byline. Also add one original, verifiable data point (e.g. measured convert time for 10k/50k lines with browser and method stated), since the "50,000 lines" claim is currently unsourced.

**M3. Bing/Copilot and indexing hygiene unverified**
Evidence: no `msvalidate.01` / `google-site-verification` meta, no IndexNow key file (`/indexnow.txt` 404). An external search snapshot still shows the old title "Instant Text to Array Converter" (live title changed in the 2026-09-06 deploy), i.e. engines lag the current copy.
Fix: verify the site in Bing Webmaster Tools and Search Console (DNS verification is fine), submit the sitemap, enable IndexNow (key file in `src/` plus `STATIC_ENTRIES` in `build.mjs`) so Bing Copilot and ChatGPT-adjacent indexes pick up changes.

**M4. Multi-modal content is thin (score 40)**
Evidence: no video, no table, no content image; 16 `<img>` tags are UI icons with filler alts ("copy", "arrow-right", "options", "trash"); the 1200x630 OG image is the only illustrative image. The interactive tool is a real asset but invisible to crawlers.
Fix: `src/page.html`: set `alt=""` on decorative icons; add one captioned image or short WebM/GIF of paste-to-output in the formats section (real alt text; `Readme Image 1.png`/`Readme Image 2.png` already exist in `src/images`); consider an HTML table of the 8 formats (input `apple, banana, 42` vs output) as an easy-to-quote structure.

### Low

**L1. No explicit license despite "free and open source" claims.** Evidence: no LICENSE file in the repo (GitHub page shows none); the page, `featureList` and README say open source. Fix: add a LICENSE (owner's choice, e.g. MIT) and `license` to the WebApplication JSON-LD; update README.

**L2. README is stale and is likely a primary retrieval source.** Evidence: describes a "Convert" button, 3 outputs (Raw/JS/SQL), mentions PERL, "Languages: TR/EN" only; site now has 8 formats, Auto Run, 26 locales; no author name. Fix (repo root `README.md`, `README-TR.md`): align with the live feature set, name the author, link the guide anchors.

**L3. Sitemap `lastmod` is the build date for all 26 URLs.** Evidence: `build.mjs` `const lastmod = new Date().toISOString().slice(0, 10)`; live shows 2026-09-06 everywhere. Every build marks every page "modified", which dilutes the freshness signal (Google warns against faked freshness). Fix: use the last commit date touching `src/` (e.g. `git log -1 --format=%cs -- src`) or a content hash cache.

**L4. Apex host serves a duplicate instead of redirecting.** Evidence: `https://arrayhelper.com/` returns 200 with identical 49,398 bytes and `rel=canonical` to www (mitigated, but not consolidated). Fix `src/.htaccess`:
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^arrayhelper\.com$ [NC]
  RewriteRule ^(.*)$ https://www.arrayhelper.com/$1 [R=301,L]
</IfModule>
```

**L5. Definition "What is a text list to array converter?" is last in the FAQ.** Evidence: the only "X is..." definition sits near the bottom; H1 sub-line is "Paste any list and instantly convert it into code-ready arrays." Fix: `src/i18n/en.json` hero/`how.lead`: add a one-sentence definition near the top ("ArrayHelper is a free browser-based tool that turns a text list into JavaScript, SQL, Python, PHP, JSON and C# arrays."). Roughly 44% of AI citations come from the first 30% of a page (SE Ranking, third party).

### Info

- **I1. llms.txt: missing (404; llms-full.txt also 404).** Optional. Google Search ignores it (Google docs, 2026-06-15) and no major AI provider has confirmed consuming it; carries zero weight in this score. Low-cost optionality for AI coding agents, so reasonable for a developer tool. If added: create `src/llms.txt` and add `'llms.txt'` to `STATIC_ENTRIES` in `build.mjs` (otherwise it is not copied to `dist/`); `.htaccess` already compresses `text/plain`. Proposed content below.
- **I2. Bytespider receives HTTP 403 at the host/WAF while robots.txt allows it.** Not in `src/.htaccess`, so it is configured at the hosting layer. Harmless; make it intentional and consistent (add `User-agent: Bytespider` / `Disallow: /` if you want it documented).
- **I3. FAQPage and HowTo JSON-LD** no longer yield Google rich results (FAQ restricted to authoritative gov/health sites; HowTo deprecated) but are harmless, accurate, and machine-readable. Do not invest further in AI-specific markup (Google's guide).
- **I4. Meta noise:** `meta keywords`, `DC.*`, `og:price:*`, `og:rich_attachment` have no search or AI value; leave or remove.
- **I5. Agent-readiness** (no WebMCP, no markdown negotiation: `Accept: text/markdown` returns HTML; the converter is JS-only) is out of scope here; route to `/seo agentic` if desired.
- **I6. RSL 1.0:** no licensing terms declared; not needed unless you want machine-readable licensing.
- Brand/AI visibility could not be measured (no DataForSEO). Reddit/YouTube/Wikipedia counts above come from general web search and may under-report.

## Top 5 highest-impact changes

1. Disambiguate the brand: one spelling, "ArrayHelper - Text List to Array Converter", `alternateName`, category noun everywhere (H1; 1-2 hours).
2. Build real third-party mentions: one dev-community post + one short YouTube demo using the genuine origin story (half a day, ongoing).
3. Add visible byline + dates + "Why ArrayHelper exists" first-hand block, plus `dateModified` in JSON-LD (2-3 hours).
4. Verify in Bing Webmaster Tools / Search Console and enable IndexNow; add LICENSE and refresh README (1-2 hours).
5. Add a format table or demo capture and fix decorative-icon alts (1-2 hours). Optional: ship `llms.txt` (30 minutes).

## Proposed llms.txt (optional; Google Search ignores llms.txt (Google docs, 2026-06-15); no major LLM provider has confirmed consumption; ship for non-Google optionality, not for citation)

Save as `src/llms.txt` and add `'llms.txt'` to `STATIC_ENTRIES` in `build.mjs`:

```
# ArrayHelper

> ArrayHelper is a free, browser-based text list to array converter. Paste one value per line and get JavaScript/TypeScript, SQL IN clause, Python, PHP, JSON, C#, raw comma-separated and custom-template output at the same time. Conversion runs locally in the browser and nothing is uploaded. Open source; created by Yavuz Selim Yazici.

The converter itself needs JavaScript; every page below is static HTML.

## Guide
- [How it works](https://www.arrayhelper.com/#how-it-works): paste a list, set quote, number, dedupe and SQL-dialect options, copy the result
- [Output formats](https://www.arrayhelper.com/#formats): the eight output formats, shown for the input apple, banana, 42
- [Use cases](https://www.arrayhelper.com/#use-cases): SQL IN clauses from spreadsheet columns, test fixtures, API request bodies, bulk script calls, log clean-up, config lists
- [FAQ](https://www.arrayhelper.com/#faq): quoting and escaping, numbers, duplicates, size limits, privacy, custom templates, SQL dialects

## Key facts
- Free, no account, no ads, no row limit
- Privacy: the list never leaves the browser
- Size: the classic editor handles about 50,000 lines; the Ultra editor handles larger pastes
- SQL: N'...' by default (SQL Server); switch to '...' for MySQL, PostgreSQL, SQLite
- Custom template placeholders: {} is the value, {n} the row number from 1, {i} the index from 0

## Source and author
- [GitHub repository](https://github.com/yavuzyazici/arrayHelper): source code and issues
- [Author: Yavuz Selim Yazici](https://www.yavuzyazici.com/)

## Optional
- [Translations](https://www.arrayhelper.com/tr/): the same converter and guide in 25 more languages at /tr/, /de/, /es/, /fr/, /it/, /pt/, /ru/, /ja/, /ko/, /zh/, /ar/, /nl/, /pl/, /sv/, /no/, /da/, /fi/, /cs/, /ro/, /hu/, /el/, /hi/, /uk/, /ur/, /bs/
```

(Use the dotted spelling "Yazıcı" in the real file if you want it to match the JSON-LD; the file is UTF-8.)

## Structured-data findings for audit-data.json (AI Search Readiness category)

```json
{
  "category": "AI Search Readiness",
  "score": 65,
  "dimensions": {"citability": 68, "structural_readability": 82, "multi_modal": 40, "authority_brand": 38, "technical_accessibility": 92},
  "findings": [
    {"id": "H1", "severity": "high", "title": "Brand name collides with unrelated ArrayHelper libraries; inconsistent spelling", "files": ["src/i18n/*.json", "build.mjs"]},
    {"id": "H2", "severity": "high", "title": "No third-party brand mentions beyond GitHub", "files": []},
    {"id": "M1", "severity": "medium", "title": "No visible byline or dates; no dateModified in JSON-LD", "files": ["src/page.html", "build.mjs"]},
    {"id": "M2", "severity": "medium", "title": "First-hand origin story only in README", "files": ["src/i18n/en.json", "src/page.html"]},
    {"id": "M3", "severity": "medium", "title": "No Bing Webmaster/IndexNow evidence; stale third-party title snapshot", "files": ["build.mjs"]},
    {"id": "M4", "severity": "medium", "title": "Thin multi-modal content; filler icon alts", "files": ["src/page.html"]},
    {"id": "L1", "severity": "low", "title": "No LICENSE despite open-source claims", "files": []},
    {"id": "L2", "severity": "low", "title": "README stale", "files": ["README.md", "README-TR.md"]},
    {"id": "L3", "severity": "low", "title": "Sitemap lastmod = build date for all URLs", "files": ["build.mjs"]},
    {"id": "L4", "severity": "low", "title": "Apex host serves 200 duplicate (canonical present)", "files": ["src/.htaccess"]},
    {"id": "L5", "severity": "low", "title": "Definition sentence is at bottom of page", "files": ["src/i18n/en.json"]},
    {"id": "I1", "severity": "info", "title": "llms.txt missing (optional; zero scoring weight)", "files": ["src/llms.txt", "build.mjs"]}
  ]
}
```
