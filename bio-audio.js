(() => {
  const controls = document.querySelector('.bio-audio');
  const speech = window.speechSynthesis;
  if (!controls || !speech || typeof SpeechSynthesisUtterance !== 'function') return;

  const button = controls.querySelector('button');
  const status = controls.querySelector('[role="status"]');
  const paragraphs = [...document.querySelectorAll('#about .bio-copy p, #about .bio-copy h3')].map((p) => p.textContent.trim());
  let narration = null;

  function finish(message) {
    narration = null;
    button.textContent = 'Listen to the bio';
    status.textContent = message;
  }

  function readParagraph(index) {
    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    utterance.lang = 'en-US';
    utterance.rate = 0.94;
    narration = utterance;
    utterance.onend = () => {
      if (narration !== utterance) return;
      if (index + 1 < paragraphs.length) readParagraph(index + 1);
      else finish('Narration finished.');
    };
    utterance.onerror = () => {
      if (narration === utterance) finish('Audio is unavailable on this device.');
    };
    speech.speak(utterance);
  }

  button.addEventListener('click', () => {
    if (narration) {
      finish('');
      speech.cancel();
      return;
    }
    button.textContent = 'Stop narration';
    status.textContent = 'Reading the bio aloud.';
    readParagraph(0);
  });
  window.addEventListener('pagehide', () => {
    if (!narration) return;
    finish('');
    speech.cancel();
  });
  controls.hidden = false;
})();
