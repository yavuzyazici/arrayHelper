import { updateLineNumbers, highlightActiveLine, applyEditorMode, loadMonaco } from '../core/editor.js';
import { convertText } from '../core/converter.js';
import { CONFIG, countLinesFast } from '../core/utils.js';

export function initEvents(state, DOM, options) {
    updateLineNumbers(state, DOM);
    highlightActiveLine(state, DOM);

    const kbdCtrlCmd = DOM.shortcutKbds[0];
    const kbdEnter = DOM.shortcutKbds[1];

    document.addEventListener('keydown', e => {
        if (e.key === 'Control' || e.key === 'Meta') {
            kbdOn(kbdCtrlCmd);
        }

        if (e.key === 'Enter') {
            kbdOn(kbdEnter);
        }

        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            DOM.convertBtn.click();
        }
    });

    document.addEventListener('keyup', e => {

        if (e.key === 'Control' || e.key === 'Meta') {
            kbdOff(kbdCtrlCmd);
        }

        if (e.key === 'Enter' || e.code === 'NumpadEnter') {
            kbdOff(kbdEnter);
        }
    });

    DOM.classicBtn.addEventListener('click', () => {
        state.mode = 'classic';
        applyEditorMode(state, DOM);
        updateLineNumbers(state, DOM);
    });

    DOM.ultraBtn.addEventListener('click', () => {
        state.mode = 'ultra';
        applyEditorMode(state, DOM);
    });

    DOM.deleteBtn.addEventListener('click', () => {
        DOM.editor.value = '';
        state.monaco?.setValue('');

        Object.keys(DOM.outputs).forEach(key => {
            DOM.outputs[key].value = '';
            state.fullOutputs[key] = '';
        });

        updateLineNumbers(state, DOM);
    });

    /* Copy */
    function copy(key, textarea, button) {
        const fullText = state.fullOutputs[key] || textarea.value;

        navigator.clipboard.writeText(fullText).then(() => {
            const label = button.querySelector('.inline-flex');
            label.textContent = 'Copied';
            setTimeout(() => label.textContent = 'Copy Text', 2000);
        });
    }

    Object.entries(DOM.copyBtns).forEach(([key, btn]) => {
        btn.addEventListener('click', () => copy(key, DOM.outputs[key], btn));
    });

    function getEditorText() {
        return state.mode === 'ultra' && state.monaco
            ? state.monaco.getValue()
            : DOM.editor.value;
    }

    DOM.convertBtn.addEventListener('click', () => {
        convertText(getEditorText(), options, DOM, state);
    });

    /* Auto Run */
    function maybeAutoRun() {
        if (!options.autoRun) return;

        const text = getEditorText();
        if (countLinesFast(text) > CONFIG.AUTO_RUN_MAX_LINES) return;

        convertText(text, options, DOM, state);
    }

    /* Re-convert immediately when a setting that affects the output changes */
    function refreshOutputs() {
        const text = getEditorText();
        if (!text.trim()) return;

        convertText(text, options, DOM, state);
    }

    const saveOptions = () => localStorage.setItem('userOptions', JSON.stringify(options));

    function initToggle(button, key) {
        const render = () => {
            button.classList.toggle('on', options[key]);
            button.setAttribute('aria-checked', String(options[key]));
        };
        render();

        button.addEventListener('click', () => {
            options[key] = !options[key];
            render();
            saveOptions();
            refreshOutputs();
        });
    }

    initToggle(DOM.autoRunToggle, 'autoRun');
    initToggle(DOM.dedupeToggle, 'dedupe');

    function initSegment(segment, attr, key) {
        const buttons = segment.querySelectorAll(`[data-${attr}]`);
        const render = () => {
            buttons.forEach(btn => btn.classList.toggle('active', btn.dataset[attr] === options[key]));
        };
        render();

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                options[key] = btn.dataset[attr];
                render();
                saveOptions();
                refreshOutputs();
            });
        });
    }

    initSegment(DOM.delimiterSegment, 'delimiter', 'delimiter');
    initSegment(DOM.sqlDialectSegment, 'dialect', 'sqlDialect');

    /* Panel visibility (max 3 visible at once) */
    if (options.visiblePanels.length > CONFIG.MAX_VISIBLE_PANELS) {
        options.visiblePanels = options.visiblePanels.slice(0, CONFIG.MAX_VISIBLE_PANELS);
        saveOptions();
    }

    function applyPanelVisibility() {
        DOM.outputsContainer.querySelectorAll('.output-section').forEach(section => {
            section.classList.toggle('hidden', !options.visiblePanels.includes(section.dataset.output));
        });

        DOM.panelChips.querySelectorAll('.panel-chip').forEach(chip => {
            chip.classList.toggle('active', options.visiblePanels.includes(chip.dataset.panel));
        });
    }

    applyPanelVisibility();

    DOM.panelChips.querySelectorAll('.panel-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const key = chip.dataset.panel;

            if (options.visiblePanels.includes(key)) {
                if (options.visiblePanels.length === 1) return;
                options.visiblePanels = options.visiblePanels.filter(k => k !== key);
            } else {
                if (options.visiblePanels.length >= CONFIG.MAX_VISIBLE_PANELS) {
                    chip.classList.add('chip-denied');
                    setTimeout(() => chip.classList.remove('chip-denied'), 400);
                    return;
                }
                options.visiblePanels = [...options.visiblePanels, key];
            }

            saveOptions();
            applyPanelVisibility();
            refreshOutputs();
        });
    });

    let autoRunDebounce;
    state.onUltraInput = () => {
        clearTimeout(autoRunDebounce);
        autoRunDebounce = setTimeout(maybeAutoRun, CONFIG.INPUT_DEBOUNCE);
    };

    let debounce;
    DOM.editor.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            updateLineNumbers(state, DOM);
            highlightActiveLine(state, DOM);
            maybeAutoRun();
        }, CONFIG.INPUT_DEBOUNCE);
    });

    /* Let Tab insert a real tab character when it is the active delimiter */
    DOM.editor.addEventListener('keydown', e => {
        if (e.key !== 'Tab' || options.delimiter !== 'tab') return;
        e.preventDefault();

        DOM.editor.setRangeText('\t', DOM.editor.selectionStart, DOM.editor.selectionEnd, 'end');
        DOM.editor.dispatchEvent(new Event('input'));
    });

    DOM.editor.addEventListener('click', () => {
        highlightActiveLine(state, DOM);
    });

    document.addEventListener('selectionchange', () => {
        if (state.mode !== 'classic') return;

        if (document.activeElement === DOM.editor) {
            highlightActiveLine(state, DOM);
        }
    });

    DOM.editor.addEventListener('scroll', () => {
        DOM.lineNumbers.scrollTop = DOM.editor.scrollTop;
    });

    DOM.lineNumbers.addEventListener('scroll', () => {
        DOM.editor.scrollTop = DOM.lineNumbers.scrollTop;
    });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && DOM.optionsContainer) {
        DOM.optionsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.editor-selector-menu')) return;
            DOM.optionsContainer.classList.toggle('open');
        });
    }

    /* Output sections: saved order + drag & drop */
    applyOutputOrder();
    initOutputDragDrop();

    function applyOutputOrder() {
        const domOrder = [...DOM.outputsContainer.querySelectorAll('.output-section')]
            .map(s => s.dataset.output);
        const saved = (options.outputOrder || []).filter(key => domOrder.includes(key));
        const order = [...saved, ...domOrder.filter(key => !saved.includes(key))];

        order.forEach(key => {
            const section = DOM.outputsContainer.querySelector(`.output-section[data-output="${key}"]`);
            if (section) DOM.outputsContainer.appendChild(section);
        });

        options.outputOrder = order;
    }

    function initOutputDragDrop() {
        const container = DOM.outputsContainer;
        let dragged = null;

        container.querySelectorAll('.output-section').forEach(section => {
            const header = section.querySelector('.output-header');

            header.addEventListener('dragstart', e => {
                dragged = section;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', section.dataset.output);
                setTimeout(() => section.classList.add('dragging'), 0);
            });

            header.addEventListener('dragend', () => {
                dragged?.classList.remove('dragging');
                dragged = null;

                options.outputOrder = [...container.querySelectorAll('.output-section')]
                    .map(s => s.dataset.output);
                localStorage.setItem('userOptions', JSON.stringify(options));
            });

            section.addEventListener('dragover', e => {
                if (!dragged || dragged === section) return;
                e.preventDefault();

                const rect = section.getBoundingClientRect();
                const insertBefore = e.clientY < rect.top + rect.height / 2;
                container.insertBefore(dragged, insertBefore ? section : section.nextSibling);
            });
        });
    }

    DOM.buttonContainers.forEach(container => {
        const buttons = container.querySelectorAll('.button');

        buttons.forEach(button => {
            const alt = button.querySelector('img').alt;

            if (alt === 'double-quote') button.classList.toggle('active', options.quoteStyle === 'double');
            if (alt === 'single-quote') button.classList.toggle('active', options.quoteStyle === 'single');
            if (alt === 'numbers-quote') button.classList.toggle('active', options.numbersFormat === 'quoted');
            if (alt === 'numbers-without-quote') button.classList.toggle('active', options.numbersFormat === 'plain');

            button.addEventListener('click', function () {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                if (alt === 'double-quote') options.quoteStyle = 'double';
                if (alt === 'single-quote') options.quoteStyle = 'single';
                if (alt === 'numbers-quote') options.numbersFormat = 'quoted';
                if (alt === 'numbers-without-quote') options.numbersFormat = 'plain';

                saveOptions();
                refreshOutputs();
            });
        });
    });

    function kbdOn(el) {
        if (!el) return;
        el.classList.add('kbd-down');
    }

    function kbdOff(el) {
        if (!el) return;
        el.classList.remove('kbd-down');
    }
}
