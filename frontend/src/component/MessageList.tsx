// src/component/MessageList.tsx
import { useMemo, useState } from 'react';
import type {
  Message,
  MessagePriority,
} from '../types/message';
import { PRIORITY_LABEL } from '../types/message';
import { useI18n } from '../i18n';

type MessageListProps = {
  messages: Message[];
  selectedMessageId: number | null;
  onSelectMessage: (m: Message) => void;
  searchTerm: string;
  onChangePriority: (
    id: number,
    newPriority: MessagePriority
  ) => void;

  selectionMode?: boolean;
  selectedIds?: number[];
  onToggleSelectMessage?: (id: number) => void;
};

const PRIORITY_OPTIONS: MessagePriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
];

function highlight(text: string, term: string) {
  const trimmed = term.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.split(regex).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="highlight-match">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function MessageList({
  messages,
  selectedMessageId,
  onSelectMessage,
  searchTerm,
  onChangePriority,
  selectionMode = false,
  selectedIds = [],
  onToggleSelectMessage,
}: MessageListProps) {
  const { t, lang } = useI18n();

  const locale =
    lang === 'it'
      ? 'it-IT'
      : lang === 'en'
      ? 'en-US'
      : 'es-ES';

  const [openPriorityForId, setOpenPriorityForId] =
    useState<number | null>(null);

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds]
  );

  const togglePriorityMenu = (id: number) => {
    setOpenPriorityForId((prev) =>
      prev === id ? null : id
    );
  };

  const handleSelectPriority = (
    id: number,
    priority: MessagePriority
  ) => {
    onChangePriority(id, priority);
    setOpenPriorityForId(null);
  };

  return (
    <div className="message-list-scroll">
      {messages.map((m) => {
        const isSelectedForList =
          selectionMode && selectedSet.has(m.id);

        // <<< QUI DECIDIAMO COSA APRIRE QUANDO CLICCHI SUL NOME >>>
        // 1) Se ho il threadUrl → apro il messenger
        // 2) altrimenti, se ho il profilo → profilo LinkedIn
        // 3) altrimenti → ricerca persone per quel nome
        const linkHref =
          m.threadUrl && m.threadUrl.trim().length > 0
            ? m.threadUrl
            : m.senderProfileUrl &&
              m.senderProfileUrl.trim().length > 0
            ? m.senderProfileUrl
            : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                m.senderName
              )}`;

        return (
          <div
            key={m.id}
            className={
              'message-card' +
              (selectedMessageId === m.id
                ? ' selected'
                : '') +
              (isSelectedForList ? ' list-selected' : '')
            }
            onClick={() => {
              if (
                selectionMode &&
                onToggleSelectMessage
              ) {
                onToggleSelectMessage(m.id);
              }
              onSelectMessage(m);
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
              }}
            >
              <a
                href={linkHref}
                target="_blank"
                rel="noreferrer"
                className="message-sender"
                onClick={(e) => e.stopPropagation()}
              >
                {highlight(m.senderName, searchTerm)}
              </a>

              <div style={{ position: 'relative' }}>
                {/* Badge cliccabile PRIORITÀ */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePriorityMenu(m.id);
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.4)',
                    color: '#ffd86b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title={t('priority.changeTitle')}
                >
                  {PRIORITY_LABEL[m.priority] ??
                    m.priority}
                  <span
                    style={{ fontSize: '0.7rem' }}
                  >
                    ▾
                  </span>
                </button>

                {openPriorityForId === m.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: 4,
                      background:
                        'rgba(0,0,0,0.9)',
                      borderRadius: 8,
                      border:
                        '1px solid rgba(255,255,255,0.3)',
                      boxShadow:
                        '0 6px 12px rgba(0,0,0,0.5)',
                      fontSize: '0.78rem',
                      minWidth: 110,
                      zIndex: 10,
                    }}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <div
                        key={p}
                        onClick={() =>
                          handleSelectPriority(
                            m.id,
                            p
                          )
                        }
                        style={{
                          padding: '6px 10px',
                          cursor: 'pointer',
                          background:
                            p === m.priority
                              ? 'rgba(255,216,107,0.18)'
                              : 'transparent',
                          color: '#fff',
                        }}
                      >
                        {PRIORITY_LABEL[p]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {m.receivedAt && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: '0.75rem',
                  opacity: 0.75,
                }}
              >
                {new Date(
                  m.receivedAt
                ).toLocaleString(locale, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}

            <p style={{ margin: '8px 0' }}>
              {highlight(
                m.snippet ?? '',
                searchTerm
              )}
            </p>

            <small>
              {t('detail.source')}{' '}
              {m.source} • {t('detail.tags')}{' '}
              {m.tags?.join(', ') || '—'}
            </small>
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;
