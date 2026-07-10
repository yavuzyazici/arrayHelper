import { CONFIG } from './utils.js';

const DELIMITERS = {
  line: /\r?\n/,
  comma: /[,\r\n]/,
  semicolon: /[;\r\n]/,
  tab: /[\t\r\n]/
};

export function convertText(text, options, DOM, state) {

  const quote = options.quoteStyle === 'double' ? '"' : "'";
  const sqlPrefix = options.sqlDialect === 'standard' ? '' : 'N';
  const seen = options.dedupe ? new Set() : null;

  const rawParts = [];
  const sqlParts = [];
  const jsonParts = [];

  const parts = text.split(DELIMITERS[options.delimiter] || DELIMITERS.line);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (seen) {
      if (seen.has(trimmed)) continue;
      seen.add(trimmed);
    }

    const isPlainNumber = !isNaN(trimmed) && options.numbersFormat === 'plain';

    rawParts.push(isPlainNumber ? trimmed : quote + trimmed + quote);
    sqlParts.push(`${sqlPrefix}'${trimmed.replace(/'/g, "''")}'`);
    jsonParts.push(isPlainNumber ? trimmed : JSON.stringify(trimmed));
  }

  const raw = rawParts.join(', ');
  const json = jsonParts.join(', ');

  const outputs = {
    raw,
    js: `[${raw}]`,
    sql: `IN (${sqlParts.join(', ')})`,
    py: `[${raw}]`,
    php: `array(${raw})`,
    json: `[${json}]`,
    cs: `new[] { ${json} }`
  };

  for (const key of Object.keys(outputs)) {
    safeSetOutput(DOM.outputs[key], outputs[key], key);
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
