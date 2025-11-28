// popup.js - Hermes extension popup & panel script

let HERMES_LANG = 'en'; // 'it' | 'en'

const RECRUITER_FORM_KEY = 'hermesRecruiterFormV1';

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
    btnOpenRecruiter: 'Modalità recruiter',


    labelMode: 'Modalità',
    modeDev: 'Modalità candidato',
    modeRecruiter: 'Modalità recruiter',

    recruiterAssemblerTitle: 'Assembla il messaggio',
    recruiterGreetingSalutation: 'Saluto',
    recruiterGreetingTitle: 'Appellativo',
    recruiterGreetingNameMode: 'Interlocutore',
    recruiterCompany: 'Azienda',



    recruiterCompany: 'Azienda',
    recruiterRole: 'Ruolo',
    recruiterWorkmode: 'Modalità di lavoro',
    recruiterContract: 'Tipo di contratto',
    recruiterRecruiter: 'Recruiter',
    recruiterNotes: 'Ulteriori note',

    recruiterAssembledTitle: 'Messaggio assemblato',
    recruiterBtnGenerate: 'Genera recruiting message',

    statusRecruiterPreparing: 'Hermes: preparo il messaggio recruiter...',
    statusRecruiterInsertedNamed: (name) =>
      `Hermes: messaggio recruiter inserito per "${name}". Controlla e premi Invia.`,
    statusRecruiterInsertedNoName:
      'Hermes: messaggio recruiter inserito. Controlla il testo e premi Invia.',
    statusRecruiterClipboardFallback:
      'Hermes: messaggio recruiter copiato. Incollalo manualmente in LinkedIn.',



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
     btnOpenRecruiter: 'Recruiter mode',

    labelMode: 'Mode',
    modeDev: 'Candidate mode',
    modeRecruiter: 'Recruiter mode',

    recruiterAssemblerTitle: 'Assemble message',

    recruiterGreetingSalutation: 'Greeting',
    recruiterGreetingTitle: 'Title',
    recruiterGreetingNameMode: 'Name format',
    recruiterCompany: 'Company',

    recruiterCompany: 'Company',
    recruiterRole: 'Role',
    recruiterWorkmode: 'Work mode',
    recruiterContract: 'Contract type',
    recruiterRecruiter: 'Recruiter',
    recruiterNotes: 'Additional notes',

    recruiterAssembledTitle: 'Assembled message',
    recruiterBtnGenerate: 'Generate recruiting message',

    statusRecruiterPreparing: 'Hermes: preparing recruiter message...',
    statusRecruiterInsertedNamed: (name) =>
      `Hermes: recruiter message inserted for "${name}". Review it and press Send.`,
    statusRecruiterInsertedNoName:
      'Hermes: recruiter message inserted. Review the text and press Send.',
    statusRecruiterClipboardFallback:
      'Hermes: recruiter message copied. Paste it manually into LinkedIn.',


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


const DEFAULT_RECRUITER_BODIES = {
  it: {
    recruiter_message:
      "ti contatto{company_block}{role_block}{workmode_block}{contract_block}{locations_block}.\n\n{notes}\n\nSe l'opportunità può interessarti, fammi sapere e possiamo organizzare una breve call.",
  },
  en: {
    recruiter_message:
      'I am reaching out{company_block}{role_block}{workmode_block}{contract_block}{locations_block}.\n\n{notes}\n\nIf this could be of interest, I would be happy to schedule a short call.',
  },
};


