// service-worker.js (background MV3, type: "module" o classico)

console.log('[Hermes|SW] Service worker attivo');

const BACKEND_BASE_URL = 'http://localhost:8080/api/v1';
const BULK_ENDPOINT = `${BACKEND_BASE_URL}/messages/bulk`;
const THREAD_ENDPOINT = `${BACKEND_BASE_URL}/messages/thread`;

/* ============================================================
   UTIL: PARSING DATE/TIME DI LINKEDIN (IT/EN)
   ============================================================ */

// Mappa mesi su base delle prime 3 lettere (it / en)
const MONTH_INDEX_BY_3 = {
  // Italiano
  gen: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mag: 4,
  giu: 5,
  lug: 6,
  ago: 7,
  set: 8,
  ott: 9,
  nov: 10,
  dic: 11,
  // Inglese, nel caso tu cambi lingua
  jan: 0,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  dec: 11,
};

function parseDayMonthYear(dayStr, monthStr, yearStr) {
  const now = new Date();
  const day = parseInt(dayStr, 10);
  const key = monthStr.toLowerCase().slice(0, 3);
  const monthIndex = MONTH_INDEX_BY_3[key];

  if (!day || monthIndex === undefined) {
    return null;
  }

  const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();

  const d = new Date(year, monthIndex, day, 0, 0, 0, 0);
  if (isNaN(d.getTime())) {
    return null;
  }
  return d;
}

function normalizeLinkedinTimestamp(rawTimestamp) {
  const now = new Date();

  if (!rawTimestamp) {
    return now.toISOString();
  }

  const trimmed = String(rawTimestamp).trim();

  // 1) Caso migliore: LinkedIn dà un ISO completo in datetime
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed;
  }

  // 2) Solo ora tipo "10:35" o "9.05"
  const timeMatch = trimmed.match(/^(\d{1,2})[:.](\d{2})$/);
  if (timeMatch) {
    const hh = parseInt(timeMatch[1], 10);
    const mm = parseInt(timeMatch[2], 10);

    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hh,
      mm,
      0,
      0
    );
    return d.toISOString();
  }

  // 3) "oggi" / "today" / "ieri" / "yesterday"
  if (/^oggi$/i.test(trimmed) || /^today$/i.test(trimmed)) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString();
  }

  if (/^ieri$/i.test(trimmed) || /^yesterday$/i.test(trimmed)) {
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    return d.toISOString();
  }

  // 4) Pattern tipo "6 apr 2023" o "6 aprile 2023"
  let m = trimmed.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
  if (m) {
    const parsed = parseDayMonthYear(m[1], m[2], m[3]);
    if (parsed) return parsed.toISOString();
  }

  // 5) Pattern tipo "6 apr" o "6 aprile" (assumo anno corrente)
  m = trimmed.match(/^(\d{1,2})\s+([^\s]+)$/);
  if (m) {
    const parsed = parseDayMonthYear(m[1], m[2], null);
    if (parsed) return parsed.toISOString();
  }

  // 6) Pattern inglese "Nov 20" o "Nov 20 2023"
  m = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2})(?:\s+(\d{4}))?$/);
  if (m) {
    const monthStr = m[1];
    const dayStr = m[2];
    const yearStr = m[3] || null;
    const parsed = parseDayMonthYear(dayStr, monthStr, yearStr);
    if (parsed) return parsed.toISOString();
  }

  // 7) Tentativo generico (ultimissimo fallback)
  const parsedGeneric = new Date(trimmed);
  if (!isNaN(parsedGeneric.getTime())) {
    return parsedGeneric.toISOString();
  }

  // 8) Fallback definitivo: ora di import
  return now.toISOString();
}

/* ============================================================
   MAPPATURA ITEM SIDEBAR → DTO BACKEND
   ============================================================ */

