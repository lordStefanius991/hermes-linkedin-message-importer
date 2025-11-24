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

    const senderElOld = item.querySelector(
      '.msg-conversation-listitem__participant-names'
    );
    if (senderElOld && senderElOld.innerText.trim()) {
      sender = senderElOld.innerText.trim();
    }

    if (!sender) {
      const spanName = item.querySelector('span[dir="ltr"], span[dir="auto"]');
      if (spanName && spanName.innerText.trim()) {
        sender = spanName.innerText.trim();
      }
    }

    let snippet = null;

    const snippetElOld = item.querySelector(
      '.msg-conversation-listitem__message-snippet'
    );
    if (snippetElOld && snippetElOld.innerText.trim()) {
      snippet = snippetElOld.innerText.trim();
    }

    if (!snippet) {
      const possible = item.querySelector(
        'p, span.msg-s-event-listitem__body, div[dir="ltr"] > span:not(:has(*))'
      );
      if (possible && possible.innerText.trim()) {
        snippet = possible.innerText.trim();
      }
    }

    let timestamp = null;
    const timeEl = item.querySelector('time');
    if (timeEl) {
      const raw = timeEl.getAttribute('datetime') || timeEl.innerText || '';
      timestamp = raw.trim() || null;
    }

    let threadUrl = null;
    const link = item.querySelector('a[href*="/messaging/thread/"]');
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
      timestamp,
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
  const headerEl = document.querySelector('h2.msg-entity-lockup__entity-title');
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
    interlocutorName,
    lastSenderName,
    lastTimestampLabel,
    threadUrl,
  };
}

/* ============================================================
   INSERIMENTO RISPOSTA NELLA TEXTAREA
   ============================================================ */

// qui cerco l’editor dentro la form dei messaggi
function trovaEditorMessaggi() {
  // caso principale: form classica LinkedIn
  let editor = document.querySelector(
    'form.msg-form div.msg-form__contenteditable[contenteditable="true"]'
  );
  if (editor) return editor;

  // fallback generico: qualsiasi contenteditable usato come textbox
  editor = document.querySelector(
    'div.msg-form__contenteditable[contenteditable="true"]'
  );
  if (editor) return editor;

  editor = document.querySelector(
    'div[role="textbox"][contenteditable="true"]'
  );
  if (editor) return editor;

  // ultimo fallback: una textarea
  editor = document.querySelector('textarea');
  return editor || null;
}

function inserisciRispostaNelEditor(text) {
  const editor = trovaEditorMessaggi();
  if (!editor) {
    console.warn('[Hermes] Editor messaggi non trovato.');
    return false;
  }

  editor.focus();

  if (editor instanceof HTMLTextAreaElement) {
    // caso raro, ma per sicurezza
    editor.value = text;
    const ev = new Event('input', { bubbles: true });
    editor.dispatchEvent(ev);
    return true;
  }

  // ------------------------------
  // contentEditable (caso LinkedIn)
  // ------------------------------

  // puliamo contenuto ed eventuali flag "empty"
  editor.innerHTML = '';
  editor.removeAttribute('data-artdeco-is-empty');

  // spezzamo il testo in paragrafi usando \n\n
  const paragraphs = text.split('\n\n');

  paragraphs.forEach((para) => {
    const p = document.createElement('p');

    // dentro ogni paragrafo, se ci sono \n singoli, li trasformiamo in <br>
    const lines = para.split('\n');
    lines.forEach((line, idx) => {
      p.appendChild(document.createTextNode(line));
      if (idx < lines.length - 1) {
        p.appendChild(document.createElement('br'));
      }
    });

    editor.appendChild(p);
  });

  // porta il cursore alla fine
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);

  // notifica a LinkedIn che c'è stato input
  const ev = new InputEvent('input', {
    bubbles: true,
    data: text,
    inputType: 'insertText',
  });
  editor.dispatchEvent(ev);

  return true;
}


/* ============================================================
   LISTENER MESSAGGI DAL BACKGROUND / POPUP
   ============================================================ */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'HERMES_IMPORT_SIDEBAR') {
    const data = estraiConversazioniSidebar();
    console.log('[Hermes] Sidebar estratta (count =', data.length, ')');

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
        lastSenderName,
        lastTimestampLabel,
        interlocutorName,
        threadUrl,
      },
    });

    if (sendResponse) sendResponse({ ok: true, count: messaggi.length });
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
