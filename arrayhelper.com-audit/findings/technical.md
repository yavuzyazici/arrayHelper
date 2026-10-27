# Technical SEO findings: https://www.arrayhelper.com/

Auditor: seo-technical (claude-seo) | Date: 2026-10-27 | Scope: 26 locale pages, robots.txt, sitemap.xml, headers, redirects, hreflang, mobile, rendering, 404s.
Method: curl (headers, redirects, 304, compression), node (TLS/ALPN/HTTP2, hreflang mesh validator over all 26 live pages, internal link crawl), bundled `sitemap_discovery.py`, `render_page.py --mode always`, `agentic_check.py`, `agent_ux_check.py`, Playwright mobile lab run (375x812). Only arrayhelper.com was fetched.

## Technical Score: 85/100 (measured categories; see caveats)

| Category | Status | Score | Checks behind the score |
|---|---|---|---|
| Crawlability | pass | 93 | robots.txt 200 and valid; sitemap valid (26 URLs); no noindex/X-Robots-Tag; no blocked CSS/JS; every page is 1 click from every other via the language nav. Minus: robots/sitemap cached 30 days. |
| Indexability | warn | 85 | Self-canonical correct on all 26 pages and on every URL variant tested; hreflang mesh perfect. Minus: non-www host serves a full 200 duplicate; /index.html 200 duplicates; no/da identical title. |
| Security | warn | 55 | HTTPS enforced (host level), TLS 1.3, valid cert to 2027-03-30, HTTP/2. Minus: zero security headers (no HSTS, nosniff, XFO, CSP, Referrer-Policy, Permissions-Policy). |
| URL Structure | warn | 85 | Clean lowercase `/<code>/` URLs, trailing slash consistent. Minus: 2-hop redirect for slashless http URLs; index.html variants. |
| Mobile | pass | 90 | viewport meta OK, no horizontal scroll at 375px, 16px base font, content parity (same HTML for all UAs). Minus: 5 footer links under 24px target height. |
| Core Web Vitals | pass (lab only) | 95 | Lab, mobile emulation: LCP 288 ms (H1 text), CLS 0, TTFB ~105 ms, 16 requests, ~48 KB total transfer. Field data (CrUX) and INP not measured: PSI keyless quota exhausted, no API key. |
| Structured Data | pass (detection only) | 85 | One JSON-LD block per page, parses, present in raw HTML. Full validation is delegated to seo-schema. |
| JS Rendering | pass | 97 | Static HTML (SSG): 1,369 words without JS, `is_spa:false`; canonical/robots/title identical raw vs rendered; 0 console errors; no JS redirects, no pushState/replaceState. |
| IndexNow | not measured | n/a | No key file discoverable without the key; Bing/Yandex only, 26 URLs, low value. |

Caveat: CWV figures are lab numbers from a fast machine, not field data. Treat them as "no render-blocking or layout problems found", not as CrUX results.

## What works

- Static pre-rendered HTML per locale (about 49 KB raw, 9.4 KB Brotli); content, canonical, robots, hreflang and JSON-LD are all in the initial response.
- hreflang: all 26 pages carry the identical 27-entry set (26 locales + x-default), each page self-references, every A->B has B->A (650 cross-locale return links checked, 0 missing), x-default -> `/` on every page, all URLs absolute https://www, trailing slashes match canonical, all codes valid (`zh-Hans` for /zh/, `no` for /no/). The sitemap carries the same set (26 URLs x 27 alternates = 702 `xhtml:link`s). `html lang` matches the hreflang code on every page.
- Canonical is www/https/trailing-slash and stays correct on `/index.html`, `?x=1`, `//de//` and the non-www host.
- Redirects: http->https is a 301; `/tr` -> `/tr/` is a 301.
- Compression and caching: Brotli on HTML/CSS/JS/SVG/XML (gzip fallback, `Vary: Accept-Encoding`). JS/CSS/fonts are `max-age=31536000, immutable` with content-hash `?v=`; HTML is `no-cache, must-revalidate` and returns 304 on If-Modified-Since.
- TLS 1.3, ALPN h2, h3 advertised via alt-svc, cert valid Sep 2026 to Mar 2027, covers apex and www.
- 404s return a real 404 status (no soft 404). Directory listing off (403). `.htaccess`, build files, package.json are not exposed.
- No geo/language auto-redirect and no IP-based content switching, so crawlers see every locale.
- All 42 unique internal URLs referenced from the 26 pages return 200.
- Back-button hijacking: none (no history manipulation in `src/js`). Server stack: no PHP/WordPress/Node signals, no `Server`/`X-Powered-By` disclosure, so the PHP CVE advisory does not apply.
- Googlebot, GPTBot and ClaudeBot user agents all receive 200 and identical content.

## Hreflang validation table (all 26 live pages)

