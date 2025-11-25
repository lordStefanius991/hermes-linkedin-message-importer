// Editor per il corpo delle risposte (per lingua + mode)

const params = new URLSearchParams(window.location.search);
const MODE = params.get('mode') || 'polite_decline';
const LANG = params.get('lang') === 'it' ? 'it' : 'en';

// stessi default del popup
const DEFAULT_BODIES = {
  it: {
    polite_decline:
      "ti ringrazio per il messaggio e per aver pensato a me. Al momento non sto valutando nuove opportunità, ma ti sono grato per il contatto.",
    interested:
      "grazie per avermi contattato. L'opportunità mi sembra interessante e sarei disponibile ad approfondire. In particolare cerco ruoli full remote, con stack Java / backend e una RAL in linea con il mio profilo.",
    more_info:
      "ti ringrazio per la proposta. Prima di fissare una call mi aiuterebbe avere qualche dettaglio in più su: tipo di contratto, range RAL, modalità di lavoro (presenza/ibrido/remote) e stack tecnologico principale.\n\nCosì posso capire subito se l'opportunità può essere in linea con il mio percorso.",
  },
  en: {
    polite_decline:
      "thank you for your message and for considering me. At the moment I’m not actively looking for new opportunities, but I really appreciate you reaching out.",
    interested:
      "thank you for getting in touch. The opportunity sounds interesting and I’d be happy to discuss it further. I’m mainly looking for fully remote roles, with a Java / backend tech stack and a salary range aligned with my experience.",
    more_info:
      "thank you for reaching out. Before scheduling a call, it would help me to have a bit more information about: type of contract, salary range, work mode (on-site/hybrid/remote) and main tech stack.\n\nThis way I can quickly understand if the opportunity could be a good fit for my profile.",
  },
};

const I18N = {
  it: {
    title: (modeLabel) => `Modifica risposta: ${modeLabel}`,
    modeLabels: {
      polite_decline: 'Declina gentilmente',
      interested: 'Interessato',
      more_info: 'Chiedi più info',
    },
    info:
      "Qui modifichi il corpo del messaggio.\n\nHermes genererà la risposta completa come:\n\nCiao {nome},\n\n[questo testo]\n\nUn saluto,\n",
    save: 'Salva',
    reset: 'Ripristina default',
    close: 'Chiudi',
    statusSaved: 'Template salvato.',
    statusReset: 'Template riportato al default.',
  },
  en: {
    title: (modeLabel) => `Edit reply: ${modeLabel}`,
    modeLabels: {
      polite_decline: 'Polite decline',
      interested: 'Interested',
      more_info: 'Ask for more info',
    },
    info:
      "Here you edit the body of the message.\n\nHermes will generate the full reply as:\n\nHi {name},\n\n[this text]\n\nBest regards,\n",
    save: 'Save',
    reset: 'Reset to default',
    close: 'Close',
    statusSaved: 'Template saved.',
    statusReset: 'Template reset to default.',
  },
};

function ti(key, ...args) {
  const dict = I18N[LANG] || I18N.en;
  const entry = dict[key];
  if (typeof entry === 'function') return entry(...args);
  return entry;
}

const titleEl = document.getElementById('editor-title');
const infoEl = document.getElementById('info');
const textarea = document.getElementById('template-text');
const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');
const closeBtn = document.getElementById('close-btn');
const statusEl = document.getElementById('status');

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function getDefaultBody() {
  const langDefaults = DEFAULT_BODIES[LANG] || DEFAULT_BODIES.en;
  return langDefaults[MODE] || '';
}

// carica da storage
chrome.storage.sync.get(['hermesBodiesV1'], (res) => {
  const all = res && res.hermesBodiesV1 ? res.hermesBodiesV1 : {};
  const langBodies = all[LANG] || {};
  const current = langBodies[MODE] || getDefaultBody();

  const modeLabel = ti('modeLabels')[MODE] || MODE;
  titleEl.textContent = ti('title', modeLabel);
  infoEl.textContent = ti('info');
  textarea.value = current;

  saveBtn.textContent = ti('save');
  resetBtn.textContent = ti('reset');
  closeBtn.textContent = ti('close');
});

saveBtn.addEventListener('click', () => {
  const newText = textarea.value;

  chrome.storage.sync.get(['hermesBodiesV1'], (res) => {
    const all = res && res.hermesBodiesV1 ? res.hermesBodiesV1 : {};
    if (!all[LANG]) all[LANG] = {};
    all[LANG][MODE] = newText;
    chrome.storage.sync.set({ hermesBodiesV1: all }, () => {
      setStatus(ti('statusSaved'));
    });
  });
});

resetBtn.addEventListener('click', () => {
  const defaultText = getDefaultBody();
  textarea.value = defaultText;

  chrome.storage.sync.get(['hermesBodiesV1'], (res) => {
    const all = res && res.hermesBodiesV1 ? res.hermesBodiesV1 : {};
    if (all[LANG] && all[LANG][MODE]) {
      delete all[LANG][MODE];
    }
    chrome.storage.sync.set({ hermesBodiesV1: all }, () => {
      setStatus(ti('statusReset'));
    });
  });
});

closeBtn.addEventListener('click', () => {
  window.close();
});
