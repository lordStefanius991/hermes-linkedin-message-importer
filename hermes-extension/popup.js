// ====================== I18N =========================

let HERMES_LANG = "en"; // it | en

function detectDefaultLang() {
  const lang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  if (lang.startsWith("it")) return "it";
  return "en";
}

const HERMES_I18N = {
  it: {
    title: "Hermes",
    labelLanguage: "Lingua",
    btnImportSidebar: "Importa sidebar",
    btnImportThread: "Importa thread corrente",
    btnOpenPanel: "Apri pannello fisso",

    smartSectionTitle: "Smart reply (clipboard)",
    btnSmartDecline: "Declina gentilmente",
    btnSmartInterested: "Interessato",
    btnSmartMoreInfo: "Chiedi più info",

    footerSignature: "by Stefano Paolucci",

    statusNoTab: "Nessuna tab LinkedIn trovata. Apri la messaggistica e riprova.",
    statusSidebarInProgress: "Hermes: estrazione sidebar in corso...",
    statusSidebarOk: (count) => `Hermes: sidebar importata (${count} conversazioni).`,
    statusSidebarCommError: "Hermes: impossibile comunicare con la sidebar.",

    statusThreadInProgress: "Hermes: estrazione thread in corso...",
    statusThreadOk: (count) => `Hermes: thread importato (${count} messaggi).`,
    statusThreadCommError: "Hermes: impossibile comunicare con il thread.",

    statusSmartPreparing: "Hermes: preparo una risposta...",
    statusSmartInsertedNamed: (name) => `Hermes: risposta inserita per "${name}".`,
    statusSmartInsertedNoName: "Hermes: risposta inserita.",
    statusSmartClipboardFallback: "Hermes: risposta copiata. Incollala manualmente.",
  },

  en: {
    title: "Hermes",
    labelLanguage: "Language",
    btnImportSidebar: "Import sidebar",
    btnImportThread: "Import current thread",
    btnOpenPanel: "Open pinned panel",

    smartSectionTitle: "Smart reply (clipboard)",
    btnSmartDecline: "Polite decline",
    btnSmartInterested: "Interested",
    btnSmartMoreInfo: "Ask for more info",

    footerSignature: "by Stefano Paolucci",

    statusNoTab: "No LinkedIn tab found. Open Messaging and try again.",
    statusSidebarInProgress: "Hermes: extracting sidebar...",
    statusSidebarOk: (count) => `Hermes: sidebar imported (${count} conversations).`,
    statusSidebarCommError: "Hermes: cannot communicate with sidebar.",

    statusThreadInProgress: "Hermes: extracting thread...",
    statusThreadOk: (count) => `Hermes: thread imported (${count} messages).`,
    statusThreadCommError: "Hermes: cannot communicate with thread.",

    statusSmartPreparing: "Hermes: preparing a reply...",
    statusSmartInsertedNamed: (name) => `Hermes: reply inserted for "${name}".`,
    statusSmartInsertedNoName: "Hermes: reply inserted.",
    statusSmartClipboardFallback: "Hermes: reply copied. Paste it manually.",
  },
};

function t(key, ...args) {
  const dict = HERMES_I18N[HERMES_LANG] || HERMES_I18N.en;
  const entry = dict[key];
  if (typeof entry === "function") return entry(...args);
  if (typeof entry === "string") return entry;
  return key;
}

// =============== TAB UTILITY ==================

function getLinkedinMessagingTab(callback, onError) {
  chrome.tabs.query(
    {
      url: [
        "*://www.linkedin.com/messaging/*",
        "*://www.linkedin.com/messaging/thread/*",
      ],
    },
    (tabs) => {
      if (!tabs || tabs.length === 0) {
        if (onError) onError(t("statusNoTab"));
        return;
      }
      callback(tabs[0]);
    }
  );
}

// ================== UI RENDER ==================

document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("title");
  const btnSidebar = document.getElementById("import-sidebar");
  const btnThread = document.getElementById("import-thread");
  const openPanelBtn = document.getElementById("open-panel");
  const status = document.getElementById("status");

  const langLabel = document.getElementById("lang-label");
  const langSelect = document.getElementById("lang-select");

  const smartSectionTitle = document.getElementById("smart-section-title");
  const btnSmartDecline = document.getElementById("smart-decline");
  const btnSmartInterested = document.getElementById("smart-interested");
  const btnSmartMoreInfo = document.getElementById("smart-more-info");

  const footerEl = document.getElementById("hermes-footer");

  function setStatus(msg) {
    status.textContent = msg;
  }

  function renderLabels() {
    titleEl.textContent = t("title");
    langLabel.textContent = t("labelLanguage");
    btnSidebar.textContent = t("btnImportSidebar");
    btnThread.textContent = t("btnImportThread");
    openPanelBtn.textContent = t("btnOpenPanel");

    smartSectionTitle.textContent = t("smartSectionTitle");
    btnSmartDecline.textContent = t("btnSmartDecline");
    btnSmartInterested.textContent = t("btnSmartInterested");
    btnSmartMoreInfo.textContent = t("btnSmartMoreInfo");

    footerEl.textContent = t("footerSignature");

    langSelect.value = HERMES_LANG;
  }

  chrome.storage.sync.get(["hermesLang"], (res) => {
    HERMES_LANG = res?.hermesLang ?? detectDefaultLang();
    renderLabels();
  });

  langSelect.addEventListener("change", () => {
    HERMES_LANG = langSelect.value === "it" ? "it" : "en";
    chrome.storage.sync.set({ hermesLang: HERMES_LANG });
    renderLabels();
  });

  // =========== BUTTON ACTIONS ==============

  btnSidebar.addEventListener("click", () => {
    setStatus(t("statusSidebarInProgress"));
    getLinkedinMessagingTab(
      (tab) => chrome.tabs.sendMessage(tab.id, { type: "HERMES_IMPORT_SIDEBAR" }),
      setStatus
    );
  });

  btnThread.addEventListener("click", () => {
    setStatus(t("statusThreadInProgress"));
    getLinkedinMessagingTab(
      (tab) => chrome.tabs.sendMessage(tab.id, { type: "HERMES_IMPORT_THREAD" }),
      setStatus
    );
  });

  openPanelBtn.addEventListener("click", () => {
    getLinkedinMessagingTab(
      (tab) => chrome.tabs.sendMessage(tab.id, { type: "HERMES_OPEN_PANEL" }),
      setStatus
    );
  });
});
