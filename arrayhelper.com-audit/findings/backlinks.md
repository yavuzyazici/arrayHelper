# Backlink Profile Findings - arrayhelper.com

Canonical host: https://www.arrayhelper.com/ | Audit date: 2026-10-27 | Agent: seo-backlinks
Source tier: **Tier 0** (Common Crawl + Verification Crawler). No Moz, Bing, Keywords Everywhere, or DataForSEO credentials.

## Backlink Health Score: INSUFFICIENT DATA (0/7 factors scored)

Per the skill's data-sufficiency gate, no numeric score is produced. Every factor below is **Not Assessed**
because Common Crawl supplies only domain-level rank and presence signals.

| Factor | Status | Source |
|--------|--------|--------|
| Referring domain count | Not Assessed | none (CC does not provide it) |
| Domain quality distribution | Not Assessed | none |
| Anchor text naturalness | Not Assessed | none |
| Toxic link ratio | Not Assessed | none (no Moz spam score) |
| Link velocity trend | Not Assessed | DataForSEO only |
| Follow/nofollow ratio | Not Assessed | none (3 verified links only, see below) |
| Geographic relevance | Not Assessed | none |

Validator (`validate_backlink_report.py`): status **REVIEW**, 0 errors, 1 warning (reciprocal links with
github.com and yavuzyazici.com, both self-owned; addressed below). Raw inputs are in
`arrayhelper.com-audit/backlinks-work/` (`cc_arrayhelper.json`, `verify.json`, `report_data.json`).

## 1. Data Obtained

