import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const OUT = 'dist';
const SITE = 'https://www.arrayhelper.com';
const BRAND_URL_FALLBACK = 'https://www.atakdomain.com/en';

const FORMAT_CODES = [
  "['apple', 'banana', 42]",
  "IN (N'apple', N'banana', N'42')",
  "['apple', 'banana', 42]",
  "array('apple', 'banana', 42)",
  '["apple", "banana", 42]',
  'new[] { "apple", "banana", 42 }',
  "'apple', 'banana', 42",
  "EXEC MyProcedure 'apple';\nEXEC MyProcedure 'banana';\nEXEC MyProcedure '42';"
];

const STATIC_ENTRIES = [
  'images',
  'fonts',
  'robots.txt',
  'llms.txt',
  '404.html',
  'browserconfig.xml',
  '.htaccess'
];

const stripVersionQuery = {
  name: 'strip-version-query',
  setup(api) {
    api.onResolve({ filter: /\.js\?v=/ }, args => ({
      path: path.resolve(args.resolveDir, args.path.split('?')[0])
    }));
  }
};

function hash(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 8);
}

function get(data, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), data);
}

function render(template, data, where) {
  const withSections = template.replace(
    /[ \t]*\{\{#([\w.]+)\}\}\r?\n?([\s\S]*?)[ \t]*\{\{\/\1\}\}\r?\n?/g,
    (_, key, body) => {
      const list = get(data, key);
      if (!Array.isArray(list)) {
        throw new Error(`build: ${where} icin "${key}" bir dizi degil`);
      }
      return list.map(item => render(body, { ...data, ...item }, where)).join('');
    }
  );

  return withSections.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
    const value = get(data, key);
    if (value === undefined || value === null) {
      throw new Error(`build: ${where} icin "${key}" anahtari eksik`);
    }
    return String(value);
  });
}

function assertNoRawQuotes(value, trail, code) {
  if (typeof value === 'string') {
    if (value.includes('"')) {
      throw new Error(`build: ${code}.json -> ${trail} icinde duz cift tirnak var, &quot; kullan`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoRawQuotes(item, `${trail}[${i}]`, code));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      assertNoRawQuotes(item, trail ? `${trail}.${key}` : key, code);
    }
  }
}

function localeUrl(locale) {
  return locale.dir ? `${SITE}/${locale.dir}/` : `${SITE}/`;
}

function localePath(locale) {
  return locale.dir ? `/${locale.dir}/` : '/';
}

function buildHreflang(locales, defaultLocale) {
  const rows = locales.map(
    locale => `  <link rel="alternate" hreflang="${locale.hreflang}" href="${localeUrl(locale)}">`
  );
  rows.push(`  <link rel="alternate" hreflang="x-default" href="${localeUrl(defaultLocale)}">`);
  return rows.join('\n');
}

function buildLanguageNav(locales, current) {
  return locales
    .map(locale => {
      const active = locale.code === current.code;
      return `          <a class="lang-link${active ? ' is-current' : ''}" href="${localePath(locale)}"` +
        ` hreflang="${locale.hreflang}" lang="${locale.hreflang}"` +
        `${active ? ' aria-current="page"' : ''}>${locale.name}</a>`;
    })
    .join('\n');
}

function buildFooterLine(t, locale) {
  const url = locale.brandUrl || BRAND_URL_FALLBACK;
  const brand = `<a href="${url}" title="Domain" target="_blank" rel="noopener">Atak Domain</a>`;
  if (!t.footer.line.includes('{brand}')) {
    throw new Error(`build: ${locale.code}.json -> footer.line icinde {brand} yok`);
  }
  return t.footer.line.replace('{brand}', brand);
}

function decode(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildJsonLd(t, locale) {
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
        'https://x.com/4yavuzyazici'
      ]
    },
    {
      // One app entity shared by every locale page
      '@type': 'WebApplication',
      '@id': `${SITE}/#app`,
      name: 'ArrayHelper',
      alternateName: decode(t.meta.appName),
      url: `${SITE}/`,
      description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      featureList: t.features.items.map(item => decode(item.title).replace(/[.。।۔]+$/u, '')),
      image: { '@id': `${SITE}/#primaryimage` },
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
    },
    {
      '@type': 'FAQPage',
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

  // "<" escaped so no translated string can ever close the <script> element
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
    .replace(/</g, '\u003c');
}

// Last commit that touched this locale's page, so a rebuild alone never bumps lastmod
function contentDate(locale, today) {
  const files = [`${SRC}/page.html`, `${SRC}/i18n/${locale.code}.json`];
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', ...files], { encoding: 'utf8' }).trim();
    if (dirty) return today;
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8' }).trim() || today;
  } catch {
    return today;
  }
}

