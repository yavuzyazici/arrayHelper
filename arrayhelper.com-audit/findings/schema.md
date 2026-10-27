# Schema / Structured Data Findings - arrayhelper.com

Agent: claude-seo `seo-schema` | Date: 2026-10-27 | Scope: https://www.arrayhelper.com/ + 25 locale pages (26 total)
Business type: free developer tool / web app (no account, no ads, runs client-side)

## Score: 72 / 100

| Area | Score | Note |
|---|---|---|
| Delivery and syntax | 15/15 | One server-rendered `application/ld+json` block per page, valid JSON, `@context` = `https://schema.org`, identical structure on all 26 locales |
| @id graph integrity | 14/15 | 0 dangling refs, 0 duplicate ids on all 26 pages; app/HowTo/FAQ ids are per-locale while Org/Person are global |
| Type correctness / deprecated hygiene | 10/20 | Deprecated HowTo shipped on all pages; 2 off-domain properties; redundant multi-typing |
| Property completeness | 12/25 | No image/screenshot/isAccessibleForFree, weak Organization logo, no WebPage node, no primary image |
| Rich-result eligibility | 11/15 | No Google SERP feature is reachable today (FAQ and HowTo retired, Software-app needs a genuine rating/review, logo weak); partly by design, not penalised fully |
| Locale consistency | 10/10 | Every locale gets translated name/description/FAQ/steps, correct `inLanguage`, no placeholder text, no leftover HTML entities |

Total 72/100. There are no Critical or High issues; the gap is deprecated/off-domain markup and missing media/hub properties.

## Detection

Method: raw fetch of all 26 URLs (curl) + `parse_html.py --url` + custom node validator (JSON parse, @id graph walk, entity/placeholder scan) + schema.org vocabulary check (downloaded `schemaorg-current-https.jsonld`, every property tested against `domainIncludes` of the node type and its supertypes). JSON-LD is server-rendered in the static HTML (no JS needed). No Microdata, no RDFa (`itemscope`/`typeof` count = 0).

Current graph (every page, ~8.5 KB, 6 nodes):

| Node | @id | Status |
|---|---|---|
| WebSite | `<page-url>#website` | OK (per-locale, `inLanguage`, publisher is an array of Org + Person) |
| Organization | `https://www.arrayhelper.com/#organization` | OK but logo is weak (M3) |
| Person | `https://www.arrayhelper.com/#author` | OK |
| WebApplication + SoftwareApplication | `<page-url>#app` | Valid JSON, 2 off-domain props (M2), no image/screenshot |
| HowTo | `<page-url>#howto` | Deprecated type (M1) |
| FAQPage (9 Q&A) | `<page-url>#faq` | Matches visible FAQ; no rich result (I1) |

Validation checklist: https context PASS, types valid PASS (HowTo = deprecated, see M1), absolute URLs PASS, no placeholder text PASS, no ISO date issues (no dates emitted), all 26 locales parse PASS, all `@id` refs resolve PASS.

## What works

- Single `@graph` with stable, human-readable `@id`s and fully resolved cross-references (publisher, author, founder, isPartOf, tool).
- Server-rendered, so crawlers see it without executing JS.
- Truthful content: `offers` is a real free price (0 USD), FAQ and steps mirror visible on-page text, no fabricated ratings or reviews.
- Locales are localized correctly (name, description, `inLanguage`, FAQ/steps text); Organization/Person ids are global so brand and author entities are consistent across 26 pages.
- Organization + Person `sameAs` link to real profiles; `founder` ties them together.
- No `SearchAction` (the site has no search), which is correct.

## Findings

### Critical
None.

### High
None.

### Medium

**M1. HowTo (deprecated) on all 26 pages** (`#howto`)
Evidence: node `@type: HowTo` with 3 `HowToStep`s on every locale. Google removed How-to rich results in September 2023; the markup has no Google effect. It also mis-types `tool` (range is HowToTool or Text; the graph passes a SoftwareApplication reference).
Fix: delete the HowTo node. No replacement exists; the 3 visible steps in `<ol class="step-list">` already carry the on-page value. Do not add it back for AI/GEO reasons (unconfirmed). Saves ~1.5 KB per page.

**M2. Two properties are not valid on WebApplication/SoftwareApplication** (`codeRepository`, `availableLanguage`)
Evidence (schema.org current vocabulary, domainIncludes): `codeRepository` -> SoftwareSourceCode only; `availableLanguage` -> ContactPoint, Course, LodgingBusiness, ServiceChannel, TouristAttraction. Validator.schema.org flags both. Also `availableLanguage` (26 languages) reads as "the app UI is available in 26 languages" while the page itself says the content is "documented in every language"; the converter UI is mostly icon-driven.
Fix: move `codeRepository` to a new `SoftwareSourceCode` node (`targetProduct` -> the app); drop `availableLanguage`. The per-page language is already expressed by `inLanguage` on WebSite/WebPage and by hreflang.

