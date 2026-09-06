import { CONFIG, OUTPUT_KEYS } from './utils.js?v=20260906';

// Which intermediate parts each output format is built from
const RAW_BASED = ['raw', 'js', 'py', 'php'];
const JSON_BASED = ['json', 'cs'];

const PATTERN_TOKEN = /\{(value|n|i)?\}/g;
const PATTERN_ESCAPE = /\\([ntr\\])/g;
const SQL_QUOTE = /'/g;

// prefix, suffix and separator each panel wraps its intermediate with
const SPECS = {
  raw: ['raw', '', '', ', '],
  js: ['raw', '[', ']', ', '],
  sql: ['sql', 'IN (', ')', ', '],
  py: ['raw', '[', ']', ', '],
  php: ['raw', 'array(', ')', ', '],
  json: ['json', '[', ']', ', '],
  cs: ['json', 'new[] { ', ' }', ', '],
  custom: ['custom', '', '', '\n']
};

// Turns "EXEC Proc '{}';" into literals + token slots, once per conversion
function compilePattern(pattern) {
  const source = pattern.replace(PATTERN_ESCAPE, (_, char) =>
    char === 'n' ? '\n' : char === 't' ? '\t' : char === 'r' ? '\r' : '\\');

  const literals = [];
  const tokens = [];

  let last = 0;
  let match;

  PATTERN_TOKEN.lastIndex = 0;

  while ((match = PATTERN_TOKEN.exec(source)) !== null) {
    literals.push(source.slice(last, match.index));
    tokens.push(match[1] || 'value');
    last = match.index + match[0].length;
  }

  literals.push(source.slice(last));

  let literalLength = 0;
  for (const literal of literals) literalLength += literal.length;

  return { literals, tokens, literalLength };
}

function renderPattern(compiled, value, index) {
  const { literals, tokens } = compiled;

  let result = literals[0];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    result += (token === 'value' ? value : token === 'n' ? index + 1 : index) + literals[i + 1];
  }

  return result;
}

function digitCount(n) {
  if (n < 10) return 1;
  if (n < 100) return 2;
  if (n < 1000) return 3;
  if (n < 10000) return 4;
  if (n < 100000) return 5;
  if (n < 1000000) return 6;
  return String(n).length;
}

// Length renderPattern would produce, without building the string
function measurePattern(compiled, valueLength, index) {
  let total = compiled.literalLength;

  for (const token of compiled.tokens) {
    total += token === 'value' ? valueLength
      : token === 'n' ? digitCount(index + 1)
        : digitCount(index);
  }

  return total;
}

// Anything Number() could still parse: hex/octal/binary radixes, exponents, Infinity
const MAYBE_NUMERIC = /^[-+0-9.a-fA-FxXoOiInNtTyY]+$/;

function isExoticNumber(value) {
  return MAYBE_NUMERIC.test(value) && !isNaN(value);
}

// Fast path for plain integers and decimals, exact !isNaN() semantics otherwise
function isPlainNumber(value) {
  const length = value.length;
  if (length === 0) return false;

  let i = 0;
  const first = value.charCodeAt(0);

  if (first === 43 || first === 45) {
    if (length === 1) return false;
    i = 1;
  }

  let digits = 0;
  let dots = 0;

  for (; i < length; i++) {
    const code = value.charCodeAt(i);

    if (code >= 48 && code <= 57) digits++;
    else if (code === 46) { if (++dots > 1) return isExoticNumber(value); }
    else return isExoticNumber(value);
  }

  return digits > 0 || isExoticNumber(value);
}

function countQuotes(value) {
  let total = 0;
  for (let i = 0; i < value.length; i++) if (value.charCodeAt(i) === 39) total++;
  return total;
}

// Keeps the first `cap` characters verbatim while still counting the true total
function createSink(cap, separatorLength) {
  return { parts: [], length: 0, count: 0, cap, separatorLength, capped: false };
}

function push(sink, piece) {
  sink.length += (sink.count ? sink.separatorLength : 0) + piece.length;
  sink.count++;
  sink.parts.push(piece);
  if (sink.length >= sink.cap) sink.capped = true;
}

function grow(sink, pieceLength) {
  sink.length += (sink.count ? sink.separatorLength : 0) + pieceLength;
  sink.count++;
}

