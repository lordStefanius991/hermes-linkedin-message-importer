// src/component/MessageDetail.tsx
import {
  useEffect,
  useState,
  type MouseEvent,
} from 'react';
import type { Message } from '../types/message';
import { useI18n } from '../i18n';

type Props = {
  message: Message | null;
  onRefreshThread?: () => void;
};

function formatDateTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Evidenzia tutte le occorrenze di searchTerm in text
function highlight(
  text: string,
  term: string,
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
) {
  const trimmed = term.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span
        key={index}
        className="highlight-match"
        onClick={onClick}
      >
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

function renderThread(
  fullText: string,
  searchTerm: string,
  onMatchClick?: (e: MouseEvent<HTMLSpanElement>) => void
) {
  if (!fullText) return null;

  const defaultTextColor = '#f5f1ff';

  // Spezziamo in blocchi logici usando le doppie newline
  const blocks = fullText.split('\n\n');

  return blocks.map((rawBlock, index) => {
    const block = rawBlock.trim();
    if (!block) return null;

    const colonIndex = block.indexOf(':');
    const firstNewline = block.indexOf('\n');

    const colonLooksLikeNameSeparator =
      colonIndex !== -1 &&
      (firstNewline === -1 || colonIndex < firstNewline) &&
      colonIndex > 0 &&
      colonIndex <= 60;

    // Caso 1: NON sembra "Nome:" → testo normale
    if (!colonLooksLikeNameSeparator) {
      return (
        <div
          key={index}
          style={{
            marginBottom: 16,
            color: defaultTextColor,
            lineHeight: 1.35,
            whiteSpace: 'pre-wrap',
          }}
        >
          {highlight(block, searchTerm, onMatchClick)}
        </div>
      );
    }

    // Caso 2: blocco nel formato "Nome: resto del testo"
    const sender = block.slice(0, colonIndex).trim();
    const text = block.slice(colonIndex + 1).trimStart();

    const nameColor = '#ff5757'; // solo il nome in rosso

    return (
      <div
        key={index}
        style={{
          marginBottom: 16,
          color: defaultTextColor,
          lineHeight: 1.35,
          whiteSpace: 'pre-wrap',
        }}
      >
        {/* Nome in rosso con highlight */}
        <span
          style={{
            color: nameColor,
            fontWeight: 'bold',
            fontSize: '0.95rem',
          }}
        >
          {highlight(sender, searchTerm, onMatchClick)}:
        </span>{' '}
        {/* Testo del messaggio con highlight */}
        <span>
          {highlight(text, searchTerm, onMatchClick)}
        </span>
      </div>
    );
  });
}

function MessageDetail({ message, onRefreshThread }: Props) {
  const { t, lang } = useI18n();
  const isItalian = lang === 'it';
  const isEnglish = lang === 'en';
  const isEspanol = lang === 'es';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentHitIndex, setCurrentHitIndex] = useState(-1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [smartReplyText, setSmartReplyText] = useState('');
  const [smartReplyCopied, setSmartReplyCopied] = useState(false);

  const clearActiveMatchClass = () => {
    const container = document.querySelector(
      '.detail-thread'
    ) as HTMLElement | null;
    if (!container) return;
    const hits =
      container.querySelectorAll<HTMLSpanElement>(
        '.highlight-match-active'
      );
    hits.forEach((m) =>
      m.classList.remove('highlight-match-active')
    );
  };

  // quando cambi conversazione, azzero tutto
  useEffect(() => {
    setSearchTerm('');
    setCurrentHitIndex(-1);
    clearActiveMatchClass();
    setSmartReplyText('');
    setSmartReplyCopied(false);
  }, [message?.id]);

  // quando cambia il testo cercato, riparto da zero e pulisco la match attiva
  useEffect(() => {
    setCurrentHitIndex(-1);
    clearActiveMatchClass();
  }, [searchTerm]);

  const handleNextMatch = () => {
    if (!searchTerm.trim()) return;

    const container = document.querySelector(
      '.detail-thread'
    ) as HTMLElement | null;
    if (!container) return;

    const hits =
      container.querySelectorAll<HTMLSpanElement>(
        '.highlight-match'
      );
    if (!hits.length) return;

    const nextIndex = (currentHitIndex + 1) % hits.length;
    const el = hits[nextIndex];

    // togliamo il verde da tutte, lo mettiamo solo alla corrente
    hits.forEach((m) =>
      m.classList.remove('highlight-match-active')
    );
    el.classList.add('highlight-match-active');

    // scrolliamo solo il pannello del thread
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const offsetInside =
      elRect.top -
      containerRect.top -
      container.clientHeight / 2;

    const targetScrollTop =
      container.scrollTop + offsetInside;

    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });

    setCurrentHitIndex(nextIndex);
  };

  const handleMatchClick = (event: MouseEvent<HTMLSpanElement>) => {
    if (!searchTerm.trim()) return;

    const container = document.querySelector(
      '.detail-thread'
    ) as HTMLElement | null;
    if (!container) return;

    const hits =
      container.querySelectorAll<HTMLSpanElement>(
        '.highlight-match'
      );
    if (!hits.length) return;

    const el = event.currentTarget;
    const index = Array.from(hits).indexOf(el);
    if (index === -1) return;

    hits.forEach((m) =>
      m.classList.remove('highlight-match-active')
    );
    el.classList.add('highlight-match-active');

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const offsetInside =
      elRect.top -
      containerRect.top -
      container.clientHeight / 2;

    const targetScrollTop =
      container.scrollTop + offsetInside;

    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });

    setCurrentHitIndex(index);
  };

  const handleRefreshClick = async () => {
    if (!onRefreshThread) return;

    try {
      setIsRefreshing(true);
      await Promise.resolve(onRefreshThread());
    } finally {
      setTimeout(() => setIsRefreshing(false), 200);
    }
  };

