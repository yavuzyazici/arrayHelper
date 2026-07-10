import { createEditorState, applyEditorMode } from './core/editor.js';
import { initEvents } from './ui/events.js';
import { OUTPUT_KEYS } from './core/utils.js';

document.addEventListener('DOMContentLoaded', () => {

  const state = createEditorState();

  const DOM = {
    editor: document.getElementById('editor'),
    lineNumbers: document.getElementById('line-numbers'),
    convertBtn: document.getElementById('convertBtn'),
    deleteBtn: document.querySelector('.button.delete'),
    classicBtn: document.getElementById('classic-editor-btn'),
    ultraBtn: document.getElementById('ultra-editor-btn'),
    autoRunToggle: document.getElementById('auto-run-toggle'),
    dedupeToggle: document.getElementById('dedupe-toggle'),
    delimiterSegment: document.getElementById('delimiter-segment'),
    sqlDialectSegment: document.getElementById('sql-dialect-segment'),
    panelChips: document.getElementById('panel-chips'),
    outputsContainer: document.getElementById('outputsContainer'),
    outputs: {},
    copyBtns: {},
    monacoContainer: document.getElementById('monaco-editor-container'),
    optionsContainer: document.querySelector('.options-container'),
    buttonContainers: document.querySelectorAll('.button-container'),
    shortcutKbds: document.querySelectorAll('header kbd'),
    textEditor: document.querySelector('.text-editor')
  };

  state.fullOutputs = {};
  OUTPUT_KEYS.forEach(key => {
    DOM.outputs[key] = document.getElementById(`${key}Output`);
    DOM.copyBtns[key] = document.getElementById(`${key}Copy`);
    state.fullOutputs[key] = '';
  });

  const options = {
    quoteStyle: 'single',
    numbersFormat: 'plain',
    autoRun: false,
    delimiter: 'line',
    dedupe: false,
    sqlDialect: 'mssql',
    visiblePanels: ['raw', 'js', 'sql'],
    outputOrder: [...OUTPUT_KEYS],
    ...(JSON.parse(localStorage.getItem('userOptions')) || {})
  };

  initEvents(state, DOM, options);
  applyEditorMode(state, DOM);
});
