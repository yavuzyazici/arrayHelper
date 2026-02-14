import { updateLineNumbers, highlightActiveLine, applyEditorMode, loadMonaco } from '../core/editor.js';
import { convertText } from '../core/converter.js';
import { CONFIG } from '../core/utils.js';

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

        DOM.rawOutput.value = '';
        DOM.jsOutput.value = '';
        DOM.sqlOutput.value = '';

        state.fullOutputs.raw = '';
        state.fullOutputs.js = '';
        state.fullOutputs.sql = '';

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

    DOM.rawCopyBtn.addEventListener('click', () => copy('raw', DOM.rawOutput, DOM.rawCopyBtn));
    DOM.jsCopyBtn.addEventListener('click', () => copy('js', DOM.jsOutput, DOM.jsCopyBtn));
    DOM.sqlCopyBtn.addEventListener('click', () => copy('sql', DOM.sqlOutput, DOM.sqlCopyBtn));

    DOM.convertBtn.addEventListener('click', () => {
        const text =
            state.mode === 'ultra' && state.monaco
                ? state.monaco.getValue()
                : DOM.editor.value;

        convertText(text, options, DOM, state);
    });

    document.addEventListener('keydown', e => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            DOM.convertBtn.click();
        }
    });

    let debounce;
    DOM.editor.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            updateLineNumbers(state, DOM);
            highlightActiveLine(state, DOM);
        }, CONFIG.INPUT_DEBOUNCE);
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
        DOM.optionsContainer.addEventListener('click', () => {
            DOM.optionsContainer.classList.toggle('open');
        });
    }

    DOM.buttonContainers.forEach(container => {
        const buttons = container.querySelectorAll('.button');

        buttons.forEach(button => {
            button.addEventListener('click', function () {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                const alt = this.querySelector('img').alt;

                if (alt.includes('double-quote')) options.quoteStyle = 'double';
                if (alt.includes('single-quote')) options.quoteStyle = 'single';
                if (alt.includes('numbers-quote')) options.numbersFormat = 'quoted';
                if (alt.includes('numbers-without-quote')) options.numbersFormat = 'plain';

                localStorage.setItem('userOptions', JSON.stringify(options));
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