const smartLabels = {
  title: isItalian
    ? 'Suggerimenti di risposta'
    : isEspanol
    ? 'Respuestas inteligentes'
    : 'Smart replies',

  politeDecline: isItalian
    ? 'Declina gentilmente'
    : isEspanol
    ? 'Rechazo amable'
    : 'Polite decline',

  interested: isItalian
    ? 'Interessato'
    : isEspanol
    ? 'Interesado'
    : 'Interested',

  moreInfo: isItalian
    ? 'Chiedi più info'
    : isEspanol
    ? 'Pide más información'
    : 'Ask for more info',

  placeholder: isItalian
    ? 'Qui apparirà il testo suggerito. Puoi modificarlo prima di copiarlo.'
    : isEspanol
    ? 'Aquí aparecerá el texto sugerido. Puedes editarlo antes de copiarlo.'
    : 'Suggested reply will appear here. You can edit it before copying.',

  copy: isItalian
    ? 'Copia risposta'
    : isEspanol
    ? 'Copiar respuesta'
    : 'Copy reply',

  copied: isItalian
    ? 'Copiato!'
    : isEspanol
    ? '¡Copiado!'
    : 'Copied!',
};


  const generateSmartReply = (
    mode: 'polite_decline' | 'interested' | 'more_info'
  ) => {
    if (!message) return;

    const recruiterName =
      message.senderName && message.senderName.trim().length > 0
        ? message.senderName.split(' ')[0]
        : isItalian
        ? 'Recruiter'
        : 'Recruiter';

    let text = '';

    if (isItalian) {
      if (mode === 'polite_decline') {
        text = `Ciao ${recruiterName},\n\nti ringrazio per il messaggio e per aver pensato a me. Al momento non sto valutando nuove opportunità, ma ti sono grato per il contatto.\n\nUn saluto,\nStefano`;
      } else if (mode === 'interested') {
        text = `Ciao ${recruiterName},\n\ngrazie per avermi contattato. L'opportunità mi sembra interessante e sarei disponibile ad approfondire. In particolare cerco ruoli full remote, con stack Java / backend e una RAL in linea con il mio profilo.\n\nSe ti va possiamo sentirci per una call e capire meglio contesto, team e range economico.\n\nUn saluto,\nStefano`;
      } else {
        text = `Ciao ${recruiterName},\n\nti ringrazio per la proposta. Prima di fissare una call mi aiuterebbe avere qualche dettaglio in più su: tipo di contratto, range RAL, modalità di lavoro (presenza/ibrido/remote) e stack tecnologico principale.\n\nCosì posso capire subito se l'opportunità può essere in linea con il mio percorso.\n\nGrazie ancora,\nStefano`;
      }
    } else if (isEnglish) {
      if (mode === 'polite_decline') {
        text = `Hi ${recruiterName},\n\nthanks a lot for reaching out and considering me for this opportunity. At the moment I'm not looking to change role, but I really appreciate your message.\n\nBest regards,\nStefano`;
      } else if (mode === 'interested') {
        text = `Hi ${recruiterName},\n\nthanks for contacting me. The role sounds interesting and I'd be open to discuss it further. I'm mainly looking for full-remote positions, backend/Java stack and a salary range aligned with my experience.\n\nIf it makes sense, we can schedule a call to go through context, team and compensation range.\n\nBest regards,\nStefano`;
      } else {
        text = `Hi ${recruiterName},\n\nthank you for your message. Before scheduling a call it would be helpful to have a bit more detail about: contract type, salary range, working mode (on-site/hybrid/remote) and main tech stack.\n\nThat would help me quickly understand how well the position fits my profile.\n\nBest regards,\nStefano`;
      }
    }else if (isEspanol) {
      if (mode === 'polite_decline') {
        text = `Hola ${recruiterName},\n\nmuchas gracias por tu mensaje y por tenerme en cuenta. En este momento no estoy buscando un cambio, pero agradezco mucho tu contacto.\n\nSaludos,\nStefano`;
      } else if (mode === 'interested') {
        text = `Hola ${recruiterName},\n\ngracias por contactarme. La oportunidad parece interesante y estaría disponible para profundizar en los detalles. Principalmente busco posiciones full-remote, con stack backend/Java y un rango salarial acorde a mi experiencia.\n\nSi te parece, podemos agendar una llamada para conocer mejor el contexto, el equipo y el rango de compensación.\n\nSaludos,\nStefano`;
      } else {
        text = `Hola ${recruiterName},\n\nmuchas gracias por tu mensaje. Antes de programar una llamada me sería útil conocer algunos detalles adicionales: tipo de contrato, rango salarial, modalidad de trabajo (presencial/híbrido/remote) y el stack tecnológico principal.\n\nDe esta manera puedo evaluar rápidamente si la oportunidad encaja con mi perfil.\n\nSaludos,\nStefano`;
      }
    }

    setSmartReplyText(text);
    setSmartReplyCopied(false);
  };

  const handleCopySmartReply = async () => {
    if (!smartReplyText.trim()) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(smartReplyText);
      } else {
        // fallback molto basico
        const textarea = document.createElement('textarea');
        textarea.value = smartReplyText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setSmartReplyCopied(true);
      setTimeout(() => setSmartReplyCopied(false), 1200);
    } catch (err) {
      console.error('Errore copiando la risposta', err);
    }
  };

  if (!message) {
    return (
      <div className="detail-empty">
        {t('detail.empty')}
      </div>
    );
  }

  const tagsLabel =
    message.tags && message.tags.length > 0
      ? message.tags.join(', ')
      : '—';

  const formattedDate = formatDateTime(
    (message as any).receivedAt
  );

  return (
    <div className="detail-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 'bold',
              marginBottom: 2,
            }}
          >
            {message.senderName}
          </div>

          {formattedDate && (
            <div
              style={{
                fontSize: '0.75rem',
                opacity: 0.75,
                marginBottom: 2,
              }}
            >
              {formattedDate}
            </div>
          )}

          {message.senderProfileUrl && (
            <a
              href={message.senderProfileUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.85rem',
                color: '#ffd86b',
              }}
            >
              {t('detail.openOnLinkedin')}
            </a>
          )}
        </div>
        <div
          style={{
            textAlign: 'right',
            fontSize: '0.8rem',
          }}
        >
          <div>
            {t('detail.priority')}{' '}
            {message.priority}
          </div>
          <div>
            {t('detail.source')}{' '}
            {message.source}
          </div>
        </div>
      </div>

      <div
        style={{ fontSize: '0.8rem', marginBottom: 6 }}
      >
        {t('detail.tags')} {tagsLabel}
      </div>

      {/* 🔍 Barra di ricerca del thread + bottone "next" */}
      <div
        className="message-search"
        style={{
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          className="message-search-icon"
          aria-hidden="true"
        >
          🔍
        </span>
        <input
          type="text"
          className="message-search-input"
          placeholder={t('detail.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <button
          type="button"
          className="thread-search-next"
          onClick={handleNextMatch}
          disabled={!searchTerm.trim()}
          title={t('detail.searchNextTitle')}
        >
          ↓
        </button>
      </div>

      {/* 🔄 Bottone Aggiorna TRA barra e text area */}
      {onRefreshThread && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            className="thread-search-next"
            onClick={handleRefreshClick}
            title={t('detail.refreshThread')}
          >
            {t('detail.refreshThread')}
          </button>
        </div>
      )}

      {/* Area testo thread */}
      <div
        className={
          'detail-thread' +
          (isRefreshing ? ' detail-thread-refreshing' : '')
        }
      >
        {message.fullText &&
        message.fullText.trim().length > 0 ? (
          renderThread(
            message.fullText,
            searchTerm,
            handleMatchClick
          )
        ) : (
          <span style={{ opacity: 0.7 }}>
            {t('detail.noThread')}
          </span>
        )}
      </div>

      {/* Smart Reply Designer */}
      <div className="smart-reply-panel">
        <div className="smart-reply-header">
          <span>{smartLabels.title}</span>
        </div>
        <div className="smart-reply-buttons">
          <button
            type="button"
            className="smart-reply-button"
            onClick={() =>
              generateSmartReply('polite_decline')
            }
          >
            {smartLabels.politeDecline}
          </button>
          <button
            type="button"
            className="smart-reply-button"
            onClick={() =>
              generateSmartReply('interested')
            }
          >
            {smartLabels.interested}
          </button>
          <button
            type="button"
            className="smart-reply-button"
            onClick={() =>
              generateSmartReply('more_info')
            }
          >
            {smartLabels.moreInfo}
          </button>
        </div>
        <textarea
          className="smart-reply-textarea"
          placeholder={smartLabels.placeholder}
          value={smartReplyText}
          onChange={(e) =>
            setSmartReplyText(e.target.value)
          }
        />
        <div className="smart-reply-footer">
          {smartReplyCopied && (
            <span className="smart-reply-status">
              {smartLabels.copied}
            </span>
          )}
          <button
            type="button"
            className="thread-search-next"
            onClick={handleCopySmartReply}
            disabled={!smartReplyText.trim()}
          >
            {smartLabels.copy}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageDetail;
