export const OUTPUT_KEYS = ['raw', 'js', 'sql', 'py', 'php', 'json', 'cs', 'custom'];

export const DEFAULT_CUSTOM_PATTERN = "EXEC MyProcedure '{}';";

export const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const CONFIG = {
  MAX_CLASSIC_LINES: 50000,
  MONACO_PREWARM_LINES: 25000,
  OUTPUT_LIMIT: 200000,
  SHIFT_BUTTON_THRESHOLD: 29,
  INPUT_DEBOUNCE: 50,
  AUTO_RUN_MAX_LINES: 40,
  MAX_VISIBLE_PANELS: 3
};

export function countLinesFast(text, limit = Infinity) {
  let count = 1;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      count++;
      if (count > limit) return count;
    }
  }
  return count;
}

export function getCurrentLineIndex(text, pos) {
  let count = 1;
  for (let i = 0; i < pos; i++) {
    if (text.charCodeAt(i) === 10) count++;
  }
  return count;
}
