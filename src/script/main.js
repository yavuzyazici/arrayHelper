document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');
  const convertBtn = document.getElementById('convertBtn');
  const rawOutput = document.getElementById('rawOutput');
  const jsOutput = document.getElementById('jsOutput');
  const sqlOutput = document.getElementById('sqlOutput');
  const deleteBtn = document.querySelector('.button.delete');
  const rawCopyBtn = document.getElementById('rawCopy');
  const jsCopyBtn = document.getElementById('jsCopy');
  const sqlCopyBtn = document.getElementById('sqlCopy');
  const classicEditorBtn = document.getElementById('classic-editor-btn');
  const ultraEditorBtn = document.getElementById('ultra-editor-btn');
  const monacoEditorContainer = document.getElementById('monaco-editor-container');
  const shortcutKbds = document.querySelectorAll('header kbd');
  const kbdCtrlCmd = shortcutKbds[0];
  const kbdEnter = shortcutKbds[1];
  let monacoEditor;
  let activeLineIndex = 0;
  let prevLineCount = 0;
  let savedEditorMode = localStorage.getItem('editorMode');

  require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' } });
  require(['vs/editor/editor.main'], function () {
    monacoEditor = monaco.editor.create(monacoEditorContainer, {
      value: editor.value,
      language: 'text',
      theme: 'vs-light',
      automaticLayout: true,
      acceptSuggestionOnEnter: 'off',
      tabCompletion: 'on',
      wordBasedSuggestions: true,
    });
    //Ctrl + Enter was using by monaco editor as default.
    monaco.editor.addKeybindingRule({
      keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      command: null,
      when: 'editorTextFocus'
    });

    classicEditorBtn.addEventListener('click', showClassicEditor);
    ultraEditorBtn.addEventListener('click', showUltraEditor);

    if (savedEditorMode === 'ultra') {
      showUltraEditor();
    } else {
      showClassicEditor();
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const optionsContainer = document.querySelector('.options-container');

    if (isMobile) {
      optionsContainer.addEventListener('click', () => {
        optionsContainer.classList.toggle('open');
      });
    }
  });

  const defaultOptions = {
    quoteStyle: 'single',
    numbersFormat: 'plain'
  };

  const options = JSON.parse(localStorage.getItem('userOptions')) || defaultOptions;

  function saveOptions() {
    localStorage.setItem('userOptions', JSON.stringify(options));
    localStorage.setItem('editorMode', savedEditorMode);
  }

  function updateLineNumbers() {
    if (savedEditorMode !== 'classic') {
      return;
    }

    const lines = countLinesFast(editor.value);

    if (lines > 50000) {
      alert("Too many lines. Switching to Ultra mode for performance.");
      showUltraEditor();
      return;
    }

    if (prevLineCount === 0) {
      for (let i = 1; i <= lines; i++) {
        const div = document.createElement('div');
        div.textContent = i;
        div.className = 'line';
        lineNumbers.appendChild(div);
      }
      prevLineCount = lines;
      highlightActiveLine();
      checkButtonVisibility(lines);
      return;
    }

    if (lines === prevLineCount) {
      highlightActiveLine();
      checkButtonVisibility(lines);
      return;
    }

    if (lines > prevLineCount) {
      const fragment = document.createDocumentFragment();

      for (let i = prevLineCount + 1; i <= lines; i++) {
        const div = document.createElement('div');
        div.textContent = i;
        div.className = 'line';
        fragment.appendChild(div);
      }

      lineNumbers.appendChild(fragment);
    }
    else {
      for (let i = prevLineCount; i > lines; i--) {
        lineNumbers.lastElementChild?.remove();
      }
    }

    prevLineCount = lines;

    highlightActiveLine();
    checkButtonVisibility(lines);
  }

  function showClassicEditor() {
    editor.classList.remove('hidden');
    monacoEditorContainer.classList.add('hidden');
    classicEditorBtn.classList.add('active');
    ultraEditorBtn.classList.remove('active');
    lineNumbers.classList.remove('hidden');
    document.querySelector('.text-editor').style.width = '';
    editor.value = monacoEditor.getValue();
    convertBtn.classList.remove('arrow-shifted');
    updateLineNumbers();
    savedEditorMode = 'classic';
    saveOptions()
  }

  function showUltraEditor() {
    editor.classList.add('hidden');
    monacoEditorContainer.classList.remove('hidden');
    classicEditorBtn.classList.remove('active');
    ultraEditorBtn.classList.add('active');
    lineNumbers.classList.add('hidden');
    document.querySelector('.text-editor').style.width = '100%';
    convertBtn.classList.add('arrow-shifted');
    monacoEditor.setValue(editor.value);
    savedEditorMode = 'ultra';
    saveOptions()
    setTimeout(() => monacoEditor.layout(), 1);
  }

  function syncScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
  }

  function highlightActiveLine() {
    if (savedEditorMode !== 'classic') return;

    const currentLineIndex = getCurrentLineIndex(editor.value, editor.selectionStart);

    const lineElements = lineNumbers.children;

    if (activeLineIndex > 0) {
      lineElements[activeLineIndex - 1]?.classList.remove('active-line');
    }
    lineElements[currentLineIndex - 1]?.classList.add('active-line');

    activeLineIndex = currentLineIndex;
  }

  function checkButtonVisibility(lines) {
    if (lines > 29) {
      convertBtn.classList.add('arrow-shifted');
    } else {
      convertBtn.classList.remove('arrow-shifted');
    }
  }

  function convertText() {

    const text =
      savedEditorMode === 'ultra' && monacoEditor
        ? monacoEditor.getValue()
        : editor.value;

    let rawParts = [];
    let sqlParts = [];
    let current = '';

    const len = text.length;

    for (let i = 0; i < len; i++) {
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

    safeSetOutput(rawOutput, raw);
    safeSetOutput(jsOutput, js);
    safeSetOutput(sqlOutput, sql);

    function processLine(line) {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isNumber = !isNaN(trimmed);

      let formatted;

      if (isNumber && options.numbersFormat === 'plain') {
        formatted = trimmed;
      } else {
        formatted =
          options.quoteStyle === 'double'
            ? `"${trimmed}"`
            : `'${trimmed}'`;
      }

      rawParts.push(formatted);

      const escaped = trimmed.replace(/'/g, "''");
      sqlParts.push(`N'${escaped}'`);
    }
    function safeSetOutput(textarea, text) {
      const LIMIT = 200000; // 200k char

      if (text.length > LIMIT) {
        textarea.value =
          text.slice(0, LIMIT) +
          `\n\n--- Output truncated (${text.length} characters. *You can still copy everything you wrote) ---`;
      } else {
        textarea.value = text;
      }
    }
  }

  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const copyLabel = button.querySelector('.inline-flex');
      copyLabel.textContent = 'Copied';

      setTimeout(() => {
        copyLabel.textContent = 'Copy Text';
      }, 2000);
    }).catch(err => {
      console.error('Kopyalama hatası: ', err);
    });
  }

  deleteBtn.addEventListener('click', () => {
    editor.value = '';
    monacoEditor.setValue('');
    rawOutput.value = '';
    jsOutput.value = '';
    sqlOutput.value = '';
    updateLineNumbers();
  });

  let lineUpdateTimeout;

  editor.addEventListener('input', () => {
    clearTimeout(lineUpdateTimeout);
    lineUpdateTimeout = setTimeout(updateLineNumbers, 50);
  });

  editor.addEventListener('scroll', syncScroll);

  lineNumbers.addEventListener('scroll', () => {
    editor.scrollTop = lineNumbers.scrollTop;
  });

  editor.addEventListener('click', (event) => {
    highlightActiveLine();
  });

  convertBtn.addEventListener('click', convertText);

  document.addEventListener("keydown", function (event) {
    if (event.key === 'Control' || event.key === 'Meta') kbdOn(kbdCtrlCmd);
    if (event.key === 'Enter') kbdOn(kbdEnter);

    const isConvertShortcut = event.key === "Enter" && (event.ctrlKey || event.metaKey);

    if (isConvertShortcut) {
      event.preventDefault();
      convertText();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Control' || event.key === 'Meta') kbdOff(kbdCtrlCmd);
    if (event.key === 'Enter' || event.code === 'NumpadEnter') kbdOff(kbdEnter);
  });

  function kbdOn(el) {
    if (!el) return;
    el.classList.add('kbd-down');
  }

  function kbdOff(el) {
    if (!el) return;
    el.classList.remove('kbd-down');
  }

  rawCopyBtn.addEventListener('click', () => {
    copyToClipboard(rawOutput.value, rawCopyBtn);
  });

  jsCopyBtn.addEventListener('click', () => {
    copyToClipboard(jsOutput.value, jsCopyBtn);
  });

  sqlCopyBtn.addEventListener('click', () => {
    copyToClipboard(sqlOutput.value, sqlCopyBtn);
  });

  const buttonContainers = document.querySelectorAll('.button-container');

  buttonContainers.forEach(container => {
    const buttons = container.querySelectorAll('.button');

    buttons.forEach(button => {
      button.addEventListener('click', function () {
        buttons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const imgAlt = this.querySelector('img').alt;

        if (imgAlt.includes('double-quote')) {
          options.quoteStyle = 'double';
        } else if (imgAlt.includes('single-quote')) {
          options.quoteStyle = 'single';
        }

        if (imgAlt.includes('numbers-quote')) {
          options.numbersFormat = 'quoted';
        } else if (imgAlt.includes('numbers-without-quote')) {
          options.numbersFormat = 'plain';
        }

        saveOptions();
      });
    });
  });

  document.querySelectorAll('.button').forEach(button => {
    const imgAlt = button.querySelector('img').alt;

    button.classList.remove('active');

    if (imgAlt.includes('double-quote') && options.quoteStyle === 'double') {
      button.classList.add('active');
    } else if (imgAlt.includes('single-quote') && options.quoteStyle === 'single') {
      button.classList.add('active');
    }

    if (imgAlt.includes('numbers-quote') && options.numbersFormat === 'quoted') {
      button.classList.add('active');
    } else if (imgAlt.includes('numbers-without-quote') && options.numbersFormat === 'plain') {
      button.classList.add('active');
    }
  });

  function countLinesFast(text) {
    let count = 1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\n') count++;
    }
    return count;
  }
  function getCurrentLineIndex(text, pos) {
    let count = 1;
    for (let i = 0; i < pos; i++) {
      if (text.charCodeAt(i) === 10) count++; // '\n'
    }
    return count;
  }
});
