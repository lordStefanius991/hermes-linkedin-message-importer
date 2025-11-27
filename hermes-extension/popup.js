// popup.js - Hermes extension popup & panel script

let HERMES_LANG = 'en'; // 'it' | 'en'

// Detect browser language as default
function detectDefaultLang() {
  const lang =
    (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (lang.startsWith('it')) return 'it';
  return 'en';
}

// Simple i18n dictionary
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
    statusSidebarInProgress: 'Hermes: import della sidebar in corso...',
    statusSidebarOk: (count) =>
      `Hermes: sidebar importata (${count} conversazioni).`,
    statusSidebarCommError:
      'Hermes: impossibile comunicare con la pagina delle conversazioni.',
    statusThreadInProgress: 'Hermes: import del thread in corso...',
    statusThreadOk: (count) =>
      `Hermes: thread importato (${count} messaggi).`,
    statusThreadCommError:
      'Hermes: impossibile comunicare con il thread corrente.',

    statusSmartPreparing: 'Hermes: preparo una risposta...',
    statusSmartInsertedNamed: (name) =>
      `Hermes: risposta inserita per "${name}". Controlla e premi Invia.`,
    statusSmartInsertedNoName:
      'Hermes: risposta inserita. Controlla il testo e premi Invia.',
    statusSmartClipboardFallback:
      'Hermes: risposta copiata. Incollala manualmente in LinkedIn.',

    // Thread metadata labels
    threadMetaTitle: 'Dati offerta (auto)',
    threadMetaCompany: 'Azienda',
    threadMetaRole: 'Ruolo',
    threadMetaLocations: 'Sedi',
    threadMetaWorkMode: 'Modalità di lavoro',
    threadMetaRecruiterName: 'Recruiter',
    threadMetaRelocation: 'Relocation menzionata',
    threadMetaSalaryMentioned: 'Salario menzionato',
    threadMetaNotes: 'Note',
    threadMetaContract: 'Tipo di contratto',
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
    statusSidebarInProgress: 'Hermes: importing sidebar...',
    statusSidebarOk: (count) =>
      `Hermes: sidebar imported (${count} conversations).`,
    statusSidebarCommError:
      'Hermes: cannot communicate with the conversations page.',
    statusThreadInProgress: 'Hermes: importing thread...',
    statusThreadOk: (count) =>
      `Hermes: thread imported (${count} messages).`,
    statusThreadCommError:
      'Hermes: cannot communicate with the current thread.',

    statusSmartPreparing: 'Hermes: preparing a reply...',
    statusSmartInsertedNamed: (name) =>
      `Hermes: reply inserted for "${name}". Review it and press Send.`,
    statusSmartInsertedNoName:
      'Hermes: reply inserted. Review the text and press Send.',
    statusSmartClipboardFallback:
      'Hermes: reply copied. Paste it manually into LinkedIn.',

    threadMetaTitle: 'Offer data (auto)',
    threadMetaCompany: 'Company',
    threadMetaRole: 'Role',
    threadMetaLocations: 'Locations',
    threadMetaWorkMode: 'Work mode',
    threadMetaRecruiterName: 'Recruiter',
    threadMetaRelocation: 'Relocation mentioned',
    threadMetaSalaryMentioned: 'Salary mentioned',
    threadMetaNotes: 'Notes',
    threadMetaContract: 'Contract'
  },
};

function t(key, ...args) {
  const dict = HERMES_I18N[HERMES_LANG] || HERMES_I18N.en;
  const entry = dict[key];
  if (typeof entry === 'function') return entry(...args);
  if (typeof entry === 'string') return entry;
  return key;
}

// ================== Smart reply templates =========================

