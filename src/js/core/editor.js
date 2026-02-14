import { countLinesFast, getCurrentLineIndex, CONFIG } from './utils.js';

export function createEditorState() {
  return {
    monaco: null,
    activeLineIndex: 0,
    prevLineCount: 0,
    mode: localStorage.getItem('editorMode') || 'classic'
  };
}

let monacoLoaded = false;
export function loadMonaco(state, DOM) {
  if (monacoLoaded) return;

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs/loader.js";

  script.onload = () => {

    require.config({
      paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' }
    });

    require(['vs/editor/editor.main'], function () {
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
      monacoLoaded = true;
    });
  };

  document.body.appendChild(script);
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
      setTimeout(() => state.monaco.layout(), 1);
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
  }

  localStorage.setItem('editorMode', state.mode);
}

export function updateLineNumbers(state, DOM) {
  if (state.mode !== 'classic') return;

  const lines = countLinesFast(DOM.editor.value);

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
