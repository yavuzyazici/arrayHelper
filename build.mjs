import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'src';
const OUT = 'dist';

const STATIC_ENTRIES = [
  'images',
  'fonts',
  'robots.txt',
  'sitemap.xml',
  'browserconfig.xml'
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

let html = await readFile(path.join(SRC, 'index.html'), 'utf8');

function rewrite(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`build: index.html icinde "${label}" bulunamadi, dist bozuk olurdu`);
  }
  return source.replace(pattern, replacement);
}

html = rewrite(
  html,
  /[ \t]*<link rel="stylesheet" href="\/styles\/globals\.css[^"]*">\r?\n[ \t]*<link rel="stylesheet" href="\/styles\/output\.css[^"]*">/,
  `  <link rel="stylesheet" href="/styles/app.css?v=${cssHash}">`,
  'stylesheet linkleri'
);

html = rewrite(
  html,
  /[ \t]*<link rel="modulepreload" href="\/js\/[^"]*">(\r?\n[ \t]*<link rel="modulepreload" href="\/js\/[^"]*">)*/,
  `  <link rel="modulepreload" href="/js/main.js?v=${jsHash}">`,
  'modulepreload linkleri'
);

html = rewrite(
  html,
  /<script type="module" src="\/js\/main\.js[^"]*"><\/script>/,
  `<script type="module" src="/js/main.js?v=${jsHash}"></script>`,
  'module script etiketi'
);

await writeFile(path.join(OUT, 'index.html'), html);

const report = [
  ['js/main.js', jsBytes.length],
  ['styles/app.css', cssBytes.length],
  ['index.html', Buffer.byteLength(html)]
];

for (const [name, size] of report) {
  console.log(`${name.padEnd(18)} ${(size / 1024).toFixed(1)} KB`);
}
