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

function normalizeLinkedinTimestamp(rawLabel) {
  if (!rawLabel) return null;

  const now = new Date();
  const currentYear = now.getFullYear();

  let label = rawLabel.trim().toLowerCase();

  // LinkedIn a volte ripete tipo "17 ott 17 ott" → tolgo duplicati consecutivi
  const parts = label.split(/\s+/);
  const dedup = [];
  for (const p of parts) {
    if (dedup.length === 0 || dedup[dedup.length - 1] !== p) {
      dedup.push(p);
    }
  }
  label = dedup.join(' ');

  // ---- CASO 1: solo orario "HH:mm" => oggi a quell'ora ----
  const timeOnlyMatch = label.match(/^(\d{1,2}):(\d{2})$/);
  if (timeOnlyMatch) {
    const h = parseInt(timeOnlyMatch[1], 10);
    const m = parseInt(timeOnlyMatch[2], 10);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    }
  }

  // Normalizzo la parte "17 ott" / "6 apr 2023"
  const tokens = label.split(/\s+/);
  if (tokens.length >= 2) {
    const day = parseInt(tokens[0], 10);
    if (!Number.isNaN(day)) {
      // prendo le prime 3 lettere del mese senza accenti
      const monthRaw = tokens[1]
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // rimuove accenti
        .slice(0, 3);
      const monthIndex = MONTH_INDEX_BY_3[monthRaw];

      if (monthIndex != null) {
        let year = currentYear;

        // CASO 2: "17 ott 2024"
        if (tokens.length >= 3 && /^\d{4}$/.test(tokens[2])) {
          year = parseInt(tokens[2], 10);
        }

        const d = new Date();
        d.setFullYear(year, monthIndex, day);
        // se non ho orario specifico, metto mezzanotte
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      }
    }
  }

  return null;
}


/* ============================================================
   MAPPATURA ITEM SIDEBAR → DTO BACKEND
   ============================================================ */
   
function mapSidebarItemToMessageDto(item) {
  // usa il campo giusto: timestampLabel, non "timestamp"
  const receivedAtIso = normalizeLinkedinTimestamp(item?.timestampLabel);

  return {
    id: null,
    senderName: item.sender || '(sconosciuto)',
    senderProfileUrl: item.senderProfileUrl || '',
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
