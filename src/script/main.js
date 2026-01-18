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

      localStorage.setItem('editorMode', 'classic');
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
      localStorage.setItem('editorMode', 'ultra');
      setTimeout(() => monacoEditor.layout(), 1);
    }

    classicEditorBtn.addEventListener('click', showClassicEditor);
    ultraEditorBtn.addEventListener('click', showUltraEditor);

    const savedEditorMode = localStorage.getItem('editorMode');
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
  }

  function updateLineNumbers() {
    const lines = editor.value.split('\n').length;
    lineNumbers.innerHTML = '';
    for (let i = 1; i <= lines; i++) {
      const div = document.createElement('div');
      div.textContent = i;
      div.className = 'line';
      lineNumbers.appendChild(div);
    }
    highlightActiveLine();
    checkButtonVisibility(lines);
  }

  function syncScroll() {
    lineNumbers.scrollTop = editor.scrollTop;
  }

  function highlightActiveLine() {
    const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight, 10);
    const cursorPosition = editor.selectionStart;
    const lines = editor.value.substr(0, cursorPosition).split('\n');
    const currentLineIndex = lines.length;

    if (activeLineIndex === currentLineIndex) {
      return;
    }

    activeLineIndex = currentLineIndex;

    const startOffset = (activeLineIndex - 1) * lineHeight;
    editor.scrollTop = startOffset;

    const lineElements = lineNumbers.querySelectorAll('.line');
    lineElements[activeLineIndex - 1]?.classList.add('active-line');
    lineElements[activeLineIndex]?.classList.remove('active-line');
  }

  function setActiveLine(index) {
    activeLineIndex = index;
    highlightActiveLine();
  }

  function checkButtonVisibility(lines) {
    if (lines > 29) {
      convertBtn.classList.add('arrow-shifted');
    } else {
      convertBtn.classList.remove('arrow-shifted');
    }
  }

  function convertText() {
    const lines = (
      localStorage.getItem('editorMode') === 'ultra' && monacoEditor
        ? monacoEditor.getValue()
        : editor.value
    ).split('\n').filter(line => line.trim() !== '');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();

      if (!isNaN(trimmedLine) && trimmedLine !== '') {
        if (options.numbersFormat === 'quoted') {
          if (options.quoteStyle === 'double') {
            return `"${trimmedLine}"`;
          } else if (options.quoteStyle === 'single') {
            return `'${trimmedLine}'`;
          }
        } else {
          return Number(trimmedLine);
        }
      } else {
        if (options.quoteStyle === 'double') {
          return `"${trimmedLine}"`;
        } else if (options.quoteStyle === 'single') {
          return `'${trimmedLine}'`;
        }
      }
    });

    rawOutput.value = formattedLines.join(', ');
    jsOutput.value = `[${formattedLines.join(', ')}]`;
    const sqlFormattedLines = lines.map(line => {
      const trimmedLine = line.trim().replace(/'/g, "''");
      return `N'${trimmedLine}'`;
    });

    sqlOutput.value = `IN (${sqlFormattedLines.join(', ')})`;
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

  updateLineNumbers();

  editor.addEventListener('input', () => {
    updateLineNumbers();
    highlightActiveLine();
  });

  editor.addEventListener('scroll', syncScroll);

  lineNumbers.addEventListener('scroll', () => {
    editor.scrollTop = lineNumbers.scrollTop;
  });

  lineNumbers.addEventListener('click', (event) => {
    if (event.target.classList.contains('line')) {
      const lineIndex = parseInt(event.target.textContent, 10);
      setActiveLine(lineIndex);
      const cursorPosition = editor.value.split('\n').slice(0, lineIndex - 1).join('\n').length + (lineIndex > 1 ? 1 : 0);
      editor.setSelectionRange(cursorPosition, cursorPosition);
      editor.focus();
    }
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

});
