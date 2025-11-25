// ====================== I18N SEMPLICE =========================

let HERMES_LANG = 'en'; // it | en

function detectDefaultLang() {
  const lang =
    (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (lang.startsWith('it')) return 'it';
  return 'en';
}

const HERMES_I18N = {
  it: {
    title: 'Hermes',
    labelLanguage: 'Lingua',
    btnImportSidebar: 'Importa sidebar',
    btnImportThread: 'Importa thread corrente',
    btnOpenPanel: 'Apri pannello fisso',

    smartSectionTitle: 'Smart reply (clipboard)',

    btnSmartDecline: 'Declina gentilmente',
    btnSmartInterested: 'Interessato',
    btnSmartMoreInfo: 'Chiedi più info',
    footerSignature: 'by Stefano Paolucci', 

    statusNoTab:
      'Nessuna tab LinkedIn trovata. Apri la messaggistica e riprova.',
    statusSidebarInProgress: 'Hermes: estrazione sidebar in corso...',
    statusSidebarOk: (count) =>
      `Hermes: sidebar importata (${count} conversazioni).`,
    statusSidebarCommError: 'Hermes: impossibile comunicare con la sidebar.',

    statusThreadInProgress: 'Hermes: estrazione thread in corso...',
    statusThreadOk: (count) => `Hermes: thread importato (${count} messaggi).`,
    statusThreadCommError: 'Hermes: impossibile comunicare con il thread.',

    statusSmartPreparing: 'Hermes: preparo una risposta...',
    statusSmartInsertedNamed: (name) =>
      `Hermes: risposta inserita per "${name}". Controlla e premi Invia.`,
    statusSmartInsertedNoName:
      'Hermes: risposta inserita. Controlla il testo e premi Invia.',
    statusSmartClipboardFallback:
      'Hermes: risposta copiata. Incollala manualmente in LinkedIn.',
  },
  en: {
    title: 'Hermes',
    labelLanguage: 'Language',
    btnImportSidebar: 'Import sidebar',
    btnImportThread: 'Import current thread',
    btnOpenPanel: 'Open pinned panel',

    smartSectionTitle: 'Smart reply (clipboard)',

    btnSmartDecline: 'Polite decline',
    btnSmartInterested: 'Interested',
    btnSmartMoreInfo: 'Ask for more info',
     footerSignature: 'by Stefano Paolucci',

    statusNoTab: 'No LinkedIn tab found. Open Messaging and try again.',
    statusSidebarInProgress: 'Hermes: extracting sidebar...',
    statusSidebarOk: (count) =>
      `Hermes: sidebar imported (${count} conversations).`,
    statusSidebarCommError: 'Hermes: cannot communicate with sidebar.',

    statusThreadInProgress: 'Hermes: extracting thread...',
    statusThreadOk: (count) =>
      `Hermes: thread imported (${count} messages).`,
    statusThreadCommError: 'Hermes: cannot communicate with thread.',

    statusSmartPreparing: 'Hermes: preparing a reply...',
    statusSmartInsertedNamed: (name) =>
      `Hermes: reply inserted for "${name}". Review and press Send.`,
    statusSmartInsertedNoName:
      'Hermes: reply inserted. Review the text and press Send.',
    statusSmartClipboardFallback:
      'Hermes: reply copied. Paste it manually in LinkedIn.',
  },
};

function t(key, ...args) {
  const dict = HERMES_I18N[HERMES_LANG] || HERMES_I18N.en;
  const entry = dict[key];
  if (typeof entry === 'function') return entry(...args);
  if (typeof entry === 'string') return entry;
  return key;
}

// ================== TEMPLATE (solo BODY personalizzabile) ====================
// Corpo centrale del messaggio (senza saluto iniziale e firma)

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

// sovrascritture salvate dall'utente
let CUSTOM_BODIES = {}; // struttura: { it: { polite_decline: '...', ... }, en: {...} }

function getBodyFor(lang, mode) {
  const baseLang = DEFAULT_BODIES[lang] ? lang : 'en';
  const defaults = DEFAULT_BODIES[baseLang];
  const customLang = CUSTOM_BODIES[baseLang] || {};
  return customLang[mode] || defaults[mode];
}

// ================== LOGICA ESTENSIONE =========================

function getLinkedinMessagingTab(callback, onError) {
  chrome.tabs.query(
    {
      url: [
        '*://www.linkedin.com/messaging/*',
        '*://www.linkedin.com/messaging/thread/*',
      ],
    },
    (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.warn('[Hermes] Nessuna tab LinkedIn /messaging trovata.');
        if (onError) {
          onError(t('statusNoTab'));
        }
        return;
      }

      const targetTab = tabs[0];
      callback(targetTab);
    }
  );
}

