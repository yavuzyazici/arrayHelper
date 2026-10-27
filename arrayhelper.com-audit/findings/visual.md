# Visual / Mobile Audit: https://www.arrayhelper.com/ (+ /ar/ RTL)

Date: 2026-10-27. Tooling: bundled `capture_screenshot.py` / `analyze_visual.py` plus custom Playwright measurement (Chromium headless; viewports 375x812 @2x touch, 768x1024, 1366x768, 1920x1080; EN and AR). CLS re-measured 4x per page/viewport under CPU 4x + 1.6 Mbps / 150 ms throttling.

Raw data: `findings/visual-measure.json`, `findings/visual-cls-focus.json`.
Screenshots (`screenshots/`): `desktop.png`, `mobile.png`, `ar-mobile.png`, `ar-desktop.png`, `{en,ar}_{mobile,tablet,laptop,desktop}_fold.png`, `en_mobile_scroll1/2.png`, `en_mobile_afterinput.png`, `en_desktop_afterinput.png`, `*_mobile_full.png`, `full/` (full-page captures).

**Visual score: 78 / 100**

## What works

- Viewport meta correct; no horizontal overflow at 375/768/1366/1920 on EN or AR (docScrollWidth == viewport; no element extends past right edge).
- Desktop above the fold is excellent: H1 (y=56), tagline, editor, three output panels and the whole toolbar fit in 100dvh (app-shell = 1080px at 1920x1080; toolbar bottom y=1072). The tool is usable with zero scroll on desktop, laptop and tablet.
- LCP element is the H1 text (276-580 ms unthrottled); no hero image to delay. Poppins 400/600 preloaded, both `loaded`. CLS = 0 in 14 of 16 throttled runs.
- Base font 16px; editor textarea 16px (no iOS focus-zoom). Content paragraphs 15px/26px line height.
- Mobile H1 is visible without scrolling (y=51-90, wraps to 2 lines). Output panels, tool and conversion work correctly after typing (verified: `['apple', 'banana', 'cherry', 42]`).
- RTL (/ar/): `html lang=ar dir=rtl`; header, logo (right-anchored), H1, tagline, guide, cards, FAQ and language switcher all mirror correctly; no overflow; Arabic fonts render; code samples stay LTR. Tool area intentionally `dir="ltr"` (page.html:137,306), sensible for code.
- No console errors or failed requests; images all complete with alt text; no broken or overlapping elements detected.

## Findings

### Critical
None.

### High

**H1. Mobile above-the-fold shows only the empty input; results and all options are below the fold.**
Evidence (375x812): editor `y=145..865` (fixed 720px) fills the viewport; first output panel starts y=865 (fold is 812); quote/number/settings/clear toolbar y=1591-1637; "Guide, examples and FAQ" link y=1839; page is 9,702px tall. After typing in the editor (`en_mobile_afterinput.png`) the page only scrolls ~51px and results remain off-screen; with the soft keyboard open (about 400px visible) the user cannot see any result without scrolling ~700px. The single CTA (convert arrow) is a 28x28 icon. `analyze_visual.py` also reports `cta_visible: false`.
Fix: `src/styles/globals.css` lines 142-146, `main > .text-editor { height: 720px; }` -> e.g. `height: clamp(200px, 32svh, 280px);` so the first output panel peeks above the fold. Also compact the mobile toolbar (page.html:306-379 uses `max-[500px]:w-full` on every container, stacking four full-width 46px rows, about 240px) into a 2-column or single scrollable row, and/or place it between editor and outputs.

### Medium

**M1. Tap targets below 44-48px.** Mobile (375px) measured: convert button 28x28 (page.html:140); quote / number / clear buttons 28px tall (`.button`, toolbar); Settings 98x24; copy buttons 44x32 (page.html:160 etc.); GitHub icon 32x32; content-nav chips 31px tall; footer links 21px tall (17px for "Atak Domain"); language links 34px tall. Spacing between them is adequate, but sizes fall short of 48px (Google/WCAG 2.5.8 minimum is 24, recommended 44+).
Fix: `.button` and `.options` min-height 44px (the 46px container already has room; make the button fill it); `#convertBtn` use `p-2.5` (about 44px); `.output-header` copy button `h-11`; footer/nav links `padding: 10px 6px` / `min-height: 44px` in `src/styles/globals.css`.

