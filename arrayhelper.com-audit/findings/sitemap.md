# Sitemap Audit - https://www.arrayhelper.com/

Agent: seo-sitemap | Date: 2026-10-27 | Score: **92 / 100**

## Summary

Single `urlset` sitemap at `/sitemap.xml`, declared in `robots.txt`. 26 `<loc>` entries (1 root + 25 locale directories), each with 27 `xhtml:link` hreflang alternates (26 locales + `x-default`). All 26 URLs return 200 directly (no redirects), are self-canonical, indexable, and carry HTML hreflang sets identical to the sitemap's. Coverage versus a crawl is 100% with no orphans. No Critical or High issues. Remaining findings are maintenance and robustness items.

## Validation report (pass/fail)

| Check | Result | Evidence |
|---|---|---|
| Discovery (`sitemap_discovery.py`) | PASS | `found`: `https://www.arrayhelper.com/sitemap.xml`, source robots.txt, 200, kind `urlset`, valid=true. Common paths (`sitemap_index.xml`, `sitemap-index.xml`, `wp-sitemap.xml`) return 404, as expected. |
| Well-formed XML / namespaces | PASS | Parses cleanly. `sitemap/0.9` and `xhtml` namespaces declared. No BOM. UTF-8. |
| Size limits (<=50,000 URLs and <=50 MB) | PASS | 26 URLs, 63,936 bytes. Served `Content-Encoding: br`, `Content-Type: application/xml`. |
| Duplicates / HTTP / host mix | PASS | 0 duplicate `<loc>`, 0 non-HTTPS, all on `www`. |
| Deprecated tags | PASS | 0 `<priority>`, 0 `<changefreq>`. |
| Every `<loc>` returns 200 | PASS | 26/26 are 200 with no redirect hop (checked with redirects disabled; Googlebot UA also 200). |
| Self-referencing canonical | PASS | 26/26 `<link rel="canonical">` equals the `<loc>` exactly. `og:url` matches too. |
| No noindex | PASS | All have `<meta name="robots" content="index, follow">`. No `X-Robots-Tag` header on any URL. |
| hreflang sitemap vs HTML | PASS | All 26 pages: the 27 HTML `<link rel="alternate" hreflang>` entries equal the 27 sitemap `xhtml:link` entries. Self-reference present, `x-default` is `https://www.arrayhelper.com/` everywhere. All hrefs are in the `<loc>` set. Codes valid (`zh-Hans`, `no`, etc.). |
| Coverage vs crawl | PASS | Crawl of all 26 pages yields exactly 26 distinct internal HTML targets (the language nav on every page links all 26). Nothing is in the sitemap but unreachable, or reachable but missing from the sitemap. |
| robots.txt declaration | PASS | `Sitemap: https://www.arrayhelper.com/sitemap.xml` (absolute, HTTPS, www). Only `Disallow: /cgi-bin/`, so no pages, CSS, JS or images are blocked. |
| Conditional GET | PASS | `If-Modified-Since` returns 304. `Last-Modified` header is present. |
| lastmod format | PASS | `YYYY-MM-DD` is valid W3C Datetime. |
| lastmod accuracy | WARN | See finding L1. Currently accurate by coincidence, but the generator design is unreliable. |
| Location-page quality gate | PASS / N/A | 26 pages is under the 30-page warning threshold. These are full translations of one tool page, not city-swapped doorways. See I2. |

## What works

- Correct hreflang annotation in both HTML and sitemap, generated from the same `locales` array, so the two cannot drift.
- Clean 200s, self-canonicals and a coherent `x-default`.
- Sitemap is robots-declared and supports conditional GET and Brotli.
- Locale JSONs are essentially fully translated: 0% untranslated long strings in 24 locales and 0.3% (about 4 words) in `nl`, so the 60%+ unique-content gate is met on the content side.
- The build only emits locales that have a `src/i18n/<code>.json`, so the sitemap cannot list a page that was not built.

## Findings

### Medium

**M1. Apex host `https://arrayhelper.com/` serves a full 200 duplicate instead of redirecting to www.**
Evidence: `http://arrayhelper.com/` returns 301 to `https://arrayhelper.com/`, which returns **200** and serves the page (also `/tr/` on the apex). The canonical on those copies points to the `www` URL, which mitigates the duplication, but the apex is not consolidated by redirect. The sitemap itself only uses `www`, so this does not break the sitemap. It does split signals and crawl budget.
Fix: add an apex-to-www 301 to `src/.htaccess` (copied to `dist/` by `STATIC_ENTRIES` in `build.mjs`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} !^www\. [NC]
  RewriteRule ^ https://www.arrayhelper.com%{REQUEST_URI} [R=301,L]
