import { countLinesFast, getCurrentLineIndex, CONFIG, IS_MOBILE } from './utils.js?v=20260731';

const MONACO_VS = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs';

export function createEditorState() {
  return {
    monaco: null,
    activeLineIndex: 0,
    prevLineCount: 0,
    mode: localStorage.getItem('editorMode') || 'classic'
  };
}

let loaderPromise = null;
function loadAmdLoader() {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${MONACO_VS}/loader.js`;

    script.onload = resolve;
    script.onerror = () => {
      loaderPromise = null;
      script.remove();
      reject();
    };

    document.head.appendChild(script);
  });

  return loaderPromise;
}

let monacoPromise = null;
export function prewarmMonaco() {
  if (monacoPromise) return monacoPromise;

  monacoPromise = loadAmdLoader()
    .then(() => new Promise((resolve, reject) => {
      require.config({ paths: { vs: MONACO_VS } });
      require(['vs/editor/editor.main'], resolve, reject);
    }))
    .catch(error => {
      monacoPromise = null;
      throw error;
    });

  return monacoPromise;
}

export function focusEditor(state, DOM) {
  if (IS_MOBILE) return;

  if (state.mode === 'ultra') {
    state.monaco?.focus();
  } else {
    DOM.editor.focus({ preventScroll: true });
  }
}

let creatingMonaco = false;
export function loadMonaco(state, DOM) {
  if (state.monaco || creatingMonaco) return;
  creatingMonaco = true;

  prewarmMonaco().then(() => {
    creatingMonaco = false;

    state.monaco = monaco.editor.create(DOM.monacoContainer, {
      value: DOM.editor.value,
      language: 'text',
      theme: 'vs-light',
      automaticLayout: true,
      acceptSuggestionOnEnter: 'off',
      tabCompletion: 'on',
      wordBasedSuggestions: true,
    });

    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      command: null,
      when: 'editorTextFocus'
    });

    state.monaco.onDidChangeModelContent(() => state.onUltraInput?.());

    if (state.mode === 'ultra') {
      state.monaco.layout();
      focusEditor(state, DOM);
    }
  }).catch(() => {
    creatingMonaco = false;
  });
}

export function applyEditorMode(state, DOM) {

  if (state.mode === 'ultra') {
    DOM.editor.classList.add('hidden');
    DOM.monacoContainer.classList.remove('hidden');
    DOM.classicBtn.classList.remove('active');
    DOM.ultraBtn.classList.add('active');
    DOM.lineNumbers.classList.add('hidden');
    DOM.convertBtn.classList.add('arrow-shifted');
    DOM.textEditor.style.width = '100%';

    loadMonaco(state, DOM)

    if (state.monaco) {
      state.monaco.setValue(DOM.editor.value);
      setTimeout(() => {
        state.monaco.layout();
        focusEditor(state, DOM);
      }, 1);
    }

  } else {
    DOM.editor.classList.remove('hidden');
    DOM.monacoContainer.classList.add('hidden');
    DOM.classicBtn.classList.add('active');
    DOM.ultraBtn.classList.remove('active');
    DOM.lineNumbers.classList.remove('hidden');
    DOM.textEditor.style.width = '';
    DOM.convertBtn.classList.remove('arrow-shifted');

    if (state.monaco) {
      DOM.editor.value = state.monaco.getValue();
    }

    focusEditor(state, DOM);
  }

  localStorage.setItem('editorMode', state.mode);
}

export function updateLineNumbers(state, DOM) {
  if (state.mode !== 'classic') return;

  const lines = countLinesFast(DOM.editor.value, CONFIG.MAX_CLASSIC_LINES);

  if (lines > CONFIG.MONACO_PREWARM_LINES) prewarmMonaco().catch(() => {});

  if (lines > CONFIG.MAX_CLASSIC_LINES) {
    alert("Too many lines. Switching to Ultra mode.");
    state.mode = 'ultra';
    applyEditorMode(state, DOM);
    return;
  }

  if (lines === state.prevLineCount) return;

  if (lines > state.prevLineCount) {
    const fragment = document.createDocumentFragment();

    for (let i = state.prevLineCount + 1; i <= lines; i++) {
      const div = document.createElement('div');
      div.textContent = i;
      div.className = 'line';
      fragment.appendChild(div);
    }

    DOM.lineNumbers.appendChild(fragment);
  } else {
    for (let i = state.prevLineCount; i > lines; i--) {
      DOM.lineNumbers.lastElementChild?.remove();
    }
  }

  state.prevLineCount = lines;
  checkButtonVisibility(lines, DOM);
}

export function highlightActiveLine(state, DOM) {
  if (state.mode !== 'classic') return;

  const index = getCurrentLineIndex(DOM.editor.value, DOM.editor.selectionStart);
  const lines = DOM.lineNumbers.children;

  if (state.activeLineIndex > 0) {
    lines[state.activeLineIndex - 1]?.classList.remove('active-line');
  }

  lines[index - 1]?.classList.add('active-line');
  state.activeLineIndex = index;
}

function checkButtonVisibility(lines, DOM) {
  if (lines > CONFIG.SHIFT_BUTTON_THRESHOLD) {
    DOM.convertBtn.classList.add('arrow-shifted');
  } else {
    DOM.convertBtn.classList.remove('arrow-shifted');
  }
}
