export const CONFIG = {
  MAX_CLASSIC_LINES: 50000,
  OUTPUT_LIMIT: 200000,
  SHIFT_BUTTON_THRESHOLD: 29,
  INPUT_DEBOUNCE: 50
};

export function countLinesFast(text) {
  let count = 1;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) count++;
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