const DEFAULT_BODIES = {
  it: {
    polite_decline:
      'ti ringrazio per il messaggio e per aver pensato a me. Al momento non sto valutando nuove opportunità, ma ti sono grato per il contatto.',
    interested:
      "grazie per avermi contattato. L'opportunità mi sembra interessante e sarei felice di saperne qualcosa in più, soprattutto in merito al team, alle responsabilità principali e al range retributivo.",
    more_info:
      'ti ringrazio per il messaggio. Prima di proseguire, potresti condividere qualche dettaglio in più sul ruolo, sul tipo di contratto e sul range retributivo previsto?',
  },
  en: {
    polite_decline:
      "thank you for reaching out and for considering me. At the moment I'm not actively looking for new opportunities, but I really appreciate your message.",
    interested:
      "thank you for getting in touch. The opportunity sounds interesting and I'd be happy to learn more, in particular about the team, key responsibilities and salary range.",
    more_info:
      'thank you for your message. Before moving forward, could you please share some more details about the role, the type of contract and the expected salary range?',
  },
};

// custom bodies per language+mode saved in chrome.storage
let CUSTOM_BODIES = {};

// carica da hermesBodiesV1 (struttura: { it: { polite_decline: '...', ... }, en: { ... } })
function loadCustomBodies(callback) {
  try {
    chrome.storage.sync.get(['hermesBodiesV1'], (res) => {
      CUSTOM_BODIES = (res && res.hermesBodiesV1) || {};
      if (callback) callback();
    });
  } catch (e) {
    console.warn('[Hermes] Impossibile caricare hermesBodiesV1:', e);
    if (callback) callback();
  }
}

// opzionale ma utile: se editor.html salva, aggiorniamo la cache in tempo reale
if (chrome && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.hermesBodiesV1) {
      CUSTOM_BODIES = changes.hermesBodiesV1.newValue || {};
    }
  });
}

function getBody(lang, mode) {
  const langMap = CUSTOM_BODIES[lang] || {};
  if (langMap[mode]) {
    return langMap[mode];
  }
  return (DEFAULT_BODIES[lang] || DEFAULT_BODIES.en)[mode];
}

// ================== Utils: LinkedIn tab & clipboard =========================

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
        if (onError) onError(t('statusNoTab'));
        return;
      }

      const activeTab = tabs.find((tab) => tab.active) || tabs[0];
      if (callback) callback(activeTab);
    }
  );
}