export function convertText(text, options, DOM, state, cap = CONFIG.OUTPUT_LIMIT) {

  const visible = new Set(options.visiblePanels || OUTPUT_KEYS);

  // Only compute the intermediates that a visible panel actually needs
  const needRaw = RAW_BASED.some(key => visible.has(key));
  const needSql = visible.has('sql');
  const needJson = JSON_BASED.some(key => visible.has(key));
  const customPattern = visible.has('custom') && (options.customPattern || '').trim()
    ? compilePattern(options.customPattern)
    : null;

  const quote = options.quoteStyle === 'double' ? '"' : "'";
  const sqlPrefix = options.sqlDialect === 'standard' ? '' : 'N';
  const sqlOverhead = sqlPrefix.length + 2;
  const plainNumbers = options.numbersFormat === 'plain';
  const seen = options.dedupe ? new Set() : null;

  const sinks = {
    raw: createSink(cap, 2),
    sql: createSink(cap, 2),
    json: createSink(cap, 2),
    custom: createSink(cap, 1)
  };

  const parts = text.split('\n');
  const lineCount = parts.length;

  let customIndex = 0;
  let i = 0;

  // Phase 1: build real text until every visible panel has filled its window
  for (; i < lineCount; i++) {
    let line = parts[i];
    const last = line.length - 1;

    if (last < 0) continue;
    if (line.charCodeAt(0) <= 32 || line.charCodeAt(last) <= 32) line = line.trim();
    if (!line) continue;

    if (seen) {
      if (seen.has(line)) continue;
      seen.add(line);
    }

    const numeric = plainNumbers && isPlainNumber(line);

    if (needRaw) push(sinks.raw, numeric ? line : quote + line + quote);

    if (needSql) {
      const escaped = line.indexOf("'") === -1 ? line : line.replace(SQL_QUOTE, "''");
      push(sinks.sql, sqlPrefix + "'" + escaped + "'");
    }

    if (needJson) push(sinks.json, numeric ? line : JSON.stringify(line));

    if (customPattern) push(sinks.custom, renderPattern(customPattern, line, customIndex++));

    if ((!needRaw || sinks.raw.capped) &&
      (!needSql || sinks.sql.capped) &&
      (!needJson || sinks.json.capped) &&
      (!customPattern || sinks.custom.capped)) {
      i++;
      break;
    }
  }

  // Phase 2: the rest is never displayed, so only its length matters
  for (; i < lineCount; i++) {
    let line = parts[i];
    const last = line.length - 1;

    if (last < 0) continue;
    if (line.charCodeAt(0) <= 32 || line.charCodeAt(last) <= 32) line = line.trim();
    if (!line) continue;

    if (seen) {
      if (seen.has(line)) continue;
      seen.add(line);
    }

    const length = line.length;
    const numeric = plainNumbers && isPlainNumber(line);

    if (needRaw) grow(sinks.raw, numeric ? length : length + 2);
    if (needSql) grow(sinks.sql, length + sqlOverhead + countQuotes(line));
    if (needJson) grow(sinks.json, numeric ? length : JSON.stringify(line).length);
    if (customPattern) grow(sinks.custom, measurePattern(customPattern, length, customIndex++));
  }

  for (const key of OUTPUT_KEYS) {
    const textarea = DOM.outputs[key];

    if (!visible.has(key)) {
      // Hidden panels are recomputed on demand; don't keep stale giant strings
      state.fullOutputs[key] = '';
      if (textarea) textarea.value = '';
      continue;
    }

    const [sinkKey, prefix, suffix, separator] = SPECS[key];
    const sink = sinks[sinkKey];
    const total = prefix.length + sink.length + suffix.length;
    const head = prefix + sink.parts.join(separator);

    // Truncated panels rebuild their full text only when Copy asks for it
    state.fullOutputs[key] = sink.capped ? null : head + suffix;

    if (!textarea) continue;

    textarea.value = total > cap
      ? head.slice(0, cap) + `\n\n--- Output truncated (${total} characters) ---`
      : head + suffix;
  }
}

export function buildFullOutput(text, options, key) {
  const state = { fullOutputs: {} };

  convertText(text, { ...options, visiblePanels: [key] }, { outputs: {} }, state, Infinity);

  return state.fullOutputs[key] || '';
}