function mapSidebarItemToMessageDto(item) {
  const receivedAtIso = normalizeLinkedinTimestamp(item?.timestamp);

  return {
    id: null,
    senderName: item.sender || '(sconosciuto)',
    senderProfileUrl: item.senderProfileUrl || '', // 👈 ADESSO USA IL VALORE DELLA SIDEBAR
    snippet: item.snippet || item.fullText || '',
    receivedAt: receivedAtIso,
    priority: 'LOW',
    source: 'LINKEDIN_SIDEBAR',
    tags: [],
    fullText: null, // il thread vero arriva con "Importa thread"
    threadUrl: item.threadUrl || null,
  };
}

/* ============================================================
   INVIO MASSIVO SIDEBAR
   ============================================================ */

async function sendSidebarMessagesToBackend(sidebarItems) {
  if (!Array.isArray(sidebarItems) || sidebarItems.length === 0) {
    console.log('[Hermes|SW] Nessun elemento sidebar da inviare.');
    return;
  }

  console.log(
    `[Hermes|SW] Invio bulk di ${sidebarItems.length} messaggi al backend...`
  );

  const mapped = sidebarItems.map(mapSidebarItemToMessageDto);

  try {
    const resp = await fetch(BULK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapped),
    });

    if (!resp.ok) {
      console.warn('[Hermes|SW] Errore invio bulk, status =', resp.status);
    } else {
      console.log('[Hermes|SW] Bulk salvato correttamente');
    }
  } catch (err) {
    console.error('[Hermes|SW] Errore rete verso backend (bulk):', err);
  }
}

/* ============================================================
   IMPORT THREAD COMPLETO (CONVERSAZIONE APERTA)
   ============================================================ */

async function handleThreadData(payload) {
  try {
    const {
      fullThread,
      lastSenderName,
      lastTimestampLabel,
      interlocutorName,
      threadUrl,
    } = payload || {};

    if (!fullThread) {
      console.warn('[Hermes|SW] Thread vuoto, niente da salvare');
      return;
    }

    if (!interlocutorName) {
      console.warn(
        '[Hermes|SW] Nessun interlocutorName nel payload thread (header conversazione)'
      );
      return;
    }

    const senderName = interlocutorName;

    // Boolean lastFromMe: true se l'ultimo messaggio NON è dell'interlocutore
    let lastFromMe = null;
    if (lastSenderName && senderName) {
      const normLast = lastSenderName.trim().toLowerCase();
      const normSender = senderName.trim().toLowerCase();
      lastFromMe = normLast !== normSender;
    }

    // Timestamp dell'ultimo messaggio (per aggiornare receivedAt lato backend)
    const lastMessageAt = lastTimestampLabel
      ? normalizeLinkedinTimestamp(lastTimestampLabel)
      : null;

    const body = {
      senderName,
      fullText: fullThread,
      lastFromMe,
      threadUrl: threadUrl || null,
      // nuovo campo: il backend può usarlo per aggiornare receivedAt
      lastMessageAt,
    };

    console.log('[Hermes|SW] Invio aggiornamento thread per', senderName, body);

    const resp = await fetch(THREAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      console.warn(
        '[Hermes|SW] Errore salvataggio thread, status =',
        resp.status
      );
    } else {
      console.log(
        '[Hermes|SW] Thread, lastFromMe, threadUrl e lastMessageAt salvati con successo'
      );
    }
  } catch (err) {
    console.error('[Hermes|SW] Errore durante il salvataggio del thread', err);
  }
}


/* ============================================================
   LISTENER MESSAGGI DALL'ESTENSIONE
   ============================================================ */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Hermes|SW] Messaggio ricevuto:', message.type);

  if (message.type === 'HERMES_SIDEBAR_DATA') {
    sendSidebarMessagesToBackend(message.payload);
  }

  if (message.type === 'HERMES_THREAD_DATA') {
    handleThreadData(message.payload);
  }

  // per eventuale sendResponse async
  return true;
});