function copyToClipboard(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
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

/* ================== Parsing euristico migliorato ===================== */

function parseRecruiterMessage(firstMessageText, fullThread, firstSenderName) {
  const baseText =
    fullThread && fullThread.trim().length > 0
      ? fullThread
      : firstMessageText || '';

  const text = baseText.replace(/\r/g, '');
  const lower = text.toLowerCase();
  const firstLower = (firstMessageText || '').toLowerCase();

  const result = {};

  // ---- COMPANY ---------------------------------------------------
  // 1) "X is hiring!"
  let m = text.match(/([A-Z][A-Za-z0-9&.\- ]+)\s+is hiring[!.]?/i);
  if (m) {
    result.company = m[1].trim();
  }

  // 2) "I'm a Tech Recruiter for/at X."
  if (!result.company) {
    m = text.match(
      /recruiter\s+(?:for|at)\s+([A-Z][A-Za-z0-9&.\- ]+?)(?:[.,\n]|$)/i
    );
    if (m) {
      result.company = m[1].trim();
    }
  }
  

 
  if (!result.company) {
    m = text.match(
      /sono\s+[A-Z][^,\n]*?\s+di\s+([A-Z][A-Za-z0-9&.\- ]+)/i
    );
    if (m) {
      result.company = m[1].trim();
    }
  }

  // 4) "per conto di Dune Talent"
  if (!result.company) {
    m = text.match(/per conto di\s+([A-Z][A-Za-z0-9&.\- ]+)/i);
    if (m) {
      result.company = m[1].trim();
    }
  }
    // 4BIS) "recruiter di Argologica"
  if (!result.company) {
    m = text.match(
      /recruiter\s+(?:di|per conto di|per)\s+([A-Z][A-Za-z0-9&.\- ]+)/i
    );
    if (m) {
      result.company = m[1].trim();
    }
  }


  // 5) "My client, Turing, is hiring ..."
  if (!result.company) {
    m = text.match(
      /My client,\s+([A-Z][A-Za-z0-9&.\- ]+),\s+is hiring/i
    );
    if (m) {
      result.company = m[1].trim();
    }
  }

  // 6) "with Turing" / "with <Company>" – MA **non** PST/CET/etc.
  if (!result.company) {
    m = text.match(/\bwith\s+([A-Z][A-Za-z0-9&.\- ]+)\b/);
    if (m) {
      const cand = m[1].trim();
      const bad = ['PST', 'CET', 'CEST', 'GMT', 'UTC'];
      if (!bad.includes(cand)) {
        result.company = cand;
      }
    }
  }

  // 7) fallback da email: "...@adecco.it" → Adecco / Avanceservices
  if (!result.company) {
    const emailDomainMatch = text.match(
      /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+)\.[A-Za-z]{2,}/
    );
    if (emailDomainMatch) {
      const domain = emailDomainMatch[1].toLowerCase();
      const genericDomains = [
        'gmail',
        'yahoo',
        'hotmail',
        'outlook',
        'live',
        'icloud',
        'proton',
      ];
      const mainPart = domain.split('.')[0];
      if (!genericDomains.includes(mainPart)) {
        result.company = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      }
    }
  }

  // ---- ROLE ------------------------------------------------------
  m = text.match(/looking for\s+(.+?)\s+for our/i);
  if (!m) m = text.match(/looking for\s+(.+?)\s+in\s+/i);
  if (!m) m = text.match(/for the position of\s+(.+?)[\.\n]/i);
  if (!m) {m = text.match(/position of\s+([A-Z][^.\n]+)/i);}
  if (!m) m = text.match(/We have\s+(.+?)\s+position/i);
  if (!m) m = text.match(/ruolo di\s+(.+?)[,\.]/i);
  if (!m) m = text.match(/alla ricerca di\s+un[oa]?\s+(.+?)[\.,\n]/i);
  if (!m)
    m = text.match(/job opportunity as a\s+["“](.+?)["”]/i);
  if (!m)
    m = text.match(
      /Opportunità.*?\b([A-Z][A-Za-z0-9+\/\-\s]*Java[^-\n]*)/i
    );
    if (!m) {
  m = text.match(/\b(Fullstack Java|Java Fullstack)\b/i);
}

  if (m) {
    let role = m[1].trim();

    role = role.replace(/\sand is looking for someone.*$/i, '');
    role = role.replace(/\s+per una società.*$/i, '');

    const roleLower = role.toLowerCase();
    const roleKeywords = [
      'developer',
      'engineer',
      'trainer',
      'lead',
      'architect',
      'consultant',
      'manager',
      'analyst',
      'fullstack',
      'full stack',
      'java',
      'backend',
      'front',
      'data',
    ];
    const hasKeyword = roleKeywords.some((kw) =>
      roleLower.includes(kw)
    );

    if (
      hasKeyword &&
      !roleLower.startsWith('someone ') &&
      role.split(/\s+/).length <= 12
    ) {
      result.role = role.trim();
    }
  }

  // Fallback: se ho Java + PL/SQL ma nessun ruolo chiaro
if (!result.role) {
  const hasJava = /\bJava\b/i.test(text);
  const hasPlsql = /PL\/SQL/i.test(text);
  if (hasJava && hasPlsql) {
    result.role = 'Java / PL-SQL developer';
  }
}


  // ---- LOCATIONS -------------------------------------------------
  let locMatch =
    text.match(/teams in\s+([A-Za-z ,]+)/i) ||
    text.match(/sita a\s+([A-Z][A-Za-z ]+)/i) ||
    text.match(/con sede a\s+([A-Z][A-Za-z ]+)/i) ||
    text.match(/sede di\s+([A-Z][A-Za-z ,]+)/i) ||
    text.match(/HQ\s+(?:è|e')\s+a\s+([A-Z][A-Za-z ]+)/i) ||
    text.match(/sedi di\s+([A-Z][A-Za-z ,e]+)/i) ||
    text.match(/based in\s+([A-Z][A-Za-z ,]+)/i);

    if (!locMatch) {
    locMatch = text.match(/progetto\s+su\s+([A-Z][A-Za-z ]+)/i);
  }

  if (!locMatch) {
    const mFallback = text.match(
      /\b(?:in|at)\s+(?:the\s+)?([A-Z][A-Za-z ]+)/
    );
    if (mFallback) {
      let locStr = mFallback[1];
      locStr = locStr.replace(/\bwith our client\b.*$/i, '');
      locMatch = [, locStr];
    }
  }

if (locMatch) {
  let locStr = locMatch[1] || '';

  const rawLocations = locStr
    .split(/,| and | e | o /i)
    .map((s) => s.trim())
    .filter(Boolean);

  const cleaned = rawLocations
    .map((loc) => {
      let l = loc;
      l = l.replace(/\bwith our client\b.*$/i, '');
      l = l.replace(/\byour background.*$/i, '');
      l = l.replace(/\bopportunity.*$/i, '');
      l = l.replace(/\brole.*$/i, '');
      l = l.replace(/\bin ambito it\b/i, '');
      return l.trim();
    })
    .filter((l) => l.length > 0)
    .filter(
      (l) =>
        !/ambito it/i.test(l) &&
        !/competenz/i.test(l) &&
        !/linea con le tue competenze/i.test(l)
    );

  // nomi che sembrano aziende, non città
  const companyKeywords = [
    'engineering',
    'talent',
    'consulting',
    'consultancy',
    'solutions',
    'services',
    'staffing',
    'recruitment',
    'agency',
    'groupe',
    'group',
    'technologies',
    'technology',
    'company',
    'partners',
    'holding',
    'srl',
    'spa',
    'gmbh',
  ];

  const filtered = cleaned.filter((loc) => {
    const lower = loc.toLowerCase();

    // se è esattamente uguale alla company, scarta
    if (result.company && lower === result.company.toLowerCase()) {
      return false;
    }

    // se contiene parole tipiche da ragione sociale, scarta
    if (companyKeywords.some((kw) => lower.includes(kw))) {
      return false;
    }

    return true;
  });

  if (filtered.length > 0) {
    result.locations = filtered;

  }
}


  // ---- WORK MODE -------------------------------------------------
  // 1) se parla di ibrido, vince SEMPRE l'ibrido
  if (
    /hybrid/.test(lower) ||
    /\bmodalità di lavoro ibrida\b/i.test(text) ||
    /\bmodalita di lavoro ibrida\b/i.test(lower) ||
    /\bibrido\b/i.test(text) ||
    /- Ibrido\b/i.test(text) ||
    /\d+\s+days?\s+in the office/.test(lower)
  ) {
    result.workMode = 'hybrid';
  } else if (
    /full remote|remote only|only remote|working fully remotely|100% remote/.test(
      lower
    )
  ) {
    result.workMode = 'full_remote';
  } else if (
    /on[- ]site|office-based|in the office only/.test(lower)
  ) {
    result.workMode = 'onsite';
  } else {
    result.workMode = 'unknown';
  }

  // Se ho location ma workMode sconosciuto → assumo on-site
  if (!result.workMode || result.workMode === 'unknown') {
    if (result.locations && result.locations.length > 0) {
      result.workMode = 'onsite';
    }
  }

  // ---- RECRUITER NAME -------------------------------------------
    if (firstSenderName && firstSenderName.trim().length > 0) {
    result.recruiterName = firstSenderName.trim();
  }

  // ---- RELOCATION & SALARY --------------------------------------
  result.relocationMentioned = /relocation/.test(lower);

  const hasMoneyKeyword = /\b(€|\$|eur|usd|salary|compensation|ral|pay|rate)\b/i.test(
    text
  );
  const hasDigit = /\d/.test(text);
  result.salaryMentioned = hasMoneyKeyword && hasDigit;

  // ---- CONTRACT TYPE --------------------------------------------
  if (
    /\bp\.?\s*iva\b/i.test(text) ||
    /\bfreelance\b/i.test(text) ||
    /\bfreelancer\b/i.test(text) ||
    /\bcontract\b/i.test(lower)
  ) {
    result.contractType = 'freelance';
  } else if (
    /\btempo indeterminato\b/i.test(text) ||
    /\bpermanent\b/i.test(lower) ||
    /\binserimento diretto\b/i.test(lower)
  ) {
    result.contractType = 'permanent';
  }

  // ---- NOTES -----------------------------------------------------
  const notes = [];


  const hybridPhrase = text.match(
    /(\d+\s+days?\s+in the office[^.\n]*)/i
  );
  if (hybridPhrase) {
    notes.push(hybridPhrase[1].trim());
  }

  if (result.relocationMentioned) {
    notes.push('relocation mentioned');
  }

  const salarySnippet = text.match(
    /((?:rate|pay|salary|compensation)[^.\n]*\d[^.\n]*)/i
  );
  if (salarySnippet) {
    notes.push(salarySnippet[1].trim());
  }

  // es. mettiamo "United States" nelle note se non è location
  if (/United States/i.test(text) && !(result.locations || []).length) {
    notes.push('United States');
  }

// Durata tipo "5–6 week contract", "6 month contract", "6 mesi"
const durationSnippet = text.match(
  /(\b\d+\s*(?:-\s*\d+)?\s*(?:week|weeks|mese|mesi|month|months)\b[^.\n]*)/i
);
if (durationSnippet) {
  notes.push(durationSnippet[1].trim());
}

// Ore settimanali tipo "20 hours per week", "20-40 hours per week"
const hoursSnippet = text.match(
  /(\b\d+\s*(?:-\s*\d+)?\s*hours?\s+per\s+week[^.\n]*)/i
);
if (hoursSnippet) {
  notes.push(hoursSnippet[1].trim());
}


  const skills = [];
if (/PL\/SQL/i.test(text)) skills.push('PL/SQL');
if (/Spring Boot/i.test(text)) skills.push('Spring Boot');
if (/Spring Framework/i.test(text)) skills.push('Spring Framework');
if (/RESTful API/i.test(text)) skills.push('RESTful API');

if (skills.length) {
  notes.push('Skills: ' + skills.join(', '));
}

  if (notes.length) {
    result.notes = notes.join(' · ');
  }

  return result;
}



// ================== Main UI logic ============================

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('title');
  const langLabel = document.getElementById('lang-label');
  const langSelect = document.getElementById('lang-select');
  const btnSidebar = document.getElementById('import-sidebar');
  const btnThread = document.getElementById('import-thread');
  const openPanelBtn = document.getElementById('open-panel');
  const smartSectionTitle = document.getElementById('smart-section-title');
  const btnSmartDecline = document.getElementById('smart-decline');
  const btnSmartInterested = document.getElementById('smart-interested');
  const btnSmartMoreInfo = document.getElementById('smart-more-info');
  const btnSmartDeclineEdit = document.getElementById('smart-decline-edit');
  const btnSmartInterestedEdit = document.getElementById(
    'smart-interested-edit'
  );
  const btnSmartMoreInfoEdit = document.getElementById(
    'smart-more-info-edit'
  );
  const statusEl = document.getElementById('status');
  const footer = document.getElementById('hermes-footer');

  const threadMetaTitle = document.getElementById('thread-meta-title');
  const threadCompanyLabel = document.getElementById('thread-company-label');
  const threadRoleLabel = document.getElementById('thread-role-label');
  const threadLocationsLabel = document.getElementById(
    'thread-locations-label'
  );
  const threadWorkmodeLabel = document.getElementById(
    'thread-workmode-label'
  );
    const threadContractLabel = document.getElementById(
    'thread-contract-label'
  );
  const threadRecruiterNameLabel = document.getElementById(
    'thread-recruiter-name-label'
  );
  const threadRelocationLabel = document.getElementById(
    'thread-relocation-label'
  );
  const threadSalaryLabel = document.getElementById(
    'thread-salary-mentioned-label'
  );
  const threadNotesLabel = document.getElementById('thread-notes-label');

  const threadCompanyInput = document.getElementById('thread-company');
  const threadRoleInput = document.getElementById('thread-role');
  const threadLocationsInput =
    document.getElementById('thread-locations');
  const threadWorkmodeSelect =
    document.getElementById('thread-workmode');
  const threadRecruiterNameInput = document.getElementById(
    'thread-recruiter-name'
  );
  const threadContractSelect = document.getElementById('thread-contract');
  const threadRelocationCheckbox =
    document.getElementById('thread-relocation');
  const threadSalaryCheckbox = document.getElementById(
    'thread-salary-mentioned'
  );
  const threadNotesTextarea = document.getElementById('thread-notes');

  function setStatus(message) {
    if (!statusEl) return;
    statusEl.textContent = message || '';
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

    if (threadMetaTitle)
      threadMetaTitle.textContent = t('threadMetaTitle');
    if (threadCompanyLabel)
      threadCompanyLabel.textContent = t('threadMetaCompany');
    if (threadRoleLabel)
      threadRoleLabel.textContent = t('threadMetaRole');
    if (threadLocationsLabel)
      threadLocationsLabel.textContent = t('threadMetaLocations');
    if (threadWorkmodeLabel)
      threadWorkmodeLabel.textContent = t('threadMetaWorkMode');
    if (threadContractLabel)
      threadContractLabel.textContent = t('threadMetaContract');
    if (threadRecruiterNameLabel)
      threadRecruiterNameLabel.textContent = t(
        'threadMetaRecruiterName'
      );
    if (threadRelocationLabel)
      threadRelocationLabel.textContent = t(
        'threadMetaRelocation'
      );
    if (threadSalaryLabel)
      threadSalaryLabel.textContent = t(
        'threadMetaSalaryMentioned'
      );
    if (threadNotesLabel)
      threadNotesLabel.textContent = t('threadMetaNotes');

    if (langSelect) {
      langSelect.value = HERMES_LANG;
    }
    if (footer) footer.textContent = t('footerSignature');
  }

function fillThreadMetaForm(parsed) {
  parsed = parsed || {};

  if (threadCompanyInput) {
    threadCompanyInput.value = parsed.company || '';
  }

  if (threadRoleInput) {
    threadRoleInput.value = parsed.role || '';
  }

  if (threadLocationsInput) {
    const locs =
      parsed.locations && parsed.locations.length
        ? parsed.locations.join('; ')
        : '';
    // se è full remote e non ho location, meglio vuoto
    threadLocationsInput.value =
      parsed.workMode === 'full_remote' && !locs ? '' : locs;
  }

  // 👇 usa il nome giusto: threadWorkmodeSelect
  if (threadWorkmodeSelect) {
    let modeValue = 'unknown';
    if (parsed.workMode === 'full_remote') modeValue = 'full_remote';
    else if (parsed.workMode === 'hybrid') modeValue = 'hybrid';
    else if (parsed.workMode === 'onsite') modeValue = 'onsite';
    threadWorkmodeSelect.value = modeValue;
  }

  // 👇 usa il nome giusto: threadRecruiterNameInput
  if (threadRecruiterNameInput) {
    threadRecruiterNameInput.value = parsed.recruiterName || '';
  }

  if (threadRelocationCheckbox) {
    threadRelocationCheckbox.checked = !!parsed.relocationMentioned;
  }

  if (threadSalaryCheckbox) {
    threadSalaryCheckbox.checked = !!parsed.salaryMentioned;
  }

  if (threadNotesTextarea) {
    threadNotesTextarea.value = parsed.notes || '';
  }

  if (threadContractSelect) {
    let c = '-';
    if (parsed.contractType === 'freelance') c = 'freelance';
    else if (parsed.contractType === 'permanent') c = 'permanent';
    threadContractSelect.value = c;
  }
}


  function buildSmartReplyText(mode, name) {
    const lang = HERMES_LANG;
    const body = getBody(lang, mode) || '';
    let greeting = '';
    let closing = '';

    if (lang === 'it') {
      greeting = name ? `Ciao ${name},\n\n` : 'Ciao,\n\n';
      closing = '\n\nUn saluto,\nStefano';
    } else {
      greeting = name ? `Hi ${name},\n\n` : 'Hi,\n\n';
      closing = '\n\nBest regards,\nStefano';
    }

    return `${greeting}${body}${closing}`;
  }

  function handleSmartReply(mode) {
    setStatus(t('statusSmartPreparing'));

    getLinkedinMessagingTab(
      (tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'HERMES_GET_INTERLOCUTOR_NAME' },
          (response) => {
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

            const replyText = buildSmartReplyText(mode, name);

            chrome.tabs.sendMessage(
              tab.id,
              { type: 'HERMES_INSERT_REPLY', replyText },
              (res2) => {
                const err2 = chrome.runtime.lastError;
                if (err2) {
                  console.warn(
                    '[Hermes] Errore inserimento risposta:',
                    err2.message
                  );
                }

                const ok = res2 && res2.ok;

                if (ok) {
                  if (name) {
                    setStatus(t('statusSmartInsertedNamed', name));
                  } else {
                    setStatus(t('statusSmartInsertedNoName'));
                  }
                } else {
                  const copied = copyToClipboard(replyText);
                  if (copied) {
                    setStatus(t('statusSmartClipboardFallback'));
                  } else {
                    setStatus('');
                  }
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

  // =============== Event handlers ===================

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

const firstMessageText =
  response && typeof response.firstMessageText === 'string'
    ? response.firstMessageText
    : '';
const fullThread =
  response && typeof response.fullThread === 'string'
    ? response.fullThread
    : '';

const interlocutorName =
  response && typeof response.interlocutorName === 'string'
    ? response.interlocutorName
    : null;


const parsed = parseRecruiterMessage(
  firstMessageText,
  fullThread,
  interlocutorName
);

fillThreadMetaForm(parsed);
          }
        );
      },
      (msg) => {
        setStatus(msg);
      }
    );
  });
}

  if (openPanelBtn) {
    openPanelBtn.addEventListener('click', () => {
      chrome.windows.create({
        url: 'panel.html',
        type: 'popup',
        width: 420,
        height: 640,
      });
    });
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

function handleEditSmartBody(mode) {
  const url =
    'editor.html?mode=' +
    encodeURIComponent(mode) +
    '&lang=' +
    encodeURIComponent(HERMES_LANG);

  chrome.windows.create({
    url,
    type: 'popup',
    width: 520,
    height: 420,
  });
}


  if (btnSmartDeclineEdit) {
    btnSmartDeclineEdit.addEventListener('click', () => {
      handleEditSmartBody('polite_decline');
    });
  }
  if (btnSmartInterestedEdit) {
    btnSmartInterestedEdit.addEventListener('click', () => {
      handleEditSmartBody('interested');
    });
  }
  if (btnSmartMoreInfoEdit) {
    btnSmartMoreInfoEdit.addEventListener('click', () => {
      handleEditSmartBody('more_info');
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', () => {
      HERMES_LANG = langSelect.value === 'it' ? 'it' : 'en';
      chrome.storage.sync.set({ hermesLang: HERMES_LANG }, () => {
        renderLabels();
      });
    });
  }

  chrome.storage.sync.get(['hermesLang'], (res) => {
    if (res && res.hermesLang && HERMES_I18N[res.hermesLang]) {
      HERMES_LANG = res.hermesLang;
    } else {
      HERMES_LANG = detectDefaultLang();
    }

    loadCustomBodies(() => {
      renderLabels();
    });
  });
});