**M2. Low colour contrast on the value-proposition text.** Tagline, "Press Ctrl/Cmd + Enter" hint and kbd use `cool-gray #afb4c2` on white = 2.07:1 (needs 4.5:1; text is 12px on mobile). Guide body paragraphs `#767a8a` = 4.27:1 on white, 4.02:1 on the off-white gradient (just below AA).
Fix: keep `#afb4c2` for borders/decoration but use a darker text token, e.g. `#6b7080` (4.94:1 on white, 4.65:1 on #f6f8fe), for `text-cool-gray` text in `src/page.html:122,133` (class `text-cool-gray`) and `src/tailwind.config.js:16`; body copy to `#5f6477` (5.87:1) in `src/styles/globals.css` `.content-section p`. Rebuild `output.css`.

**M3. Logo box mismatch causes an avoidable layout shift and wastes 20px of fold.** `page.html:120` declares `width="120" height="28"`, but `images/arrayHelper.svg` is `width=120 height=48 viewBox="0 0 222 48"`, so it renders letterboxed (about 120x26 artwork inside a 48px box, about 11px empty above and below). When the SVG decodes after first paint the header grows 20px; measured CLS 0.0397 in 2 of 8 throttled desktop runs (EN and AR); shifted nodes: `main`, H1, tagline, toolbar (y 99 -> 119). Under the 0.1 threshold but trivially fixable.
Fix: set SVG `width="120" height="26"` (or drop them, keeping viewBox) and `<img width="120" height="26">` in page.html:120; this also pulls everything on mobile about 20px upward.

**M4. Accessibility names: non-human labels and near-invisible focus.** Output textareas have `aria-label="rawOutput-label"`, `jsOutput-label`, ..., `customOutput-label` (page.html:170,187,204,221,238,255,272,299), not readable and not localized (same in /ar/). The eight copy buttons have no aria-label: accessible name is "copy Copy" (AR: "copy نسخ النص", with hardcoded English `alt="copy"`). Keyboard focus ring on copy buttons is `outline auto rgb(229,229,229)` (inherits light `text-neutral-200`) on a near-white background, and output textareas use `outline: 2px solid transparent`, so focus is effectively invisible.
Fix: localized `aria-label="{{ui.outputAria}} JavaScript"` etc. for textareas; `aria-label="{{ui.copy}} JavaScript"` on copy buttons with `alt=""` on the img; add `:focus-visible { outline: 2px solid #8C85FF; outline-offset: 2px }` globally in `globals.css`.

### Low

**L1. Desktop first view shows three empty output panels, no example or demonstration.** `desktop.png`: large blank areas; the only prompts are a placeholder "Start typing..." and a small 12.5px "Guide" pill. A "Try an example" button or placeholder text in the outputs would show the value immediately and give a real CTA (and gives screenshots/Search previews meaning).

**L2. Keyboard-shortcut hint is shown on touch devices.** "Press Ctrl / Cmd + Enter to convert" wraps to two lines at 12px on mobile (header text block 239x31) and is irrelevant without a keyboard. Hide with `@media (pointer: coarse)` or `hidden md:block` (page.html:122-128).

**L3. Small text.** 11px token chips, 11.5px panel chips, 12px tagline / kbd / editor buttons, 12.4px inline code, 13px language links, 13.5px card/list copy (about 100 text elements under 14px on the page). Body base 16px is fine. Raise tagline to 14px mobile, chips to 12-13px.

**L4. H1 is visually weak.** 14px (mobile) / 15px (desktop) semibold: same scale as body text, subordinate to the logo. It is visible and correct semantically; consider 18-20px on desktop for stronger topic signal now that the header has spare room.

**L5. Decorative icon alts are English identifiers in every locale.** `alt="arrow-right"`, `double-quote`, `single-quote`, `numbers-without-quote`, `numbers-quote`, `options`, `trash`, `copy` (page.html:142,163,...,309-327,377) inside buttons that already carry aria-labels. Use `alt="" aria-hidden="true"` (the logo's `alt="ArrayHelper logo"` is fine).

### Info

- Tablet (768x1024): two-column layout (editor 386px + outputs 264px each); no issues.
- No `prefers-reduced-motion` problems; "hero-jump" bob animation is disabled under reduced motion (globals.css:576).
- The auto-focus on the editor is skipped on mobile (`focusEditor`, editor.js:53), so no keyboard pop-up on load: good.
- Copy button label ("Copy") is hover-only (opacity 0 until `group-hover`); on touch devices only the icon is visible. Acceptable with a proper aria-label (see M4).
- AR page: the tool/toolbar area is LTR-anchored (left) while header/logo are right-anchored. Intentional for code; no fix needed.
- No horizontal scroll, text clipping, or overlapping elements detected by `analyze_visual.py` (empty `overlapping_elements` / `text_overflow`).

## Structured data for audit-data.json (Visual category)

```json
{
  "category": "Visual",
  "score": 78,
  "findings": [
    {"id": "V-H1", "severity": "high", "title": "Mobile fold shows only empty editor; outputs/toolbar below fold", "file": "src/styles/globals.css:142-146"},
    {"id": "V-M1", "severity": "medium", "title": "Tap targets below 44-48px", "file": "src/page.html:140,160; src/styles/globals.css"},
    {"id": "V-M2", "severity": "medium", "title": "Tagline/hint contrast 2.07:1; body copy 4.27:1", "file": "src/tailwind.config.js:16; src/page.html:122,133"},
    {"id": "V-M3", "severity": "medium", "title": "Logo img 120x28 vs SVG 120x48 viewBox 222x48: CLS 0.0397 and 20px wasted", "file": "src/page.html:120; src/images/arrayHelper.svg"},
    {"id": "V-M4", "severity": "medium", "title": "Non-human aria-labels on outputs, unlabeled copy buttons, invisible focus ring", "file": "src/page.html:170-299"},
    {"id": "V-L1", "severity": "low", "title": "No example/CTA in empty desktop fold"},
    {"id": "V-L2", "severity": "low", "title": "Keyboard hint on touch devices", "file": "src/page.html:122-128"},
    {"id": "V-L3", "severity": "low", "title": "Many text nodes under 14px"},
    {"id": "V-L4", "severity": "low", "title": "H1 only 14-15px"},
    {"id": "V-L5", "severity": "low", "title": "Decorative icons with English alt text in all locales"}
  ]
}
```
