import { createEditorState, applyEditorMode } from './core/editor.js';
import { initEvents } from './ui/events.js';

document.addEventListener('DOMContentLoaded', () => {

  const state = createEditorState();

  const DOM = {
    editor: document.getElementById('editor'),
    lineNumbers: document.getElementById('line-numbers'),
    convertBtn: document.getElementById('convertBtn'),
    rawOutput: document.getElementById('rawOutput'),
    jsOutput: document.getElementById('jsOutput'),
    sqlOutput: document.getElementById('sqlOutput'),
    deleteBtn: document.querySelector('.button.delete'),
    rawCopyBtn: document.getElementById('rawCopy'),
    jsCopyBtn: document.getElementById('jsCopy'),
    sqlCopyBtn: document.getElementById('sqlCopy'),
    classicBtn: document.getElementById('classic-editor-btn'),
    ultraBtn: document.getElementById('ultra-editor-btn'),
    monacoContainer: document.getElementById('monaco-editor-container'),
    optionsContainer: document.querySelector('.options-container'),
    buttonContainers: document.querySelectorAll('.button-container'),
    shortcutKbds: document.querySelectorAll('header kbd'),
    textEditor: document.querySelector('.text-editor')
  };

  state.fullOutputs = {
    raw: '',
    js: '',
    sql: ''
  };

  const options = JSON.parse(localStorage.getItem('userOptions')) || {
    quoteStyle: 'single',
    numbersFormat: 'plain'
  };

  require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.41.0/min/vs' } });

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

    applyEditorMode(state, DOM);
    initEvents(state, DOM, options);
  });
});
