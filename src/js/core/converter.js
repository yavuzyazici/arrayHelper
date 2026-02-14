import { CONFIG } from './utils.js';

export function convertText(text, options, DOM, state) {

  let rawParts = [];
  let sqlParts = [];
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '\n') {
      processLine(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current) processLine(current);

  const raw = rawParts.join(', ');
  const js = `[${raw}]`;
  const sql = `IN (${sqlParts.join(', ')})`;

  safeSetOutput(DOM.rawOutput, raw, 'raw');
  safeSetOutput(DOM.jsOutput, js, 'js');
  safeSetOutput(DOM.sqlOutput, sql, 'sql');

  function processLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    const isNumber = !isNaN(trimmed);

    let formatted =
      isNumber && options.numbersFormat === 'plain'
        ? trimmed
        : options.quoteStyle === 'double'
          ? `"${trimmed}"`
          : `'${trimmed}'`;

    rawParts.push(formatted);

    const escaped = trimmed.replace(/'/g, "''");
    sqlParts.push(`N'${escaped}'`);
  }

  function safeSetOutput(textarea, text, key) {
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