</IfModule>
```
If the redirect is meant to live at the CDN or hosting-panel layer, configure it there instead.

### Low

**L1. `<lastmod>` is the build date for every URL (`build.mjs`, `buildSitemap()` / line `const lastmod = new Date().toISOString().slice(0, 10)`).**
Evidence: all 26 entries have `2026-09-06`. The date is currently truthful: the live files were deployed 2026-09-06 19:45 GMT (`Last-Modified`) and the last content commit is `b9cafef` 2026-09-06 22:43 +03; HEAD commit `9d0d752` (2026-10-27) only added the SEO skill. The design is the problem: any rebuild, including one that touches a single locale or only build config, bumps all 26 dates. Google only trusts `lastmod` when it is consistently accurate, so uniform and always-fresh values teach it to ignore the field. Also `toISOString()` is UTC, so a late-night deploy in UTC+3 can be dated a day early.
Fix in `E:\Github\arrayHelper\build.mjs`: compute `lastmod` per locale as the later of the git commit date of `src/page.html` (shared template, legitimately affects all locales) and `src/i18n/<code>.json`, for example `execFileSync('git', ['log','-1','--format=%cs','--',file])`, with the build date as fallback when git history is unavailable (shallow CI clone). Pass `lastmod(locale)` into `buildSitemap()` instead of a single string. Alternatively keep a committed `lastmod.json` of content hashes to dates. Omit `<lastmod>` rather than emit a wrong value.

**L2. `sitemap.xml` and `robots.txt` are cached for 30 days.**
Evidence: both respond `Cache-Control: public, max-age=2592000` / `Expires: Thu, 26 Nov 2026`, from `ExpiresDefault "access plus 1 month"` in `src/.htaccess` (HTML is no-cache, JS/CSS/fonts immutable, but XML and text fall through to the default). Google's crawler uses conditional requests and may honor `max-age` for robots.txt, and shared proxies and CDNs can serve a stale sitemap or robots.txt after a deploy.
Fix: in the `mod_expires` block of `src/.htaccess` add `ExpiresByType application/xml "access plus 1 day"` and `ExpiresByType text/plain "access plus 1 day"`. Also add `application/xml` to the `BROTLI_COMPRESS` and `DEFLATE` lists (currently only `text/xml`); it is compressed today only by server defaults.

**L3. `/index.html` and `/<code>/index.html` return 200 duplicates.**
Evidence: `/index.html` and `/tr/index.html` both return 200, each with a correct self-canonical (`https://www.arrayhelper.com/` and `.../tr/`), so impact is minor. They are not in the sitemap and not linked internally.
Fix: add to `src/.htaccess`: `RewriteCond %{THE_REQUEST} \s/+(.*/)?index\.html[\s?] [NC]` then `RewriteRule ^ /%1 [R=301,L]`.

### Info

- **I1. Both HTML hreflang and sitemap hreflang are published.** They are identical today, which is fine. Google needs only one method. Keeping both is acceptable because both come from `locales.json`. If the HTML block is ever slimmed for page weight, the sitemap alone is sufficient.
- **I2. Quality gate.** 26 pages are under the 30-page warning, with headroom for only 4 more locales before the WARNING tier (60%+ unique content per page). Only the `meta.title` of `da` and `no` is identical (`Konverter Tekstliste til Array...`); differentiate it and the meta description in `src/i18n/da.json` and `src/i18n/no.json`. If translations are machine-generated, have native reviewers check the top-traffic locales, because Google treats unreviewed mass auto-translation as a scaled-content risk.
- **I3. Scaling note.** Each `<url>` embeds all 27 alternates (about 2.4 KB per URL), so the 50 MB cap would be hit at about 20,000 URLs, well before 50,000. Irrelevant at 26 URLs; if tool pages are added later, split into per-page-group sitemaps plus a sitemap index.
- **I4. Search Console and Bing Webmaster submission is not verifiable from outside.** The sitemap is discoverable via robots.txt. Submit it in both consoles and watch the "Alternate page with proper canonical" and hreflang reports.
- **I5. `no` as hreflang** is valid and accepted by Google (the macro-language). `nb` would be more specific, so no change is needed.

## Quality-gate result

Location-page thresholds: not triggered (26 < 30, and the pages are real translations of one tool, not geo-swapped doorways).

## Scoring

100 minus 3 (M1 apex duplicate) minus 3 (L1 build-date lastmod) minus 1 (L2 cache TTL) minus 1 (L3 index.html) = **92**. Rounded to include the da/no title duplicate (I2): **92**.

## Structured findings (audit-data.json, category "Sitemap")

```json
{
  "category": "Sitemap",
  "score": 92,
  "checks_passed": ["discovery","xml_valid","size_limits","urls_200","self_canonical","no_noindex","hreflang_sitemap_vs_html","coverage_100pct","robots_declared","no_deprecated_tags","https_only","conditional_get"],
  "findings": [
    {"severity":"Medium","id":"M1","title":"Apex host serves 200 duplicate instead of 301 to www","file":"src/.htaccess"},
    {"severity":"Low","id":"L1","title":"lastmod is build date for all URLs","file":"build.mjs"},
    {"severity":"Low","id":"L2","title":"sitemap.xml/robots.txt cached 30 days","file":"src/.htaccess"},
    {"severity":"Low","id":"L3","title":"index.html paths return 200 duplicates","file":"src/.htaccess"},
    {"severity":"Info","id":"I2","title":"da/no identical meta.title; 26 locales near 30-page gate","file":"src/i18n/da.json, src/i18n/no.json"}
  ]
}
```