### 1a. Common Crawl Web Graph (domain-level, confidence 0.50)
Release `cc-main-2026-jan-feb-mar` (quarterly; freshness approximate, source https://commoncrawl.org/web-graphs).

| Domain | In crawl | PageRank rank | Harmonic centrality rank | Hosts |
|--------|----------|---------------|--------------------------|-------|
| **arrayhelper.com** | yes | 5,460,824 | 2,924,628 | 1 |
| devtoollab.com (direct competitor) | yes | 5,659,845 | 2,989,417 | 1 |
| listdiff.com (direct competitor) | yes | 7,612,288 | 7,433,723 | 2 |
| charset.org (text-to-array competitor) | yes | 79,801 | 54,272 | 2 |
| bushe.co (list-to-comma competitor) | **not found** | n/a | n/a | n/a |
| atakdomain.com (registrar / origin-story employer; linked from footer) | yes | 32,660 | 111,601 | 5 |
| codebeautify.org (established tool site, for scale) | yes | 24,856 | 4,703 | 3 |
| jsonformatter.org (established tool site, for scale) | yes | 44,213 | 6,156 | 2 |
| github.com (for scale) | yes | 24 | 32 | 6,038 |
| yavuzyazici.com (author site) | **not found** | n/a | n/a | n/a |

Raw arrayhelper.com values: PageRank 9.89e-09, harmonic centrality 14,286,333.

Interpretation: arrayhelper.com is present in both the crawl and the rankings, so it has some inbound connectivity
in the graph, and it sits in the same long-tail band as direct competitors devtoollab.com and listdiff.com. It is
roughly two to three orders of magnitude (in rank) below established tool sites (codebeautify.org, jsonformatter.org).
This is a rank/presence signal, **not** a referring-domain count. yavuzyazici.com being absent from Common Crawl
means "not crawled / too small", not "low authority".
bushe.co is not in the crawl (not evidence of low authority); charset.org, a text-to-array competitor, ranks far higher than arrayhelper.com.

### 1b. Verification Crawler (confidence 0.95, direct observation of the source page)
Only candidate sources I supplied can be checked; the crawler cannot discover links.

| Candidate source | Result | Anchor | rel | Note |
|------------------|--------|--------|-----|------|
| github.com/yavuzyazici/arrayHelper | verified | www.arrayhelper.com | noopener noreferrer **nofollow** | Self-owned repo; repo "homepage" field also set to the site (GitHub API) |
| github.com/yavuzyazici (profile) | verified | arrayhelper.com | **nofollow** | Self-owned |
| www.yavuzyazici.com | verified | "Live Demo" | noopener noreferrer (followed) | Self-owned; reciprocal (arrayhelper.com links to it from the footer and JSON-LD) |
| www.atakdomain.com/en and / | no link found (HTTP 200, raw HTML, not JS-rendered) | n/a | n/a | **Outbound-only.** arrayhelper.com links to atakdomain.com; atakdomain never linked back. This is not a "lost" link. |
| linkedin.com/in/yavuz-yazici/ | unverifiable (HTTP 405, bot-blocked) | n/a | n/a | Treat as unknown |

Result: **3 verified inbound links, all self-owned, 2 of 3 nofollow.** Zero independent third-party editorial links confirmed.

### 1c. Other observations
- Homepage outbound links (Parsed, 0.95): GitHub repo (twice), atakdomain.com/en (rel=noopener, followed, title "Domain"), yavuzyazici.com (followed). No outbound links to unrelated or low-quality domains.
- Web search (WebSearch, US-only, non-exhaustive, treat as low confidence): the query `"arrayhelper.com"` returned **no page from or mentioning the site**; only unrelated "ArrayHelper" classes (Craft CMS, Yii, CodeIgniter, Android ddmlib, R packages). A descriptive query surfaced only the GitHub repo. No third-party review, roundup, or tutorial mentioning the tool was found.
- GitHub repo (GitHub API via WebFetch summary, moderate confidence): 7 stars, 0 forks, 1 watcher, 2 open issues, created 2024-09-14, last push 2026-09-06, topics set (list-to-array, text-to-array, sql-helper...), **license: none**. Local tree has no LICENSE file either, and README/package.json mention no license.
- Domain (WHOIS fallback via `domain_history.py`): registered 2024-09-07, expires 2027-09-07, registrar Atak Domain Bilgi Teknolojileri A.S. Tool risk rating is "unknown" (no baseline topic supplied); the creation date is a week before the GitHub repo was created (2024-09-14), consistent with a fresh registration, but prior history was not checked.
- Host canonicalisation (curl): `http://` variants 301 to https. `https://www.arrayhelper.com/` is 200. `https://arrayhelper.com/` (apex) is **also 200** with `rel=canonical` to www, not a 301.
- robots.txt allows crawling and lists the sitemap; sitemap carries hreflang for 26 locales (/tr/, /de/, ... /ur/).

## 2. Findings (ranked)

### Critical
None. There is no evidence of toxic, spammy, or penalty-risk links. (Absence of toxic-link data is "Not Assessed", not "clean".)

### High
**H1. No independent backlink profile detected.** All three crawler-verified inbound links are self-owned and two are nofollow; web search found no third-party mentions. Effective earned-link count is effectively zero as far as free sources can see, while the site publishes 26 language versions that need links to compete. Sources: Verify crawler (0.95), WebSearch (low), CC (0.50). Caveat: Common Crawl shows non-zero graph presence, so some links I cannot identify may exist; only GSC / Bing / Ahrefs Webmaster Tools on the verified property can list them.

### Medium
**M1. Apex host serves 200 instead of 301 to www.** `https://arrayhelper.com/` returns the full page with a canonical tag pointing at www. Canonical is a hint, not a redirect, so links to the apex are consolidated less reliably and the page is reachable on two hosts. Fix: 301 apex to www at the server level (cross-reference `/seo technical`). Source: curl, direct observation.

**M2. Open-source claim without a license.** The site says "Free and open source", and JSON-LD sets `codeRepository`, but the GitHub repo has no license (API `license: null`, no LICENSE file locally). Many curated lists and OSS directories require a recognised license, and unlicensed code is legally all-rights-reserved. This blocks several link opportunities below. Choose and add a license (owner's decision which one).

**M3. Ambiguous brand name.** "ArrayHelper" is the name of widely documented classes in Yii, Craft CMS, CodeIgniter and Android tooling, so brand-name searches return framework docs and unlinked-mention discovery is noisy. Use descriptive anchors and a qualifier in outreach (for example "ArrayHelper text list to array converter"). Source: WebSearch results (low confidence).

### Low
**L1. One-way link to Atak Domain.** The footer links (followed) to atakdomain.com/en; atakdomain.com does not link back. atakdomain.com is the strongest related property by CC rank (PageRank rank 32,660 vs 5,460,824) and is both the registrar and the origin story in the README. This is the highest-value, lowest-effort inbound opportunity (see opportunities).

**L2. Self-owned reciprocal links.** arrayhelper.com <-> yavuzyazici.com and <-> github.com. Benign (same owner, genuine ownership signals) but they carry little ranking value and should not be counted as authority. Improve the yavuzyazici.com anchor from "Live Demo" to a descriptive one.

### Info
- GitHub-originated links are nofollow by platform design; useful for entity/trust signals and discovery, not PageRank.
- LinkedIn link could not be verified (HTTP 405); status unknown.
- yavuzyazici.com is not in Common Crawl; not evidence of low authority.
- Link velocity, anchor distribution, toxic ratio, geographic mix: Not Assessed (need DataForSEO or an owner-verified source).

## 3. Prioritised Link Opportunities (free, open-source developer tool)

Rules of thumb from `free-backlink-sources.md` and the toxic-pattern guidance: earn a small number of relevant links;
avoid mass directory submissions (50+ directory links is a flagged toxic pattern), paid links, and PBNs.
Link types below are expectations, not verified, unless stated.

1. **Atak Domain editorial link (highest value, effort low).** Ask for a followed link from atakdomain.com (a blog post such as "a free tool built by our developer", a developer-tools / resources page, or the team page). Verified today: no existing link. The README origin story gives a genuine editorial angle. Request a descriptive anchor ("text list to array converter") not just "Domain".
2. **Unblock eligibility first (effort low): add a license to the GitHub repo**, refresh the stale README feature list (it still lists 3 outputs; site supports far more), add a social-preview image, and pin the repo on the GitHub profile. Prerequisite for items 3 and 4.
3. **Curated developer-tool lists via pull request.** `moimikey/awesome-devtools` (about 542 stars; a "Transformation"-style category fits a list converter). Not verified: contribution rules (CONTRIBUTING.md not read) and recent activity (last-commit date not shown; 64 open PRs suggests slow merging), so check before investing time. **Do not pursue tiny-helpers.dev: its README states it no longer accepts contributions (verified).** `free-for.dev` is for services with free tiers, not a fit.
4. **Developer launch platforms (effort low, mostly discovery value).** DevHunt (devhunt.org; sign-in with GitHub per third-party guides; sources disagree on whether the free link is nofollow or dofollow, and the site itself did not state it, so verify). Also consider Show HN, Product Hunt, AlternativeTo and SaaSHub. Read each community's self-promotion rules first; I did not verify their current terms. Expect mostly nofollow/low direct SEO weight but they are how bloggers and list curators find tools.
5. **Linkable guide content (effort medium).** Direct competitor listdiff.com surfaces in search through `/learn/` guides on exactly these queries (SQL IN clause, quoting, comma-separated lists). Publish 2-3 genuinely useful guides on arrayhelper.com (for example: quoting and escaping in SQL vs JS vs Python lists; why numeric IDs should not be quoted; very long IN lists), then reference them in answers and posts. Coordinate wording with `/seo content`.
6. **Helpful answers on Q&A and forums (effort ongoing).** Answer real "convert a column/list to a quoted comma-separated SQL list" questions on Stack Overflow, Reddit r/SQL, r/webdev and DBA communities; disclose affiliation and give the answer in-thread. Links are usually nofollow; value is referral traffic and mentions.
7. **Author-controlled profiles (effort very low).** yavuzyazici.com (descriptive anchor), GitHub profile README, LinkedIn Featured/Projects, dev.to / Hashnode author profiles. Entity-consistency signals, limited PageRank value.
8. **Native-language communities (effort medium).** The author is Turkish and the site ships /tr/ plus 24 other locales. Write a short post per priority locale (start with Turkish developer communities) linking to the matching locale URL so hreflang pages earn their own signals. Specific venues not verified.
9. **Distribution packages (effort high, durable).** A Chrome/VS Code extension or small npm package whose store listing links to the site; a Chrome Web Store tool ("SQLDelimiter") already appears in results for this niche, which confirms demand.

## 4. Recommended Data Upgrades (to move off INSUFFICIENT DATA)
1. Verify arrayhelper.com in **Google Search Console** (Links report) and **Bing Webmaster Tools** (also unlocks `BING_WEBMASTER_API_KEY`, Tier 2). Free Ahrefs Webmaster Tools also works for verified sites. These list real referring domains for the owned property.
2. Optional: free Moz API key (Tier 1) for DA, spam score, anchors, and referring domains.
3. Re-run `verify_backlinks.py` monthly against any links won, to catch removals.
4. Do not generate a disavow file: no toxic-link evidence exists and none can be assessed at Tier 0.

## 5. Limitations
- Common Crawl is domain-level, quarterly, no anchors, no referring-domain list; confidence 0.50.
- The verification crawler only tests candidate URLs supplied by the analyst; it cannot discover unknown backlinks.
- WebSearch is US-only and non-exhaustive; GitHub API figures came via a WebFetch summary.
- Directory and platform rules were not individually verified except tiny-helpers.dev (closed) and the partial DevHunt / awesome-devtools reads noted above.

## Structured findings (audit-data.json, category "Backlink Profile")
```json
{
  "category": "Backlink Profile",
  "tier": 0,
  "health_score": "INSUFFICIENT DATA",
  "factors_scored": "0/7",
  "sources": [
    {"name": "Common Crawl", "confidence": 0.50, "release": "cc-main-2026-jan-feb-mar"},
    {"name": "Verification Crawler", "confidence": 0.95}
  ],
  "findings": [
    {"id": "BL-H1", "severity": "high", "title": "No independent backlink profile detected", "evidence": "3 verified inbound links, all self-owned, 2 nofollow; no third-party mentions found", "source": "verify_crawler+websearch"},
    {"id": "BL-M1", "severity": "medium", "title": "Apex host returns 200 instead of 301 to www", "evidence": "https://arrayhelper.com/ 200 with canonical to www", "source": "curl"},
    {"id": "BL-M2", "severity": "medium", "title": "Open-source claim but no repository license", "evidence": "GitHub API license null; no LICENSE file", "source": "github+local"},
    {"id": "BL-M3", "severity": "medium", "title": "Brand name ambiguous with framework ArrayHelper classes", "evidence": "Brand query returns Yii/Craft/CodeIgniter docs", "source": "websearch"},
    {"id": "BL-L1", "severity": "low", "title": "One-way link to atakdomain.com, no link back", "evidence": "atakdomain.com/en and / contain no arrayhelper link in raw HTML", "source": "verify_crawler"},
    {"id": "BL-L2", "severity": "low", "title": "Self-owned reciprocal links (github.com, yavuzyazici.com)", "evidence": "validator reciprocal_links warning", "source": "validator"},
    {"id": "BL-I1", "severity": "info", "title": "Referring domains, anchors, toxicity, velocity not assessed", "evidence": "No scoreable source configured", "source": "not-assessed"}
  ]
}
```