function buildSmartReply(mode, interlocutorName) {
  const lang = HERMES_LANG === 'it' ? 'it' : 'en';
  const firstName =
    (interlocutorName || (lang === 'en' ? 'Recruiter' : 'Recruiter'))
      .split(' ')[0];
  const body = getBodyFor(lang, mode);

  if (lang === 'it') {
    const closing = 'Un saluto,\n';
    return `Ciao ${firstName},\n\n${body}\n\n${closing}`;
  } else {
    const closing = 'Best regards,\n';
    return `Hi ${firstName},\n\n${body}\n\n${closing}`;
  }
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    console.error('[Hermes] Errore copiando negli appunti:', err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const footer = document.getElementById('hermes-footer');
  const titleEl = document.getElementById('title');
  const btnSidebar = document.getElementById('import-sidebar');
  const btnThread = document.getElementById('import-thread');
  const openPanelBtn = document.getElementById('open-panel'); // undefined in panel.html
  const status = document.getElementById('status');

  const langLabel = document.getElementById('lang-label');
  const langSelect = document.getElementById('lang-select');

  const smartSectionTitle = document.getElementById('smart-section-title');
  const btnSmartDecline = document.getElementById('smart-decline');
  const btnSmartInterested = document.getElementById('smart-interested');
  const btnSmartMoreInfo = document.getElementById('smart-more-info');

  const btnSmartDeclineEdit = document.getElementById('smart-decline-edit');
  const btnSmartInterestedEdit =
    document.getElementById('smart-interested-edit');
  const btnSmartMoreInfoEdit = document.getElementById('smart-more-info-edit');

  function setStatus(msg) {
    if (status) {
      status.textContent = msg;
    }
  }

  function renderLabels() {
    if (titleEl) titleEl.textContent = t('title');
    if (langLabel) langLabel.textContent = t('labelLanguage');
    if (btnSidebar) btnSidebar.textContent = t('btnImportSidebar');
    if (btnThread) btnThread.textContent = t('btnImportThread');
    if (openPanelBtn) openPanelBtn.textContent = t('btnOpenPanel');
    if (smartSectionTitle)
      smartSectionTitle.textContent = t('smartSectionTitle');
    if (btnSmartDecline)
      btnSmartDecline.textContent = t('btnSmartDecline');
    if (btnSmartInterested)
      btnSmartInterested.textContent = t('btnSmartInterested');
    if (btnSmartMoreInfo)
      btnSmartMoreInfo.textContent = t('btnSmartMoreInfo');

    if (langSelect) {
      langSelect.value = HERMES_LANG;
    }
    if (footer) footer.textContent = t('footerSignature');
  }

  // Carico lingua + template da storage
  chrome.storage.sync.get(['hermesLang', 'hermesBodiesV1'], (res) => {
    const stored = res && typeof res.hermesLang === 'string' ? res.hermesLang : null;
    HERMES_LANG = stored || detectDefaultLang();
    CUSTOM_BODIES = res && res.hermesBodiesV1 ? res.hermesBodiesV1 : {};
    renderLabels();
  });

  // quando l'editor salva su chrome.storage.sync, aggiorniamo la cache locale
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.hermesBodiesV1) {
    CUSTOM_BODIES = changes.hermesBodiesV1.newValue || {};
    // opzionale: piccolo log per debug
    console.log('[Hermes] Template aggiornati da storage:', CUSTOM_BODIES);
  }
});

  // Cambio lingua da select
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      const val = langSelect.value === 'it' ? 'it' : 'en';
      HERMES_LANG = val;
      chrome.storage.sync.set({ hermesLang: val });
      renderLabels();
    });
  }

  // --- IMPORTA SIDEBAR ---
  if (btnSidebar) {
    btnSidebar.addEventListener('click', () => {
      setStatus(t('statusSidebarInProgress'));

      getLinkedinMessagingTab(
        (tab) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'HERMES_IMPORT_SIDEBAR' },
            (response) => {
              const err = chrome.runtime.lastError;
              if (err) {
                console.warn(
                  '[Hermes] Errore richiesta sidebar:',
                  err.message
                );
                setStatus(t('statusSidebarCommError'));
                return;
              }

              const count =
                response && typeof response.count === 'number'
                  ? response.count
                  : '??';

              setStatus(t('statusSidebarOk', count));
            }
          );
        },
        (msg) => {
          setStatus(msg);
        }
      );
    });
  }

  // --- IMPORTA THREAD CORRENTE ---
  if (btnThread) {
    btnThread.addEventListener('click', () => {
      setStatus(t('statusThreadInProgress'));

      getLinkedinMessagingTab(
        (tab) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'HERMES_IMPORT_THREAD' },
            (response) => {
              const err = chrome.runtime.lastError;
              if (err) {
                console.warn(
                  '[Hermes] Errore richiesta thread:',
                  err.message
                );
                setStatus(t('statusThreadCommError'));
                return;
              }

              const count =
                response && typeof response.count === 'number'
                  ? response.count
                  : '??';

              setStatus(t('statusThreadOk', count));
            }
          );
        },
        (msg) => {
          setStatus(msg);
        }
      );
    });
  }

  // --- APRI PANNELLO FISSO (solo dal popup) ---
  if (openPanelBtn) {
    openPanelBtn.addEventListener('click', () => {
      chrome.windows.create({
        url: chrome.runtime.getURL('panel.html'),
        type: 'popup',
        width: 400,
        height: 260,
      });

      window.close();
    });
  }

  // --- EDITOR TEMPLATES (matitine) ---

  function openEditor(mode) {
    const lang = HERMES_LANG === 'it' ? 'it' : 'en';
    chrome.windows.create({
      url: chrome.runtime.getURL(
        `editor.html?mode=${encodeURIComponent(mode)}&lang=${encodeURIComponent(
          lang
        )}`
      ),
      type: 'popup',
      width: 520,
      height: 450,
    });
  }

  if (btnSmartDeclineEdit) {
    btnSmartDeclineEdit.addEventListener('click', () => {
      openEditor('polite_decline');
    });
  }
  if (btnSmartInterestedEdit) {
    btnSmartInterestedEdit.addEventListener('click', () => {
      openEditor('interested');
    });
  }
  if (btnSmartMoreInfoEdit) {
    btnSmartMoreInfoEdit.addEventListener('click', () => {
      openEditor('more_info');
    });
  }

  // --- SMART REPLY BUTTONS ---

  function handleSmartReply(mode) {
    setStatus(t('statusSmartPreparing'));

    getLinkedinMessagingTab(
      (tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'HERMES_GET_INTERLOCUTOR_NAME' },
          async (response) => {
            const err = chrome.runtime.lastError;
            if (err) {
              console.warn(
                '[Hermes] Errore richiesta interlocutore:',
                err.message
              );
            }

            const name =
              response && typeof response.interlocutorName === 'string'
                ? response.interlocutorName.trim()
                : null;

            const replyText = buildSmartReply(mode, name);

            await copyToClipboard(replyText).catch(() => {});

            chrome.tabs.sendMessage(
              tab.id,
              { type: 'HERMES_INSERT_REPLY', replyText },
              (resp2) => {
                const err2 = chrome.runtime.lastError;
                if (err2) {
                  console.warn(
                    '[Hermes] Errore inserendo la risposta:',
                    err2.message
                  );
                  setStatus(t('statusSmartClipboardFallback'));
                  return;
                }

                if (resp2 && resp2.ok) {
                  if (name) {
                    setStatus(t('statusSmartInsertedNamed', name));
                  } else {
                    setStatus(t('statusSmartInsertedNoName'));
                  }
                } else {
                  setStatus(t('statusSmartClipboardFallback'));
                }
              }
            );
          }
        );
      },
      (msg) => {
        setStatus(msg);
      }
    );
  }

  if (btnSmartDecline) {
    btnSmartDecline.addEventListener('click', () => {
      handleSmartReply('polite_decline');
    });
  }

  if (btnSmartInterested) {
    btnSmartInterested.addEventListener('click', () => {
      handleSmartReply('interested');
    });
  }

  if (btnSmartMoreInfo) {
    btnSmartMoreInfo.addEventListener('click', () => {
      handleSmartReply('more_info');
    });
  }
});
