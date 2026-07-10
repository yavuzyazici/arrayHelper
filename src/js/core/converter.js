import { CONFIG, OUTPUT_KEYS } from './utils.js?v=20260711';

// Which intermediate parts each output format is built from
const RAW_BASED = ['raw', 'js', 'py', 'php'];
const JSON_BASED = ['json', 'cs'];

export function convertText(text, options, DOM, state) {

  const visible = new Set(options.visiblePanels || OUTPUT_KEYS);

  // Only compute the intermediates that a visible panel actually needs
  const needRaw = RAW_BASED.some(key => visible.has(key));
  const needSql = visible.has('sql');
  const needJson = JSON_BASED.some(key => visible.has(key));

  const quote = options.quoteStyle === 'double' ? '"' : "'";
  const sqlPrefix = options.sqlDialect === 'standard' ? '' : 'N';
  const plainNumbers = options.numbersFormat === 'plain';
  const seen = options.dedupe ? new Set() : null;

  const rawParts = [];
  const sqlParts = [];
  const jsonParts = [];

  const parts = text.split(/\r?\n/);

  for (let i = 0; i < parts.length; i++) {
    const trimmed = parts[i].trim();
    if (!trimmed) continue;

    if (seen) {
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
    }

    const isPlainNumber = plainNumbers && !isNaN(trimmed);

    if (needRaw) {
      rawParts.push(isPlainNumber ? trimmed : quote + trimmed + quote);
    }

    if (needSql) {
      const escaped = trimmed.includes("'") ? trimmed.replace(/'/g, "''") : trimmed;
      sqlParts.push(sqlPrefix + "'" + escaped + "'");
    }

    if (needJson) {
      jsonParts.push(isPlainNumber ? trimmed : JSON.stringify(trimmed));
    }
  }

  const raw = needRaw ? rawParts.join(', ') : '';
  const json = needJson ? jsonParts.join(', ') : '';

  const builders = {
    raw: () => raw,
    js: () => `[${raw}]`,
    sql: () => `IN (${sqlParts.join(', ')})`,
    py: () => `[${raw}]`,
    php: () => `array(${raw})`,
    json: () => `[${json}]`,
    cs: () => `new[] { ${json} }`
  };

  for (const key of OUTPUT_KEYS) {
    if (visible.has(key)) {
      safeSetOutput(DOM.outputs[key], builders[key](), key);
    } else {
      // Hidden panels are recomputed on demand; don't keep stale giant strings
      state.fullOutputs[key] = '';
      if (DOM.outputs[key]) DOM.outputs[key].value = '';
    }
  }

  function safeSetOutput(textarea, text, key) {
    if (!textarea) return;

    state.fullOutputs[key] = text;

    if (text.length > CONFIG.OUTPUT_LIMIT) {
      textarea.value =
        text.slice(0, CONFIG.OUTPUT_LIMIT) +
        `\n\n--- Output truncated (${text.length} characters) ---`;
    } else {
      textarea.value = text;
    }
  }
}