function buildSitemap(locales, today) {
  const entries = locales.map(locale => {
    const alternates = locales.map(
      other => `    <xhtml:link rel="alternate" hreflang="${other.hreflang}" href="${localeUrl(other)}"/>`
    );
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl(locales[0])}"/>`
    );
    return [
      '  <url>',
      `    <loc>${localeUrl(locale)}</loc>`,
      `    <lastmod>${contentDate(locale, today)}</lastmod>`,
      ...alternates,
      '  </url>'
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    ''
  ].join('\n');
}

function rewrite(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`build: page.html icinde "${label}" bulunamadi, dist bozuk olurdu`);
  }
  return source.replace(pattern, replacement);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await build({
  entryPoints: [path.join(SRC, 'js/main.js')],
  outfile: path.join(OUT, 'js/main.js'),
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  legalComments: 'none',
  plugins: [stripVersionQuery]
});

await build({
  stdin: {
    contents: "@import './globals.css';\n@import './output.css';\n",
    resolveDir: path.join(SRC, 'styles'),
    loader: 'css'
  },
  outfile: path.join(OUT, 'styles/app.css'),
  bundle: true,
  minify: true,
  legalComments: 'none',
  external: ['*.woff2', '*.woff', '*.png', '*.svg']
});

for (const entry of STATIC_ENTRIES) {
  await cp(path.join(SRC, entry), path.join(OUT, entry), { recursive: true });
}

const jsBytes = await readFile(path.join(OUT, 'js/main.js'));
const cssBytes = await readFile(path.join(OUT, 'styles/app.css'));
const jsHash = hash(jsBytes);
const cssHash = hash(cssBytes);

let template = await readFile(path.join(SRC, 'page.html'), 'utf8');

template = rewrite(
  template,
  /[ \t]*<link rel="stylesheet" href="\/styles\/globals\.css[^"]*">\r?\n[ \t]*<link rel="stylesheet" href="\/styles\/output\.css[^"]*">/,
  `  <link rel="stylesheet" href="/styles/app.css?v=${cssHash}">`,
  'stylesheet linkleri'
);

template = rewrite(
  template,
  /[ \t]*<link rel="modulepreload" href="\/js\/[^"]*">(\r?\n[ \t]*<link rel="modulepreload" href="\/js\/[^"]*">)*/,
  `  <link rel="modulepreload" href="/js/main.js?v=${jsHash}">`,
  'modulepreload linkleri'
);

template = rewrite(
  template,
  /<script type="module" src="\/js\/main\.js[^"]*"><\/script>/,
  `<script type="module" src="/js/main.js?v=${jsHash}"></script>`,
  'module script etiketi'
);

const allLocales = JSON.parse(await readFile(path.join(SRC, 'i18n/locales.json'), 'utf8'));
const locales = allLocales.filter(locale =>
  existsSync(path.join(SRC, 'i18n', `${locale.code}.json`))
);

if (!locales.length || locales[0].code !== 'en') {
  throw new Error('build: en.json zorunlu ve locales.json icinde ilk sirada olmali');
}

const missing = allLocales.filter(locale => !locales.includes(locale)).map(locale => locale.code);
const hreflangBlock = buildHreflang(locales, locales[0]);
const today = new Date().toLocaleDateString('sv-SE');
const report = [];

for (const locale of locales) {
  const translations = JSON.parse(
    await readFile(path.join(SRC, 'i18n', `${locale.code}.json`), 'utf8')
  );

  assertNoRawQuotes(translations, '', locale.code);

  if (translations.formats.cards.length !== FORMAT_CODES.length) {
    throw new Error(`build: ${locale.code}.json -> formats.cards ${FORMAT_CODES.length} olmali`);
  }

  translations.formats.cards.forEach((card, i) => { card.code = FORMAT_CODES[i]; });

  const data = {
    ...translations,
    _lang: locale.hreflang,
    _dir: locale.rtl ? 'rtl' : 'ltr',
    _url: localeUrl(locale),
    _ogLocale: locale.ogLocale,
    _hreflang: hreflangBlock,
    _languages: buildLanguageNav(locales, locale),
    _footerLine: buildFooterLine(translations, locale),
    _jsonld: buildJsonLd(translations, locale)
  };

  const html = render(template, data, `${locale.code}.json`);
  const dir = locale.dir ? path.join(OUT, locale.dir) : OUT;

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);

  report.push([`${localePath(locale)}index.html`, Buffer.byteLength(html)]);
}

await writeFile(path.join(OUT, 'sitemap.xml'), buildSitemap(locales, today));

console.log(`js/main.js         ${(jsBytes.length / 1024).toFixed(1)} KB`);
console.log(`styles/app.css     ${(cssBytes.length / 1024).toFixed(1)} KB`);

for (const [name, size] of report) {
  console.log(`${name.padEnd(18)} ${(size / 1024).toFixed(1)} KB`);
}

console.log(`\n${locales.length}/${allLocales.length} dil derlendi`);

if (missing.length) {
  console.log(`ceviri bekleyen: ${missing.join(', ')}`);
}
