// content-script.js
console.log('[Hermes] content-script attivo su:', window.location.href);

/* ============================================================
   SIDEBAR (LISTA CONVERSAZIONI)
   ============================================================ */

function estraiConversazioniSidebar() {
  const items = document.querySelectorAll('li.msg-conversation-listitem');

  console.log(`[Hermes] Trovate ${items.length} conversazioni nella sidebar.`);

  const conversazioni = [];

  items.forEach((item) => {
    let sender = null;
    const titleEl = item.querySelector(
      '.msg-conversation-listitem__participant-names'
    );
    if (titleEl) {
      sender = titleEl.innerText.trim();
    }

    let snippet = null;
    const snippetEl = item.querySelector(
      '.msg-conversation-listitem__message-snippet'
    );
    if (snippetEl) {
      snippet = snippetEl.innerText.trim();
    }

    let timestampLabel = null;
    const timeEl = item.querySelector('time');
    if (timeEl) {
      const dt = timeEl.getAttribute('datetime') || timeEl.innerText || '';
      timestampLabel = dt.trim();
    }

    let threadUrl = null;
    const link = item.querySelector(
      'a.msg-conversation-listitem__link, a[href*="/messaging/thread/"]'
    );
    if (link && link.href) {
      threadUrl = link.href.split('?')[0];
    }

    let senderProfileUrl = null;
    const profileLink = item.querySelector('a[href*="/in/"]');
    if (profileLink && profileLink.href) {
      senderProfileUrl = profileLink.href.split('?')[0].split('#')[0];
    }

    const fullText = item.innerText.replace(/\s+/g, ' ').trim();

    conversazioni.push({
      sender,
      snippet,
      timestampLabel,
      threadUrl,
      senderProfileUrl,
      fullText,
    });
  });

  return conversazioni;
}

/* ============================================================
   THREAD CORRENTE (CONVERSAZIONE APERTA)
   ============================================================ */

function estraiThreadCorrente() {
  const headerEl = document.querySelector(
    'h2.msg-entity-lockup__entity-title'
  );
  const interlocutorName = headerEl ? headerEl.innerText.trim() : null;

  const msgNodes = document.querySelectorAll(
    'li.msg-s-message-list__event, li.msg-s-event-list__event'
  );

  const messaggi = [];

  msgNodes.forEach((node) => {
    const senderEl =
      node.querySelector('.msg-s-message-group__name') ||
      node.querySelector('span[dir="ltr"]');

    const textEl =
      node.querySelector('.msg-s-message-group__message') ||
      node.querySelector('p');

    const timeEl = node.querySelector('time');

    const senderName = senderEl ? senderEl.innerText.trim() : null;
    const text = textEl ? textEl.innerText.trim() : null;
    const timestampLabel = timeEl
      ? (timeEl.getAttribute('datetime') || timeEl.innerText || '').trim()
      : null;

    if (senderName && text) {
      messaggi.push({ senderName, text, timestampLabel });
    }
  });

  const firstMessageText = messaggi.length > 0 ? messaggi[0].text : '';

  const fullThread = messaggi
    .map((m) => `${m.senderName}:\n${m.text}`)
    .join('\n\n');

  const lastSenderName =
    messaggi.length > 0 ? messaggi[messaggi.length - 1].senderName : null;

  const lastTimestampLabel =
    messaggi.length > 0 ? messaggi[messaggi.length - 1].timestampLabel : null;

  let threadUrl = null;
  const href = window.location.href;
  if (href.includes('/messaging/thread/')) {
    threadUrl = href.split('?')[0].split('#')[0];
  }

  console.log('[Hermes] URL thread corrente:', threadUrl);

  return {
    messaggi,
    fullThread,
    firstMessageText,
    interlocutorName,
    lastSenderName,
    lastTimestampLabel,
    threadUrl,
  };
}

/* ============================================================
   INSERIMENTO RISPOSTA NELLA TEXTAREA
   ============================================================ */

function trovaEditorMessaggi() {
  let editor = document.querySelector(
    'div.msg-form__contenteditable[contenteditable="true"]'
  );
  if (editor) return editor;

  editor = document.querySelector(
    'div[role="textbox"][contenteditable="true"]'
  );
  if (editor) return editor;

  editor = document.querySelector('textarea');
  return editor || null;
}

function inserisciRispostaNelEditor(text) {
  const editor = trovaEditorMessaggi();
  if (!editor) {
    console.warn('[Hermes] Editor non trovato');
    return false;
  }

  // Pulizia totale
  editor.innerHTML = '';

  // Splitta per righe: crea <p> per testo, <br> per vuote (mantiene un solo a capo)
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (line.trim() === '') {
      // Riga vuota → solo <br> per un singolo a capo
      editor.appendChild(document.createElement('br'));
    } else {
      const p = document.createElement('p');
      p.textContent = line.trim();
      editor.appendChild(p);
    }
  });

  // Trigger eventi base
  ['input', 'keyup', 'change'].forEach(type => {
    editor.dispatchEvent(new Event(type, { bubbles: true }));
  });

  // FIX PER ABILITARE "INVIA": Simula una digitazione finale (aggiungi spazio vuoto e rimuovilo)
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);  // Vai alla fine
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  // Inserisci uno spazio temporaneo
  document.execCommand('insertText', false, ' ');

  // Trigger extra per refresh
  editor.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
  editor.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));

  // Rimuovi lo spazio extra (backspace simulato)
  document.execCommand('delete');

  // Final focus e trigger
  editor.blur();
  editor.focus();
  editor.dispatchEvent(new Event('input', { bubbles: true }));

  return true;
}

/* ============================================================
   LISTENER MESSAGGI DA ESTENSIONE
   ============================================================ */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'HERMES_IMPORT_SIDEBAR') {
    const data = estraiConversazioniSidebar();
    console.log(
      '[Hermes] Conversazioni estratte dalla sidebar:',
      data.length
    );

    chrome.runtime.sendMessage({
      type: 'HERMES_SIDEBAR_DATA',
      payload: data,
    });

    if (sendResponse) sendResponse({ ok: true, count: data.length });
  }

  if (msg.type === 'HERMES_IMPORT_THREAD') {
    const {
      messaggi,
      fullThread,
      firstMessageText,
      lastSenderName,
      lastTimestampLabel,
      interlocutorName,
      threadUrl,
    } = estraiThreadCorrente();

    console.log(
      '[Hermes] Thread estratto:',
      messaggi.length,
      'messaggi, URL =',
      threadUrl
    );

    chrome.runtime.sendMessage({
      type: 'HERMES_THREAD_DATA',
      payload: {
        fullThread,
        firstMessageText,
        lastSenderName,
        lastTimestampLabel,
        interlocutorName,
        threadUrl,
      },
    });

    if (sendResponse) {
      sendResponse({
        ok: true,
        count: messaggi.length,
        fullThread,
        firstMessageText,
        interlocutorName,
      });
    }
  }

  if (msg.type === 'HERMES_GET_INTERLOCUTOR_NAME') {
    const { interlocutorName } = estraiThreadCorrente();
    console.log(
      '[Hermes] Richiesto interlocutorName, trovato:',
      interlocutorName
    );
    if (sendResponse) {
      sendResponse({ interlocutorName: interlocutorName || null });
    }
  }

  if (msg.type === 'HERMES_INSERT_REPLY') {
    const text = typeof msg.replyText === 'string' ? msg.replyText : '';
    const ok = inserisciRispostaNelEditor(text);
    if (sendResponse) {
      sendResponse({ ok });
    }
  }

  return true;
});