function getRecruiterBody(lang) {
  const langMap = CUSTOM_BODIES[lang] || {};
  if (langMap.recruiter_message) {
    return langMap.recruiter_message;
  }
  const defaults =
    DEFAULT_RECRUITER_BODIES[lang] || DEFAULT_RECRUITER_BODIES.en;
  return defaults.recruiter_message;
}

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
  let m;

  // ---- COMPANY ---------------------------------------------------
  // 1) "X is hiring!"
  m = text.match(/([A-Z][A-Za-z0-9&.\- ]+)\s+is hiring[!.]?/i);
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

  // 3) Italiano: "sono Erica di Techyon"
  if (!result.company) {
    m = text.match(/sono\s+[A-Z][^,\n]*?\s+di\s+([A-Z][A-Za-z0-9&.\- ]+)/i);
    if (m) {
      result.company = m[1].trim();
    }
  }

  // 3-bis) "recruiter di Argologica"
  if (!result.company) {
    m = text.match(/recruiter\s+di\s+([A-Z][A-Za-z0-9&.\-]+)/i);
    if (m) {
      result.company = m[1].trim();
    }
  }

  // 3-ter) "ICT recruiter in ORBYTA" / "recruiter presso X"
  if (!result.company) {
    m = text.match(
      /recruiter[^\n]{0,80}?\b(?:in|presso|at)\s+([A-Z][A-Za-z0-9&.\- ]+?)(?:[.,\n]|$)/i
    );
    if (m) {
      result.company = m[1].trim();
    }
  }

  // 3-quater) "Senior RecruITer - CORE @ Experis Italia"
  if (!result.company) {
    m = text.match(/@\s+([A-Z][A-Za-z0-9&.\- ]+?)(?:[,\n]|$)/);
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

  // 5) "My client, Turing, is hiring ..."
  if (!result.company) {
    m = text.match(/My client,\s+([A-Z][A-Za-z0-9&.\- ]+),\s+is hiring/i);
    if (m) {
      result.company = m[1].trim();
    }
  }

  // 6) "with Turing" / "with <Company>" – MA non PST/CET/etc.
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

  // 7) fallback da email: "...@it.experis.com" → Experis (non "it")
  if (!result.company) {
    const emailDomainMatch = text.match(
      /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+)\.[A-Za-z]{2,}/
    );
    if (emailDomainMatch) {
      const domain = emailDomainMatch[1].toLowerCase(); // es. "it.experis"
      const parts = domain.split('.');                   // ["it","experis"]
      const genericSubdomains = [
        'it',
        'en',
        'de',
        'fr',
        'es',
        'pt',
        'nl',
        'uk',
        'us',
        'eu',
        'www',
        'mail',
        'smtp',
      ];

      let mainPart = parts[0];
      if (parts.length >= 2 && genericSubdomains.includes(parts[0])) {
        mainPart = parts[1];
      }

      const genericDomains = [
        'gmail',
        'yahoo',
        'hotmail',
        'outlook',
        'live',
        'icloud',
        'proton',
      ];

      if (mainPart && !genericDomains.includes(mainPart)) {
        result.company =
          mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
      }
    }
  }

  // 8) Fallback big tech (Google, Meta, ...)
  if (!result.company) {
    const bigTech = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'];
    for (const name of bigTech) {
      const re = new RegExp('\\b' + name + '\\b', 'i');
      if (re.test(text)) {
        result.company = name;
        break;
      }
    }
  }

  // ---- ROLE ------------------------------------------------------
  // pattern più "intelligenti"
  m = text.match(/posizione di\s+(.+?)[,.\n]/i); // IT: "posizione di Java Senior ..."
  if (!m) {
    m = text.match(/in qualità di\s+(.+?)[,.\n]/i); // "in qualità di Front-End Developer"
  }
  if (!m) {
    m = text.match(/profili\s+(.+?)\s+di diversa seniorit/i); // "profili Java Back End di diversa seniority"
  }
  if (!m) m = text.match(/looking for\s+(.+?)\s+for our/i);
  if (!m) m = text.match(/looking for\s+(.+?)\s+in\s+/i);
  if (!m) m = text.match(/for the position of\s+(.+?)[\.\n]/i);
  if (!m) m = text.match(/position of\s+([A-Z][^.\n]+)/i);
  if (!m) m = text.match(/We have\s+(.+?)\s+position/i);
  if (!m) m = text.match(/ruolo di\s+(.+?)[,\.]/i);
  if (!m) m = text.match(/alla ricerca di\s+un[oa]?\s+(.+?)[\.,\n]/i);
  if (!m) {
    m = text.match(
      /(?:cerchiamo|stiamo\s+cercando)\s+un[oa]?\s+(.+?)(?:\s+in\b|\s+per\b|[\.,\n])/i
    );
  }
  if (!m) {
    m = text.match(/job opportunity as a\s+["“](.+?)["”]/i);
  }
  if (!m) {
    m = text.match(/\b(Fullstack Java|Java Fullstack)\b/i);
  }

  if (m) {
    let role = m[1].trim();

    // ripulisci frasi di contorno
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
      'php',
      'python',
      '.net',
      'backend',
      'back end',
      'back-end',
      'frontend',
      'front end',
      'front-end',
      'data',
      'devops',
      'sre',
      'qa',
      'tester',
    ];
    const hasKeyword = roleKeywords.some((kw) => roleLower.includes(kw));

    if (
      hasKeyword &&
      !roleLower.startsWith('someone ') &&
      role.split(/\s+/).length <= 15
    ) {
      result.role = role.trim();
    }
  }

  // Fallback 1: se la prima riga sembra un titolo tipo "JAVA BACK END @ CAPGEMINI"
  if (!result.role) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length > 0) {
      let firstLine = lines[0];
      // rimuovi "@ Company" finale
      firstLine = firstLine.replace(/@\s+.+$/, '').trim();
      const flLower = firstLine.toLowerCase();
      const titleKeywords = [
        'developer',
        'engineer',
        'architect',
        'consultant',
        'manager',
        'analyst',
        'lead',
        'php',
        'python',
        'frontend',
        'front end',
        'front-end',
        'backend',
        'back end',
        'back-end',
        'fullstack',
        'full stack',
        'data',
        'devops',
        'sre',
        'qa',
        'tester',
        'java',
        '.net',
      ];
      const looksLikeRole = titleKeywords.some((kw) =>
        flLower.includes(kw)
      );
      if (looksLikeRole && firstLine.split(/\s+/).length <= 8) {
        result.role = firstLine;
      }
    }
  }

  // Fallback 2: "glossario" per tecnologie → ruolo generico
  if (!result.role) {
    const hasJava = /\bjava\b/i.test(text);
    const hasPhp = /\bphp\b/i.test(text);
    const hasPython = /\bpython\b/i.test(text);
    const hasJs =
      /\bjavascript\b/i.test(text) || /\bjs\b/i.test(text);
    const hasTs = /\btypescript\b/i.test(text);
    const hasReact = /\breact\b/i.test(text);
    const hasAngular = /\bangular\b/i.test(text);
    const hasVue = /\bvue(?:\.js)?\b/i.test(text);
    const hasNode = /\bnode\.?js\b/i.test(text);
    const hasDotnet =
      /\b\.net\b/i.test(text) || /\bnet core\b/i.test(text);
    const hasCsharp = /\bc#\b/i.test(text);
    const hasCplus = /\bc\+\+\b/i.test(text);
    const hasGo = /\bgolang\b/i.test(text);
    const hasRuby = /\bruby\b/i.test(text);
    const hasKotlin = /\bkotlin\b/i.test(text);
    const hasSwift = /\bswift\b/i.test(text);
    const hasScala = /\bscala\b/i.test(text);
    const hasDevops = /\bdevops\b/i.test(text);
    const hasSre = /\bsre\b/i.test(text);
    const hasDataEngineer = /\bdata engineer\b/i.test(text);
    const hasDataScientist = /\bdata scientist\b/i.test(text);
    const hasDataAnalyst = /\bdata analyst\b/i.test(text);
    const backEndLike = /\bback[- ]?end\b/i.test(text);
    const frontEndLike = /\bfront[- ]?end\b/i.test(text);
    const fullstackLike = /\bfull[- ]?stack\b/i.test(text);

    if (hasJava) {
      if (backEndLike) result.role = 'Java Backend Developer';
      else if (fullstackLike) result.role = 'Java Full-Stack Developer';
      else if (frontEndLike) result.role = 'Java Frontend Developer';
      else result.role = 'Java Developer';
    } else if (hasPython) {
      if (hasDataScientist) result.role = 'Data Scientist (Python)';
      else if (hasDataEngineer) result.role = 'Data Engineer (Python)';
      else result.role = 'Python Developer';
    } else if (hasPhp) {
      if (fullstackLike) result.role = 'PHP Full-Stack Developer';
      else result.role = 'PHP Developer';
    } else if (hasDotnet || hasCsharp) {
      if (backEndLike || fullstackLike)
        result.role = '.NET Backend Developer';
      else result.role = '.NET Developer';
    } else if (hasJs || hasTs || hasReact || hasAngular || hasVue) {
      if (frontEndLike || !backEndLike) {
        if (hasReact) result.role = 'React Frontend Developer';
        else if (hasAngular) result.role = 'Angular Frontend Developer';
        else result.role = 'Frontend Developer';
      }
    } else if (hasNode) {
      if (fullstackLike) result.role = 'Node.js Full-Stack Developer';
      else result.role = 'Node.js Backend Developer';
    } else if (hasGo) {
      result.role = 'Go Developer';
    } else if (hasRuby) {
      result.role = 'Ruby Developer';
    } else if (hasKotlin) {
      result.role = 'Kotlin Developer';
    } else if (hasSwift) {
      result.role = 'iOS / Swift Developer';
    } else if (hasScala) {
      result.role = 'Scala Developer';
    } else if (hasDevops || hasSre) {
      result.role = hasSre ? 'SRE / DevOps Engineer' : 'DevOps Engineer';
    } else if (hasDataEngineer) {
      result.role = 'Data Engineer';
    } else if (hasDataScientist) {
      result.role = 'Data Scientist';
    } else if (hasDataAnalyst) {
      result.role = 'Data Analyst';
    }
  }

  // Fallback 3: se ho Java + PL/SQL ma nessun ruolo chiaro
  if (!result.role) {
    const hasJava = /\bJava\b/i.test(text);
    const hasPlsql = /PL\/SQL/i.test(text);
    if (hasJava && hasPlsql) {
      result.role = 'Java / PL-SQL developer';
    }
  }

  // Fallback 4: ultima difesa – se citano Java ma ancora role vuoto
  if (!result.role && /\bjava\b/i.test(text)) {
    result.role = 'Java Developer';
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

    // normalizza "Milano e/o Roma"
    locStr = locStr.replace(/e\/o/gi, ' e ');

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
      const l = loc.toLowerCase();

      // se è esattamente uguale alla company, scarta
      if (result.company && l === result.company.toLowerCase()) {
        return false;
      }

      // se contiene parole tipiche da ragione sociale, scarta
      if (companyKeywords.some((kw) => l.includes(kw))) {
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
    /\bmodalità\b[^.\n]{0,20}\bibrid[ao]\b/i.test(text) ||
    /\bmodalita\b[^.\n]{0,20}\bibrid[ao]\b/i.test(lower) ||
    /\bibrid[ao]\b/i.test(text) ||
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
  } else if (/on[- ]site|office-based|in the office only/.test(lower)) {
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


// container reale dei 3 bottoni smart
const smartSectionContainer = document.querySelector('.smart-reply-buttons');


  const btnSmartDecline = document.getElementById('smart-decline');
  const btnSmartInterested = document.getElementById('smart-interested');
  const btnSmartMoreInfo = document.getElementById('smart-more-info');
  const btnSmartDeclineEdit = document.getElementById('smart-decline-edit');
  const openRecruiterBtn = document.getElementById('open-recruiter')
    const modeLabel = document.getElementById('mode-label');
  const modeSelect = document.getElementById('mode-select');

  //recruiter
    const recruiterSection = document.getElementById('recruiter-section');
  const recruiterAssembledSection = document.getElementById(
    'recruiter-assembled-section'
  );

  const recruiterAssemblerTitle = document.getElementById(
    'recruiter-assembler-title'
  );

    const recruiterGreetingSalutationLabel = document.getElementById(
    'recruiter-greeting-salutation-label'
  );
  const recruiterGreetingTitleLabel = document.getElementById(
    'recruiter-greeting-title-label'
  );
  const recruiterGreetingNameModeLabel = document.getElementById(
    'recruiter-greeting-name-mode-label'
  );


  const recruiterCompanyLabel = document.getElementById(
    'recruiter-company-label'
  );
  const recruiterRoleLabel = document.getElementById('recruiter-role-label');
  const recruiterWorkmodeLabel = document.getElementById(
    'recruiter-workmode-label'
  );
  const recruiterContractLabel = document.getElementById(
    'recruiter-contract-label'
  );
  const recruiterRecruiterLabel = document.getElementById(
    'recruiter-recruiter-label'
  );
  const recruiterNotesLabel = document.getElementById(
    'recruiter-notes-label'
  );

    const recruiterGreetingSalutationSelect = document.getElementById(
    'recruiter-greeting-salutation'
  );
  const recruiterGreetingTitleSelect = document.getElementById(
    'recruiter-greeting-title'
  );
  const recruiterGreetingNameModeSelect = document.getElementById(
    'recruiter-greeting-name-mode'
  );


  const recruiterCompanyInput = document.getElementById('recruiter-company');
  const recruiterRoleInput = document.getElementById('recruiter-role');
  const recruiterWorkmodeInput =
    document.getElementById('recruiter-workmode');
  const recruiterContractInput =
    document.getElementById('recruiter-contract');
  const recruiterRecruiterInput =
    document.getElementById('recruiter-recruiter');
  const recruiterNotesTextarea =
    document.getElementById('recruiter-notes');

  const recruiterCompanyInclude = document.getElementById(
    'recruiter-company-include'
  );
  const recruiterRoleInclude = document.getElementById(
    'recruiter-role-include'
  );
  const recruiterWorkmodeInclude = document.getElementById(
    'recruiter-workmode-include'
  );
  const recruiterContractInclude = document.getElementById(
    'recruiter-contract-include'
  );
  const recruiterRecruiterInclude = document.getElementById(
    'recruiter-recruiter-include'
  );
  const recruiterNotesInclude = document.getElementById(
    'recruiter-notes-include'
  );

  const recruiterAssembledTitle = document.getElementById(
    'recruiter-assembled-title'
  );
  const recruiterGenerateBtn = document.getElementById('recruiter-generate');
  const recruiterEditTemplateBtn = document.getElementById(
    'recruiter-edit-template'
  );


  const btnSmartInterestedEdit = document.getElementById(
    'smart-interested-edit'
  );
  const btnSmartMoreInfoEdit = document.getElementById(
    'smart-more-info-edit'
  );
  const statusEl = document.getElementById('status');
  const footer = document.getElementById('hermes-footer');
    const threadMetaSection = document.getElementById('thread-meta-section');


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



const recruiterTextInputs = [
  recruiterCompanyInput,
  recruiterRoleInput,
  recruiterWorkmodeInput,
  recruiterContractInput,
  recruiterRecruiterInput,
  recruiterNotesTextarea,
].filter(Boolean);

recruiterTextInputs.forEach((el) =>
  el.addEventListener('input', saveRecruiterFormToStorage)
);

const recruiterCheckboxes = [
  recruiterCompanyInclude,
  recruiterRoleInclude,
  recruiterWorkmodeInclude,
  recruiterContractInclude,
  recruiterRecruiterInclude,
  recruiterNotesInclude,
].filter(Boolean);

recruiterCheckboxes.forEach((el) =>
  el.addEventListener('change', saveRecruiterFormToStorage)
);

const recruiterSelects = [
  recruiterGreetingSalutationSelect,
  recruiterGreetingTitleSelect,
  recruiterGreetingNameModeSelect,
].filter(Boolean);

recruiterSelects.forEach((el) =>
  el.addEventListener('change', saveRecruiterFormToStorage)
);

// e all’inizio, una sola volta:
restoreRecruiterFormFromStorage();













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
  // rende setStatus visibile a recruiter.js
  window.setStatus = setStatus;

function getSalutationLabel(lang, key) {
  const map = {
    it: {
      ciao: 'Ciao',
      buongiorno: 'Buongiorno',
      buonasera: 'Buonasera',
      salve: 'Salve',
    },
    en: {
      ciao: 'Hi',
      buongiorno: 'Good morning',
      buonasera: 'Good evening',
      salve: 'Hello',
    },
  };
  const m = map[lang] || map.en;
  return m[key] || map.it[key] || key;
}

function getTitleLabel(lang, key) {
  const map = {
    it: {
      none: ' ',
      sig: 'Sig.',
      sig_ra: 'Sig.ra',
      dott: 'Dott.',
      dott_ssa: 'Dott.ssa',
      ing: 'Ing.',
      prof: 'Prof.',
    },
    en: {
      none: ' ',
      sig: 'Mr',
      sig_ra: 'Ms',
      dott_ssa: 'Mrs',
      dott: 'Dr', 
      ing: 'Eng.',
      prof: 'Prof.',
    },
  };
  const m = map[lang] || map.en;
  return m[key] || map.it[key] || '';
}

function getNameModeLabel(lang, key) {
  const map = {
    it: {
      first: 'Nome',
      last: 'Cognome',
      full: 'Nome e cognome',
    },
    en: {
      first: 'First name',
      last: 'Last name',
      full: 'Full name',
    },
  };
  const m = map[lang] || map.en;
  return m[key] || map.it[key] || key;
}

  function renderLabels() {
    
    if (titleEl) titleEl.textContent = t('title');
    if (langLabel) langLabel.textContent = t('labelLanguage');
    if (modeLabel) modeLabel.textContent = t('labelMode');
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
    if (openRecruiterBtn) openRecruiterBtn.textContent = t('btnOpenRecruiter');

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


        if (recruiterAssemblerTitle)
      recruiterAssemblerTitle.textContent = t('recruiterAssemblerTitle');

if (recruiterGreetingSalutationLabel)
      recruiterGreetingSalutationLabel.textContent = t(
        'recruiterGreetingSalutation'
      );
    if (recruiterGreetingTitleLabel)
      recruiterGreetingTitleLabel.textContent = t('recruiterGreetingTitle');
    if (recruiterGreetingNameModeLabel)
      recruiterGreetingNameModeLabel.textContent = t(
        'recruiterGreetingNameMode'
      );

          // localizza le option dei select recruiter
    if (recruiterGreetingSalutationSelect) {
      Array.from(recruiterGreetingSalutationSelect.options).forEach((opt) => {
        opt.textContent = getSalutationLabel(HERMES_LANG, opt.value);
      });
    }

    if (recruiterGreetingTitleSelect) {
      Array.from(recruiterGreetingTitleSelect.options).forEach((opt) => {
        opt.textContent = getTitleLabel(HERMES_LANG, opt.value);
      });
    }

    if (recruiterGreetingNameModeSelect) {
      Array.from(recruiterGreetingNameModeSelect.options).forEach((opt) => {
        opt.textContent = getNameModeLabel(HERMES_LANG, opt.value);
      });
    }



    if (recruiterCompanyLabel)
      recruiterCompanyLabel.textContent = t('recruiterCompany');
    if (recruiterRoleLabel)
      recruiterRoleLabel.textContent = t('recruiterRole');
    if (recruiterWorkmodeLabel)
      recruiterWorkmodeLabel.textContent = t('recruiterWorkmode');
    if (recruiterContractLabel)
      recruiterContractLabel.textContent = t('recruiterContract');
    if (recruiterRecruiterLabel)
      recruiterRecruiterLabel.textContent = t('recruiterRecruiter');
    if (recruiterNotesLabel)
      recruiterNotesLabel.textContent = t('recruiterNotes');

    if (recruiterAssembledTitle)
      recruiterAssembledTitle.textContent = t('recruiterAssembledTitle');
    if (recruiterGenerateBtn)
      recruiterGenerateBtn.textContent = t('recruiterBtnGenerate');


    if (langSelect) {
      langSelect.value = HERMES_LANG;
    }
    if (footer) footer.textContent = t('footerSignature');

    hideEmptySmartButtons();
    applyMode();
  }


    function applyMode() {
    const isRecruiter = HERMES_MODE === 'recruiter';

    if (threadMetaSection) {
      threadMetaSection.style.display = isRecruiter ? 'none' : '';
    }
    if (smartSectionTitle) {
      smartSectionTitle.style.display = isRecruiter ? 'none' : '';
    }
    if (smartSectionContainer) {
      smartSectionContainer.style.display = isRecruiter ? 'none' : '';
    }

    if (recruiterSection) {
      recruiterSection.style.display = isRecruiter ? '' : 'none';
    }
    if (recruiterAssembledSection) {
      recruiterAssembledSection.style.display = isRecruiter ? '' : 'none';
    }

    if (modeSelect) {
      modeSelect.value = HERMES_MODE;
      const optDev = modeSelect.querySelector('option[value="dev"]');
      const optRecruiter = modeSelect.querySelector(
        'option[value="recruiter"]'
      );
      if (optDev) optDev.textContent = t('modeDev');
      if (optRecruiter) optRecruiter.textContent = t('modeRecruiter');
    }
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

async function handleSmartReply(mode) {
  setStatus(t('statusSmartPreparing'));

  // Carica i template personalizzati (se esistono)
  const customBodies = CUSTOM_BODIES || {};

  getLinkedinMessagingTab(
    (tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: 'HERMES_GET_INTERLOCUTOR_NAME' },
        async (response) => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.warn('[Hermes] Errore richiesta interlocutore:', err.message);
          }

          // Estrai il nome dall'header (es. "Natalia Kasperek" → "Natalia")
          let fullName = response && typeof response.interlocutorName === 'string'
            ? response.interlocutorName.trim()
            : null;

          let firstName = 'there';
          if (fullName) {
            // Prendi solo la prima parola con iniziale maiuscola
            const match = fullName.match(/^[A-ZÀ-Ú][a-zà-ú-]+/);
            firstName = match ? match[0] : fullName.split(' ')[0];
          }

// Template: prima personalizzato, poi default
let template =
  customBodies?.[HERMES_LANG]?.[mode] ||
  DEFAULT_BODIES[HERMES_LANG]?.[mode] ||
  DEFAULT_BODIES.en[mode] ||
  '';

// PULIZIA righe: niente spazi iniziali, niente \n\n
template = template
  .replace(/^\s+/, '')    // leva whitespace / newline all'inizio
  .replace(/\n{2,}/g, '\n'); // comprime 2+ a capo in uno solo

          // Costruisci il messaggio SENZA righe vuote inutili
          let replyText = '';
          if (HERMES_LANG === 'it') {
            replyText = `Ciao ${firstName},\n${template}\nUn saluto`;
          } else {
            replyText = `Hi ${firstName},\n${template}\nBest regards`;
          }

          // Inserisci il messaggio
          chrome.tabs.sendMessage(
            tab.id,
            { type: 'HERMES_INSERT_REPLY', replyText },
            (res2) => {
              const err2 = chrome.runtime.lastError;
              if (err2) {
                console.warn('[Hermes] Errore inserimento risposta:', err2.message);
              }

              const ok = res2 && res2.ok;

              if (ok) {
                setStatus(t('statusSmartInsertedNamed', firstName));
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


  function collectRecruiterForm() {
    return {
      company:
        (recruiterCompanyInput && recruiterCompanyInput.value.trim()) || '',
      role: (recruiterRoleInput && recruiterRoleInput.value.trim()) || '',
      workmode:
        (recruiterWorkmodeInput &&
          recruiterWorkmodeInput.value.trim()) || '',
      contract:
        (recruiterContractInput &&
          recruiterContractInput.value.trim()) || '',
      recruiter:
        (recruiterRecruiterInput &&
          recruiterRecruiterInput.value.trim()) || '',
      notes:
        (recruiterNotesTextarea &&
          recruiterNotesTextarea.value.trim()) || '',
      includeCompany:
        !!(recruiterCompanyInclude && recruiterCompanyInclude.checked),
      includeRole:
        !!(recruiterRoleInclude && recruiterRoleInclude.checked),
      includeWorkmode:
        !!(recruiterWorkmodeInclude && recruiterWorkmodeInclude.checked),
      includeContract:
        !!(recruiterContractInclude && recruiterContractInclude.checked),
      includeRecruiter:
        !!(recruiterRecruiterInclude && recruiterRecruiterInclude.checked),
      includeNotes:
        !!(recruiterNotesInclude && recruiterNotesInclude.checked),

// nuovi campi per il saluto
      greetingSalutation:
        (recruiterGreetingSalutationSelect &&
          recruiterGreetingSalutationSelect.value) || '',
      greetingTitle:
        (recruiterGreetingTitleSelect &&
          recruiterGreetingTitleSelect.value) || '',
      greetingNameMode:
        (recruiterGreetingNameModeSelect &&
          recruiterGreetingNameModeSelect.value) || 'first',

    };
  }


function saveRecruiterFormToStorage() {
  try {
    const form = collectRecruiterForm();
    chrome.storage.sync.set({ [RECRUITER_FORM_KEY]: form });
  } catch (e) {
    console.warn('[Hermes] Impossibile salvare il form recruiter:', e);
  }
}

function restoreRecruiterFormFromStorage(callback) {
  try {
    chrome.storage.sync.get([RECRUITER_FORM_KEY], (res) => {
      const data = res && res[RECRUITER_FORM_KEY];
      if (data) {
        if (recruiterCompanyInput) recruiterCompanyInput.value = data.company || '';
        if (recruiterRoleInput) recruiterRoleInput.value = data.role || '';
        if (recruiterWorkmodeInput) recruiterWorkmodeInput.value = data.workmode || '';
        if (recruiterContractInput) recruiterContractInput.value = data.contract || '';
        if (recruiterRecruiterInput) recruiterRecruiterInput.value = data.recruiter || '';
        if (recruiterNotesTextarea) recruiterNotesTextarea.value = data.notes || '';

        if (recruiterCompanyInclude)
          recruiterCompanyInclude.checked = !!data.includeCompany;
        if (recruiterRoleInclude)
          recruiterRoleInclude.checked = !!data.includeRole;
        if (recruiterWorkmodeInclude)
          recruiterWorkmodeInclude.checked = !!data.includeWorkmode;
        if (recruiterContractInclude)
          recruiterContractInclude.checked = !!data.includeContract;
        if (recruiterRecruiterInclude)
          recruiterRecruiterInclude.checked = !!data.includeRecruiter;
        if (recruiterNotesInclude)
          recruiterNotesInclude.checked = !!data.includeNotes;

        // greeting
        if (recruiterGreetingSalutationSelect && data.greetingSalutation)
          recruiterGreetingSalutationSelect.value = data.greetingSalutation;
        if (recruiterGreetingTitleSelect && data.greetingTitle)
          recruiterGreetingTitleSelect.value = data.greetingTitle;
        if (recruiterGreetingNameModeSelect && data.greetingNameMode)
          recruiterGreetingNameModeSelect.value = data.greetingNameMode;
      }
      if (callback) callback();
    });
  } catch (e) {
    console.warn('[Hermes] Impossibile leggere il form recruiter:', e);
    if (callback) callback();
  }
}



function buildRecruiterMessageText(candidateName, form) {
  const lang = HERMES_LANG;
  const template = getRecruiterBody(lang) || '';

  // placeholder "semplici"
  const basePlaceholders = {
    candidate: candidateName || '',
    recruiter: form.recruiter || '',
    company: form.includeCompany ? form.company : '',
    role: form.includeRole ? form.role : '',
    workmode: form.includeWorkmode ? form.workmode : '',
    contract: form.includeContract ? form.contract : '',
    locations: form.includeLocations ? form.locations : '',
    notes: form.includeNotes ? form.notes : '',
  };

  // blocchi frasali opzionali (con spazi / virgole già inclusi)
  const blocks = {
    company_block: '',
    role_block: '',
    workmode_block: '',
    contract_block: '',
    locations_block: '',
  };

  if (lang === 'it') {
    if (form.includeCompany && form.company) {
      blocks.company_block = ` per conto di ${form.company}`;
    }
    if (form.includeRole && form.role) {
      blocks.role_block = ` per una posizione come ${form.role}`;
    }
    if (form.includeWorkmode && form.workmode) {
      blocks.workmode_block = `, in modalità ${form.workmode}`;
    }
    if (form.includeContract && form.contract) {
      blocks.contract_block = `, contratto: ${form.contract}`;
    }
    if (form.includeLocations && form.locations) {
      blocks.locations_block = `, con sede ${form.locations}`;
    }
  } else {
    if (form.includeCompany && form.company) {
      blocks.company_block = ` on behalf of ${form.company}`;
    }
    if (form.includeRole && form.role) {
      blocks.role_block = `, regarding a ${form.role} position`;
    }
    if (form.includeWorkmode && form.workmode) {
      blocks.workmode_block = `, in workmode ${form.workmode}`;
    }
    if (form.includeContract && form.contract) {
      blocks.contract_block = `, contract: ${form.contract}`;
    }
    if (form.includeLocations && form.locations) {
      blocks.locations_block = `, location: ${form.locations}`;
    }
  }

  const placeholders = {
    ...basePlaceholders,
    ...blocks,
  };

  let body = template;
  Object.keys(placeholders).forEach((key) => {
    const re = new RegExp('\\{' + key + '\\}', 'g');
    body = body.replace(re, placeholders[key] || '');
  });

  body = body
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .trim();

  let greeting = '';
  let closing = '';

// usiamo le *chiavi* salvate nel form e le mappiamo
  // alle label corrette per la lingua corrente
  const defaultSalutationKey = 'ciao';   // default: Ciao / Hi
  const salutationKey =
    (form && form.greetingSalutation) || defaultSalutationKey;
  const salutation = getSalutationLabel(lang, salutationKey);

  const defaultTitleKey = 'none';
  const titleKey =
    (form && form.greetingTitle) || defaultTitleKey;
  const title = getTitleLabel(lang, titleKey);

  const nameMode = (form && form.greetingNameMode) || 'first';

  const fullName = (candidateName || '').trim();
  let firstName = '';
  let lastName = '';

  if (fullName) {
    const parts = fullName.split(/\s+/);
    firstName = parts[0];
    lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  }

  let nameForGreeting = '';
  if (fullName) {
    if (nameMode === 'last' && lastName) {
      nameForGreeting = lastName;
    } else if (nameMode === 'full') {
      nameForGreeting = fullName;
    } else {
      // 'first' o fallback
      nameForGreeting = firstName || fullName;
    }
  }

  const titlePart = title ? ` ${title}` : '';
  const namePart = nameForGreeting ? ` ${nameForGreeting}` : '';

  if (fullName) {
    greeting = `${salutation}${titlePart}${namePart},\n\n`;
  } else {
    // se non abbiamo il nome niente titolo / cognome
    greeting = `${salutation},\n\n`;
  }

  if (lang === 'it') {
    closing = '\n\nUn saluto,\n' + (form.recruiter || '');
  } else {
    closing = '\n\nBest regards,\n' + (form.recruiter || '');
  }

  return `${greeting}${body}${closing}`;
}


  function handleRecruiterGenerate() {
    setStatus(t('statusRecruiterPreparing'));

    getLinkedinMessagingTab(
      (tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: 'HERMES_GET_INTERLOCUTOR_NAME' },
          (response) => {
            const err = chrome.runtime.lastError;
            if (err) {
              console.warn(
                '[Hermes] Errore richiesta interlocutore (recruiter):',
                err.message
              );
            }

            const name =
              response && typeof response.interlocutorName === 'string'
                ? response.interlocutorName.trim()
                : null;

            const form = collectRecruiterForm();
            const replyText = buildRecruiterMessageText(name, form);

            chrome.tabs.sendMessage(
              tab.id,
              { type: 'HERMES_INSERT_REPLY', replyText },
              (res2) => {
                const err2 = chrome.runtime.lastError;
                if (err2) {
                  console.warn(
                    '[Hermes] Errore inserimento messaggio recruiter:',
                    err2.message
                  );
                }

                const ok = res2 && res2.ok;

                if (ok) {
                  if (name) {
                    setStatus(
                      t('statusRecruiterInsertedNamed', name)
                    );
                  } else {
                    setStatus(t('statusRecruiterInsertedNoName'));
                  }
                } else {
                  const copied = copyToClipboard(replyText);
                  if (copied) {
                    setStatus(t('statusRecruiterClipboardFallback'));
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

  function handleEditRecruiterTemplate() {
    const url =
      'editor.html?mode=' +
      encodeURIComponent('recruiter_message') +
      '&lang=' +
      encodeURIComponent(HERMES_LANG);

    chrome.windows.create({
      url,
      type: 'popup',
      width: 520,
      height: 420,
    });
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
  if (openRecruiterBtn) {
    openRecruiterBtn.addEventListener('click', () => {
      chrome.windows.create({
        url: 'recruiter.html',
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

    // --- Recruiter mode: pulsanti in fondo ---
  if (recruiterGenerateBtn) {
    recruiterGenerateBtn.addEventListener('click', () => {
      handleRecruiterGenerate();
    });
  }

  if (recruiterEditTemplateBtn) {
    recruiterEditTemplateBtn.addEventListener('click', () => {
      handleEditSmartBody('recruiter_message');
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


    if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      HERMES_MODE =
        modeSelect.value === 'recruiter' ? 'recruiter' : 'dev';
      chrome.storage.sync.set({ hermesMode: HERMES_MODE }, () => {
        applyMode();
      });
    });
  }



  function hideEmptySmartButtons() {
  const rows = document.querySelectorAll('.smart-row');
  rows.forEach(row => {
    const btn = row.querySelector('button');
    if (btn && btn.textContent.trim().length === 0) {
      row.style.display = 'none';
    }
  });
}


  chrome.storage.sync.get(['hermesLang', 'hermesMode'], (res) => {
    if (res && res.hermesLang && HERMES_I18N[res.hermesLang]) {
      HERMES_LANG = res.hermesLang;
    } else {
      HERMES_LANG = detectDefaultLang();
    }

    if (res && typeof res.hermesMode === 'string') {
      HERMES_MODE =
        res.hermesMode === 'recruiter' ? 'recruiter' : 'dev';
    } else {
      HERMES_MODE = 'dev';
    }

    loadCustomBodies(() => {
      renderLabels();
    });
  });





});
