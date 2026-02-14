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

  initEvents(state, DOM, options);
  applyEditorMode(state, DOM);
});