**M3. Organization.logo is the 2121x1114 social card as a bare string**
Evidence: `"logo": "https://www.arrayhelper.com/images/arrayHelper-og.png"`. Visual check: a white "arrayHelper" wordmark on pale blue (#d5dfff) with decorative shapes - a banner, not a logo, with low contrast on a white background (Google shows logos on white).
Fix: use `https://www.arrayhelper.com/images/icons/icon.png` (180x180 square "y,H" mark, already live, >= 112x112) as an `ImageObject` with width/height.

### Low

**L1. Missing hub and media properties**: no `WebPage` node (nothing declares the page's main entity, primary image, or language), no `image`/`screenshot` on the app, no `isAccessibleForFree`, `Offer` lacks `availability`/`url`. A genuine screenshot exists (`/images/Readme%20Image%202.png`, 1876x922, returns 200) and the OG image is live. Fix: add WebPage (`mainEntity` -> app, `primaryImageOfPage`), ImageObject for the primary image, `screenshot`, `isAccessibleForFree: true`, `availability: https://schema.org/InStock`.

**L2. Entity fragmentation**: `#app` is `<page-url>#app`, so the same converter appears as 26 different SoftwareApplication entities (`/#app`, `/tr/#app`, ...) while Organization/Person are global. Fix: global `https://www.arrayhelper.com/#app`, `url` = `https://www.arrayhelper.com/`, page-specific bits live on the per-locale WebSite/WebPage/FAQPage. Keep per-locale `WebSite` (Google's site-name docs allow a WebSite per language homepage).

**L3. Redundant multi-type**: `["WebApplication","SoftwareApplication"]`; WebApplication is already a subtype of SoftwareApplication in schema.org. Use `WebApplication` only (Google's software-app feature accepts it).

**L4. `softwareVersion: "1.0"` is hard-coded and unverifiable** (package.json has no version; repo has no tags/releases wired in). Fix: remove, or wire to a real version later.

**L5. Build-pipeline robustness (latent, no live impact today)**: `decode()` maps `&quot;` to U+201C (a curly opening quote) instead of `"`, and does not handle `&lt; &gt; &#39;`; `JSON.stringify` output is injected raw into `<script>`, so a future string containing `</script>` or `<!--` would break the page. Verified today: 0 entities and 0 U+201C in the emitted JSON-LD of all 26 locales. Fix in proposal below.

**L6. `featureList` entries are headline sentences with trailing periods** ("Nothing is uploaded.", "Made for the keyboard."), derived from `features.items[].title`. Fix: strip the trailing period/danda/full stop (`. 。 । ۔`); ideally add dedicated short noun-phrase strings per locale later.

**L7. WebSite.publisher is an array (Organization + Person)**, and WebSite has no `alternateName` while appName uses "Array Helper" and the brand is "ArrayHelper". Fix: single Organization publisher, `alternateName: "Array Helper"` (site-name hint).

**L8. Person.sameAs omits the X/Twitter profile** that the page itself declares (`twitter:creator` @4yavuzyazici). Add `https://x.com/4yavuzyazici` only if that account is the author's own (it is declared in meta by the author).

**L9. Hand-off (not schema)**: `og:image:width/height` declare 1200x630 but `arrayHelper-og.png` is 2121x1114 (same ratio, wrong numbers). Proposal below uses the real size.

### Info

**I1. FAQPage present (9 questions per locale)**. Google retired FAQ rich results for all sites on May 7, 2026; no Google SERP benefit; any AI/GEO benefit is unconfirmed. Content is accurate and matches the visible FAQ, so keep it (no removal recommended). The FAQ is author-written, so QAPage is not applicable.

**I2. Software-app rich result is not reachable and should not be forced.** Google's software-app feature needs `name`, `offers.price`, and an `aggregateRating` or `review`. None exists. Do NOT invent ratings or convert GitHub stars (7) into `aggregateRating`. Add it only if real, visible, first-party reviews are collected on the page.

**I3. BreadcrumbList is not relevant.** The site is a single flat page per locale; a breadcrumb would have one item (Google needs >= 2) and there is no visible breadcrumb UI to mirror. Breadcrumb rich results are also desktop-only since Jan 2025. Skip.

**I4. "Free and open source" has no license.** GitHub reports `license: null` and the repo has no LICENSE file, so legally the code is all-rights-reserved. Add a LICENSE (e.g. MIT), then add `license` to the SoftwareSourceCode node. Not emitted in the proposal because it cannot be stated truthfully yet.

**I5. Optional**: `datePublished: "2024-09-14"` (repo creation date, verifiable) on the app. Do not emit a build-date `dateModified` on every deploy; it misrepresents content freshness.

## Proposal: changes to `buildJsonLd()` in build.mjs

Result: 8-node graph (WebSite, WebPage, ImageObject, Organization, Person, WebApplication, SoftwareSourceCode, FAQPage), 8.7 KB (current 8.5 KB; HowTo removal offsets the additions). Verified by script on all 26 locales: 0 dangling `@id`s, 0 duplicate ids, 0 properties outside schema.org domains, 0 entity/curly-quote artifacts. Sample output (en): `arrayhelper.com-audit/findings/schema-proposed-en.jsonld`.

Replace `decode()` and `buildJsonLd()` (build.mjs lines 123-220) with:

```js
function decode(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&quot;/g, '"')            // was U+201C (bug)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')             // decode &amp; last
    .replace(/\s+/g, ' ')
    .trim();
}

function buildJsonLd(t, locale, locales) {
  const url = localeUrl(locale);
  const description = decode(t.meta.description);
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${url}#website`,
      url,
      name: 'ArrayHelper',
      alternateName: 'Array Helper',
      description,
      inLanguage: locale.hreflang,
      publisher: { '@id': `${SITE}/#organization` }
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: decode(t.meta.title),
      description,
      inLanguage: locale.hreflang,
      isPartOf: { '@id': `${url}#website` },
      about: { '@id': `${SITE}/#app` },
      mainEntity: { '@id': `${SITE}/#app` },
      primaryImageOfPage: { '@id': `${SITE}/#primaryimage` },
      image: { '@id': `${SITE}/#primaryimage` },
      hasPart: { '@id': `${url}#faq` }
    },
    {
      '@type': 'ImageObject',
      '@id': `${SITE}/#primaryimage`,
      url: `${SITE}/images/arrayHelper-og.png`,
      contentUrl: `${SITE}/images/arrayHelper-og.png`,
      width: 2121,
      height: 1114
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'ArrayHelper',
      url: `${SITE}/`,
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE}/#logo`,
        url: `${SITE}/images/icons/icon.png`,
        contentUrl: `${SITE}/images/icons/icon.png`,
        width: 180,
        height: 180
      },
      sameAs: ['https://github.com/yavuzyazici/arrayHelper'],
      founder: { '@id': `${SITE}/#author` }
    },
    {
      '@type': 'Person',
      '@id': `${SITE}/#author`,
      name: 'Yavuz Selim Yazıcı',
      alternateName: 'Yavuz Yazici',
      url: 'https://www.yavuzyazici.com/',
      sameAs: [
        'https://www.linkedin.com/in/yavuz-yazici/',
        'https://github.com/yavuzyazici',
        'https://x.com/4yavuzyazici'     // keep only if this is the author's own account
      ]
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE}/#app`,
      name: decode(t.meta.appName),
      url: `${SITE}/`,
      description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      featureList: t.features.items.map(item => decode(item.title).replace(/[.。।۔]+$/u, '')),
      image: { '@id': `${SITE}/#primaryimage` },
      screenshot: {
        '@type': 'ImageObject',
        url: `${SITE}/images/Readme%20Image%202.png`,
        contentUrl: `${SITE}/images/Readme%20Image%202.png`,
        width: 1876,
        height: 922
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${SITE}/`
      },
      author: { '@id': `${SITE}/#author` },
      publisher: { '@id': `${SITE}/#organization` }
    },
    {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE}/#source`,
      name: 'ArrayHelper source code',
      codeRepository: 'https://github.com/yavuzyazici/arrayHelper',
      programmingLanguage: 'JavaScript',
      targetProduct: { '@id': `${SITE}/#app` },
      author: { '@id': `${SITE}/#author` }
      // add `license` here once a LICENSE file exists (see I4)
    },
    {
      '@type': 'FAQPage',          // Info only: no Google rich result since 2026-05-07; keep, do not expand
      '@id': `${url}#faq`,
      url: `${url}#faq`,
      name: decode(t.faq.h2),
      inLanguage: locale.hreflang,
      isPartOf: { '@id': `${url}#webpage` },
      mainEntity: t.faq.items.map(item => ({
        '@type': 'Question',
        name: decode(item.q),
        acceptedAnswer: { '@type': 'Answer', text: decode(item.a) }
      }))
    }
  ];

  // escape "<" so no string can ever close the <script> element
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\\u003c');
}
```

Removed on purpose: HowTo node, `availableLanguage`, `codeRepository` on the app, `softwareVersion`, per-locale `#app`/`#howto` ids, redundant `SoftwareApplication` type, `isPartOf` on the app, array publisher.

Optional follow-ups (not in the patch): rename `Readme Image 2.png` to a space-free name (e.g. `app-screenshot.png`) and update the URL; fix `og:image:width/height` to 2121/1114 in `src/page.html`; add a LICENSE file; add real visible reviews before ever emitting `aggregateRating`.

## Verification after applying

1. `npm run build`, then run the validator against `dist/**/index.html`: one JSON-LD block per page, parses, no dangling `@id`.
2. Spot check `/`, `/tr/`, `/ar/` (RTL), `/zh/` in https://validator.schema.org/ (expect 0 errors; WebApplication should no longer warn on `codeRepository`/`availableLanguage`).
3. Rich Results Test will show no eligible items (expected; see I1/I2). Do not treat that as a regression.
