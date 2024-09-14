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
  let activeLineIndex = 1;

  // Varsayılan ayarlar
  const defaultOptions = {
    quoteStyle: 'double', // double or single for strings
    numbersFormat: 'plain' // plain or quoted for numbers
  };

  // Kullanıcı ayarlarını yükle
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

    activeLineIndex = currentLineIndex;

    const startOffset = (activeLineIndex - 1) * lineHeight;
    editor.scrollTop = startOffset;

    const lineElements = lineNumbers.querySelectorAll('.line');
    lineElements.forEach((line, index) => {
      if (index + 1 === activeLineIndex) {
        line.classList.add('active-line');
      } else {
        line.classList.remove('active-line');
      }
    });
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

  // Veriyi formatlara çevirme
function convertText() {
  const lines = editor.value.split('\n').filter(line => line.trim() !== '');

  // Verileri işlemek için numaraları ve metinleri kontrol et
  const formattedLines = lines.map(line => {
    const trimmedLine = line.trim();

    // Eğer sayıysa ve tırnak işareti olmadan düz formatta gelmesi isteniyorsa
    if (!isNaN(trimmedLine) && trimmedLine !== '') {
      // Eğer numbersFormat 'quoted' ise sayılar tırnak içine alınacak
      if (options.numbersFormat === 'quoted') {
        if (options.quoteStyle === 'double') {
          return `"${trimmedLine}"`; // Sayılar çift tırnakla sarılır
        } else if (options.quoteStyle === 'single') {
          return `'${trimmedLine}'`; // Sayılar tek tırnakla sarılır
        }
      } else {
        // Eğer numbersFormat 'plain' ise sayılar yalın halde dönmeli
        return Number(trimmedLine); // Burada Number() kullanarak sayıyı tırnaksız döndürürüz
      }
    } else {
      // Eğer metinse, quoteStyle değerine göre işlenir
      if (options.quoteStyle === 'double') {
        return `"${trimmedLine}"`; // Metinler çift tırnakla sarılır
      } else if (options.quoteStyle === 'single') {
        return `'${trimmedLine}'`; // Metinler tek tırnakla sarılır
      }
    }
  });

  rawOutput.value = formattedLines.join(', ');
  jsOutput.value = `[${formattedLines.join(', ')}]`;
  sqlOutput.value = `IN (${formattedLines.join(', ')})`;
}

  // Kopyalama butonlarına tıklandığında "Copied" yazısı gözüksün
  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const copyLabel = button.querySelector('.inline-flex');
      copyLabel.textContent = 'Copied'; // Kopyalama sonrası "Copied" yazısını göster

      setTimeout(() => {
        copyLabel.textContent = 'Copy Text'; // Birkaç saniye sonra eski haline döndür
      }, 2000); // 2 saniye sonra tekrar "Copy Text" olacak
    }).catch(err => {
      console.error('Kopyalama hatası: ', err);
    });
  }

  // Delete butonu: Tüm textarea'ları temizle
  deleteBtn.addEventListener('click', () => {
    editor.value = '';
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

  // Copy butonlarına tıklama işlemleri
  rawCopyBtn.addEventListener('click', () => {
    copyToClipboard(rawOutput.value, rawCopyBtn);
  });

  jsCopyBtn.addEventListener('click', () => {
    copyToClipboard(jsOutput.value, jsCopyBtn);
  });

  sqlCopyBtn.addEventListener('click', () => {
    copyToClipboard(sqlOutput.value, sqlCopyBtn);
  });

  // button

  const buttonContainers = document.querySelectorAll('.button-container');

  buttonContainers.forEach(container => {
    const buttons = container.querySelectorAll('.button');

    buttons.forEach(button => {
      button.addEventListener('click', function () {
        buttons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const imgAlt = this.querySelector('img').alt;

        // Metinler için quoteStyle belirle
        if (imgAlt.includes('double-quote')) {
          options.quoteStyle = 'double';
        } else if (imgAlt.includes('single-quote')) {
          options.quoteStyle = 'single';
        }

        // Sayılar için numbersFormat belirle
        if (imgAlt.includes('numbers-quote')) {
          options.numbersFormat = 'quoted'; // Sayılar da tırnaklı olacak
        } else if (imgAlt.includes('numbers-without-quote')) {
          options.numbersFormat = 'plain'; // Sayılar yalın olacak
        }

        saveOptions();
      });
    });
  });

  // Varsayılan veya kaydedilmiş kullanıcı tercihlerini yükle
  document.querySelectorAll('.button').forEach(button => {
    const imgAlt = button.querySelector('img').alt;

    // Önce tüm butonlardan 'active' sınıfını kaldır
    button.classList.remove('active');

    // Şimdi quoteStyle ve numbersFormat için butonları kontrol et
    if (imgAlt.includes('double-quote') && options.quoteStyle === 'double') {
      button.classList.add('active');
    } else if (imgAlt.includes('single-quote') && options.quoteStyle === 'single') {
      button.classList.add('active');
    }

    if (imgAlt.includes('numbers-quote') && options.numbersFormat === 'quoted') {
      button.classList.add('active');
    } else if (imgAlt.includes('numbers-plain') && options.numbersFormat === 'plain') {
      button.classList.add('active');
    }
  });

});