| Locale | URL | hreflang | Self-ref | Return tags | x-default | Canonical match | Status |
|---|---|---|---|---|---|---|---|
| en | / | en | yes | 25/25 | yes | yes | pass |
| tr de bs es fr it pt ru ja ko ar nl pl sv da fi cs ro hu el hi uk ur | /<code>/ | same as code | yes | 25/25 | yes | yes | pass |
| zh | /zh/ | zh-Hans | yes | 25/25 | yes | yes | pass |
| no | /no/ | no | yes | 25/25 | yes | yes | pass |

Issues: Critical 0, High 0, Medium 0, Low 0 for hreflang. Two informational notes only: `no` is the Norwegian macrolanguage (accepted by Google; `nb` is the Bokmal-specific alternative, and og:locale is already `nb_NO`); /pt/ is declared `pt` with og:locale `pt_PT`, which is harmless but leaves Brazilian Portuguese users to the generic `pt` page.

## Critical

None.

## High

None.

## Medium

### M1. Apex (non-www) host serves a full 200 duplicate of the site; HTTPS/host redirects are not in the repo
Evidence: `http://arrayhelper.com/` -> 301 -> `https://arrayhelper.com/` -> **200** (no hop to www). `https://arrayhelper.com/de/`, `/robots.txt`, `/sitemap.xml` are also 200. Canonical on the apex pages correctly points to www, so Google will normally consolidate, but this relies on a hint rather than a redirect. `src/.htaccess` contains no RewriteRules, so the existing http->https 301 comes from the host/panel, not the deployed source (fragile if the hosting setup changes).
Fix (`src/.htaccess`, place before the existing blocks; test with `curl -I` after deploy so it does not stack with a panel-level "Force HTTPS"):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  # http and/or apex -> https://www in ONE 301
  RewriteCond %{HTTPS} !=on [OR]
  RewriteCond %{HTTP_HOST} !^www\.arrayhelper\.com$ [NC]
  RewriteRule ^ https://www.arrayhelper.com%{REQUEST_URI} [R=301,L]
</IfModule>
```

### M2. No security response headers at all
Evidence: `curl -I` on `/` returns only Cache-Control/Expires/Content-Type/Last-Modified/Content-Length/alt-svc. Missing: Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options (or CSP frame-ancestors), Content-Security-Policy, Referrer-Policy, Permissions-Policy. Ranking impact is small (HTTPS is the lightweight signal, and it is in place); this is hygiene and trust.
Fix (`src/.htaccess`, inside the existing `<IfModule mod_headers.c>`):
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
# Start in report-only: page has an inline gtag snippet and loads Monaco (AMD loader + blob workers) from jsDelivr
Header always set Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://cdn.jsdelivr.net; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
```
Only add `includeSubDomains` if every arrayhelper.com subdomain is HTTPS. Do not add `preload` until HSTS has run cleanly for a while. Confirm Monaco ("Ultra" editor) still works before switching CSP from report-only to enforcing.

## Low

### L1. `/index.html`, `/<code>/index.html` and `//` return 200
Evidence: `https://www.arrayhelper.com/index.html` 200, `/tr/index.html` 200, `//de//` 200; all self-canonicalize to the clean URL, so harmless today. Fix (`src/.htaccess`, in the same rewrite block): `RewriteCond %{THE_REQUEST} \s/(.*/)?index\.html[\s?]` then `RewriteRule ^(.*/)?index\.html$ /$1 [R=301,L]`.

### L2. Two-hop redirect for slashless http URLs
Evidence: `http://www.arrayhelper.com/tr` -> `https://www.arrayhelper.com/tr` -> `https://www.arrayhelper.com/tr/` (2 hops). Internal links already use the slash form, so only stray inbound links are affected. Fix (`src/.htaccess`): add, before the M1 rule, `RewriteCond %{REQUEST_FILENAME} -d` + `RewriteRule ^(.+[^/])$ https://www.arrayhelper.com/$1/ [R=301,L]`.

### L3. robots.txt and sitemap.xml are cached for 30 days; robots.txt has no trailing newline
Evidence: both return `Cache-Control: public, max-age=2592000` (from `ExpiresDefault "access plus 1 month"`). Google may honour max-age when caching robots.txt, so a future robots change could be picked up late. `src/robots.txt` ends without a newline after the Sitemap line (valid, but fragile for naive parsers).
Fix: `src/.htaccess` add `ExpiresByType text/plain "access plus 1 hour"` and `ExpiresByType application/xml "access plus 1 day"`; `src/robots.txt` add a final newline. Optional: the `Disallow: /cgi-bin/` line is vestigial on a static site.

### L4. sitemap `lastmod` is the build date on all 26 URLs
Evidence: every `<lastmod>` is 2026-09-06 (`new Date()` in `build.mjs` `lastmod`). An always-identical lastmod gets ignored by Google. Fix (`build.mjs`): per locale, use the newest mtime/git-commit date of `src/i18n/<code>.json` and `src/page.html`.

### L5. Default server 404 page; `/en/` is a 404
Evidence: unknown paths return 404 with the host's generic page (no site branding, no link home); status is correct. `/en/` 404s although the English version lives at `/`. Fix (`src/.htaccess` + new `src/404.html`): `ErrorDocument 404 /404.html` with a noindex-free simple page linking to `/`; optionally `Redirect 301 /en/ /`.

### L6. Asset and metadata hygiene
- `og:image:width/height` say 1200x630 but `/images/arrayHelper-og.png` is 2121x1114 (`src/page.html`; resize the PNG to 1200x630 or fix the two meta values).
- `src/browserconfig.xml` references `https://arrayhelper.com/images/icons/icon.png` (apex); change to `https://www.arrayhelper.com/...`.
- `<link rel="icon" type="image/x-icon" href="/images/icons/icon.png">` in `src/page.html` mislabels a PNG as x-icon; remove it or ship a real `/favicon.ico` (currently 404 on every browser/crawler probe).
- `src/images/Readme Image 1.png` / `Readme Image 2.png` are published at `/images/Readme%20Image%201.png` (78 KB, unreferenced). Narrow `STATIC_ENTRIES` in `build.mjs` or move them out of `src/images/`.

### L7. Footer touch targets under 24 px
Evidence: Playwright at 375 px: footer links "Atak Domain" 80x17, "Guide" 37x21, "FAQ" 25x21, "GitHub" 42x21, author link 112x21 (WCAG 2.2 AA 2.5.8 asks for 24 px). Fix: add `padding-block` / `min-height: 24px` for `.footer-links a` in `src/styles/`.

### L8. Title/description polish (on-page, flagged for the content agent)
`no` and `da` share the identical title ("Konverter Tekstliste til Array - JavaScript, SQL, Python, PHP"); differentiate in `src/i18n/no.json` and `src/i18n/da.json` (needs native review). Meta descriptions over about 160 chars will be truncated: fi 172, hu 171, ro 170, el 168, es 167, nl 167, no 166, sv 165 (`meta.description` in those `src/i18n/*.json`).

### L9. Monaco loading and JS robustness
`<link rel="preconnect" href="https://cdn.jsdelivr.net">` in `src/page.html` fires on every load, but Monaco is only fetched when the visitor hovers/clicks "Ultra" or has `editorMode=ultra` stored; consider dropping the preconnect. Monaco is injected without SRI. `localStorage.getItem` / `JSON.parse(localStorage.getItem('userOptions'))` in `src/js/core/editor.js` and `src/js/main.js` are unguarded, so blocked or corrupted storage will throw and stop the app (wrap in try/catch). The static content does not depend on this JS.

## Info

- AI crawlers: no named groups; GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended etc. all fall through to `User-agent: *` (allowed). This is a policy choice, not a defect. No Content-Signal line. Agent UX heuristic score 96/100 (one input without label).
- Googlebot 2 MB fetch cap: HTML is about 49-68 KB across locales (hi largest at 67.8 KB raw), far below the limit.
- Vestigial tags with no search value: `meta keywords`, `X-UA-Compatible`, `og:price:*`, `og:rich_attachment`, DC.* metas, `<meta name="google" content="notranslate">` (blocks Chrome/Google Translate prompts; harmless on a site that already ships 26 languages). `referrer` meta duplicates the browser default.
- Hreflang is emitted in both HTML and sitemap; they are identical, so the redundancy is safe.
- JSON-LD: FAQPage and HowTo no longer produce rich results for a site of this type, and SoftwareApplication needs ratings to qualify; leave validation and strategy to seo-schema.
- The sitewide followed footer link to atakdomain.com (owner-related domain) is on every locale; content/link agents may want to judge it.
- IndexNow not detected (Bing/Yandex/Naver only). Optional, low value for 26 URLs.
- CWV field data unavailable: PSI keyless quota was exhausted (`error: PSI rate limit exceeded`), no CrUX key configured. Re-run `pagespeed_check.py` / `crux_history.py --form-factor PHONE` with an API key to get field LCP/INP/CLS.

## Evidence index

- Headers: `curl -I https://www.arrayhelper.com/` (no security headers; `Cache-Control: no-cache, must-revalidate`; `alt-svc: h3`).
- Redirect matrix: http(s) x www/apex x slash/no-slash x `/index.html` (see M1, L1, L2).
- Hreflang validator output: 0 issues across 26 pages (the single "self count 2" on `/` is expected because en and x-default share the URL).
- Lab run JSON: LCP 288 ms (H1), FCP 288 ms, CLS 0, TTFB 141 ms (first load), load 299 ms, scrollWidth 375 = viewport.
- Screenshot: `arrayhelper.com-audit/screenshots/www_arrayhelper_com_mobile.png`.
