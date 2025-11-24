// src/pages/MessagesPage.tsx
import { useEffect, useMemo, useState, useRef } from 'react';
import MessageList from '../component/MessageList';
import MessageDetail from '../component/MessageDetail';
import {
  fetchAllMessages,
  fetchMessageById,
  updateMessagePriority,
  saveCustomList,
} from '../api/messages';
import type { Message, MessagePriority } from '../types/message';
import { useI18n } from '../i18n';
import type { Lang } from '../i18n';

type FilterKey = 'all' | 'waiting_them' | 'waiting_me';
type DateFilterMode = 'all' | 'today' | 'week' | 'month' | 'custom';
type SortMode =
  | 'alpha_asc'
  | 'alpha_desc'
  | 'date_desc'
  | 'date_asc'
  | 'pri_asc'
  | 'pri_desc';

type CustomListMode =
  | { kind: 'idle' }
  | { kind: 'create'; listName: string }
  | { kind: 'edit'; listName: string };

function MessagesPage() {
  const { t, lang, setLang } = useI18n();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<Message | null>(null);

  const [activeFilter, setActiveFilter] =
    useState<FilterKey>('all');

  // filtro per periodo temporale
  const [dateFilter, setDateFilter] =
    useState<DateFilterMode>('all');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [showCustomRange, setShowCustomRange] =
    useState(false);
  const [showContacts, setShowContacts] = useState(false);

  // ordinamento lista
  const [sortMode, setSortMode] =
    useState<SortMode>('date_desc');

  // filtro lista personalizzata (tag)
  const [activeCustomList, setActiveCustomList] =
    useState<string | null>(null);

  // modalità gestione liste personalizzate
  const [listMode, setListMode] = useState<CustomListMode>({
    kind: 'idle',
  });
  const [listSelection, setListSelection] = useState<
    Set<number>
  >(new Set());

  const [isCreatingListName, setIsCreatingListName] =
    useState(false);
  const [newListName, setNewListName] = useState('');
  const newListInputRef =
    useRef<HTMLInputElement | null>(null);

  // search bar della LISTA (colonna centrale)
  const [searchTerm, setSearchTerm] = useState('');

  // indice del match corrente nella LISTA (per il bottoncino "↓")
  const [currentListHitIndex, setCurrentListHitIndex] =
    useState(-1);

  const reloadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAllMessages();
      setMessages(data);

      if (selectedMessage) {
        const updated = data.find(
          (m) => m.id === selectedMessage.id
        );
        if (updated) {
          setSelectedMessage(updated);
        } else {
          setSelectedMessage(data[0] ?? null);
        }
      } else {
        setSelectedMessage(data[0] ?? null);
      }

      const container = document.querySelector(
        '.message-list-scroll'
      ) as HTMLElement | null;
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.error(e);
      setError(t('error.loadingMessages'));
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Refresh solo del thread attualmente selezionato
  const handleRefreshCurrentThread = async () => {
    if (!selectedMessage) return;

    try {
      // carichiamo SOLO il messaggio corrente dal backend
      const updated = await fetchMessageById(selectedMessage.id);
      if (!updated) {
        console.warn('Thread non trovato durante il refresh');
        return;
      }

      // aggiorno la lista in memoria solo per quell’id (così il center rimane coerente)
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );

      // e aggiorno il dettaglio (textArea)
      setSelectedMessage(updated);
    } catch (err) {
      console.error('Errore durante il refresh del thread', err);
    }
  };


  useEffect(() => {
    if (isCreatingListName && newListInputRef.current) {
      newListInputRef.current.focus();
      newListInputRef.current.select();
    }
  }, [isCreatingListName]);

  useEffect(() => {
    void reloadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalize = (s: string | null | undefined) =>
    (s ?? '').toLowerCase();

  const availableCustomLists = useMemo(() => {
    const s = new Set<string>();
    messages.forEach((m) => {
      m.tags?.forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) s.add(trimmed);
      });
    });
    return Array.from(s).sort((a, b) =>
      a.localeCompare(b, 'it')
    );
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const parseDateOnly = (
      iso: string | null | undefined
    ) => {
      if (!iso) return null;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return null;
      return new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      );
    };

    const startOfWeek = (() => {
      const day = today.getDay();
      const diff = (day + 6) % 7; // distanza da lunedì
      const d = new Date(today);
      d.setDate(d.getDate() - diff);
      return d;
    })();

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const base = messages.filter((m) => {
      if (
        activeFilter === 'waiting_them' &&
        m.lastFromMe !== true
      )
        return false;
      if (
        activeFilter === 'waiting_me' &&
        m.lastFromMe !== false
      )
        return false;

      const msgDate = parseDateOnly(m.receivedAt ?? null);
      let includeByDate = true;

      if (dateFilter === 'today') {
        includeByDate =
          !!msgDate &&
          msgDate.getTime() === today.getTime();
      } else if (dateFilter === 'week') {
        includeByDate =
          !!msgDate &&
          msgDate >= startOfWeek &&
          msgDate <= today;
      } else if (dateFilter === 'month') {
        includeByDate =
          !!msgDate &&
          msgDate >= startOfMonth &&
          msgDate <= today;
      } else if (dateFilter === 'custom') {
        if (customFrom || customTo) {
          const from = customFrom
            ? new Date(customFrom + 'T00:00:00')
            : null;
          const to = customTo
            ? new Date(customTo + 'T23:59:59')
            : null;

          includeByDate =
            !!msgDate &&
            (!from ||
              msgDate >=
                new Date(
                  from.getFullYear(),
                  from.getMonth(),
                  from.getDate()
                )) &&
            (!to ||
              msgDate <=
                new Date(
                  to.getFullYear(),
                  to.getMonth(),
                  to.getDate()
                ));
        }
      }

      if (!includeByDate) return false;

      if (
        activeCustomList &&
        (!m.tags || !m.tags.includes(activeCustomList))
      ) {
        return false;
      }

      if (!term) return true;
      const haystack = `${normalize(
        m.senderName
      )} ${normalize(m.snippet)}`;
      return haystack.includes(term);
    });

    const getDateValue = (m: Message): number => {
      const iso = m.receivedAt ?? undefined;
      if (!iso) return 0;
      const d = new Date(iso);
      const t = d.getTime();
      return Number.isNaN(t) ? 0 : t;
    };

    const getPriorityRank = (m: Message): number => {
      switch (m.priority) {
        case 'HIGH':
          return 3;
        case 'MEDIUM':
          return 2;
        case 'LOW':
        default:
          return 1;
      }
    };

    const sorted = [...base].sort((a, b) => {
      switch (sortMode) {
        case 'alpha_asc':
          return normalize(a.senderName).localeCompare(
            normalize(b.senderName)
          );

        case 'alpha_desc':
          return normalize(b.senderName).localeCompare(
            normalize(a.senderName)
          );

        case 'date_asc':
          return getDateValue(a) - getDateValue(b);

        case 'date_desc':
          return getDateValue(b) - getDateValue(a);

        case 'pri_asc': {
          // "Priorità più alta" → HIGH prima, poi MEDIUM, poi LOW
          return getPriorityRank(b) - getPriorityRank(a);
        }

        case 'pri_desc': {
          // "Priorità più bassa" → LOW prima, poi MEDIUM, poi HIGH
          return getPriorityRank(a) - getPriorityRank(b);
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    messages,
    activeFilter,
    searchTerm,
    dateFilter,
    customFrom,
    customTo,
    sortMode,
    activeCustomList,
  ]);

  const clearListActiveMatchClass = () => {
    const container = document.querySelector(
      '.message-list-scroll'
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

  useEffect(() => {
    setCurrentListHitIndex(-1);
    clearListActiveMatchClass();
  }, [
    searchTerm,
    activeFilter,
    messages,
    dateFilter,
    customFrom,
    customTo,
    sortMode,
    activeCustomList,
  ]);

  const handleNextListMatch = () => {
    if (!searchTerm.trim()) return;

    const container = document.querySelector(
      '.message-list-scroll'
    ) as HTMLElement | null;
    if (!container) return;

    const hits =
      container.querySelectorAll<HTMLSpanElement>(
        '.highlight-match'
      );
    if (!hits.length) return;

    const nextIndex =
      (currentListHitIndex + 1) % hits.length;
    const el = hits[nextIndex];

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

    setCurrentListHitIndex(nextIndex);
  };

  const handleSetDateFilter = (mode: DateFilterMode) => {
    setDateFilter(mode);
    if (mode === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
    }
  };

  const handleClearCustomRange = () => {
    setCustomFrom('');
    setCustomTo('');
    setDateFilter('all');
    setShowCustomRange(false);
  };

  // gestione selezione messaggi per liste personalizzate
  const handleToggleSelectForList = (id: number) => {
    setListSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStartCreateList = () => {
    setIsCreatingListName(true);
    setNewListName('');
    setListMode({ kind: 'idle' });
    setListSelection(new Set());
    setActiveCustomList(null);
  };

  const handleConfirmNewListName = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;

    const mode: CustomListMode =
      availableCustomLists.includes(trimmed)
        ? { kind: 'edit', listName: trimmed }
        : { kind: 'create', listName: trimmed };

    setListMode(mode);
    setListSelection(new Set());
    setIsCreatingListName(false);
  };

  const handleEditList = (tag: string) => {
    const selectedIds = new Set(
      messages
        .filter((m) => m.tags?.includes(tag))
        .map((m) => m.id)
    );

    setListMode({ kind: 'edit', listName: tag });
    setListSelection(selectedIds);
  };

  const handleCancelListMode = () => {
    setListMode({ kind: 'idle' });
    setListSelection(new Set());
  };

  const handleConfirmCustomList = async () => {
    if (listMode.kind === 'idle' || !listMode.listName)
      return;

    const ids = Array.from(listSelection);
    try {
      await saveCustomList(listMode.listName, ids);
      await reloadMessages();
    } catch (err) {
      console.error(
        'Errore salvataggio lista personalizzata',
        err
      );
    } finally {
      setListMode({ kind: 'idle' });
      setListSelection(new Set());
    }
  };

  const handleDeleteList = async (tag: string) => {
    if (
      !window.confirm(
        t('customLists.confirmDelete', { name: tag })
      )
    )
      return;

    try {
      await saveCustomList(tag, []);
      await reloadMessages();
      if (activeCustomList === tag) {
        setActiveCustomList(null);
      }
    } catch (err) {
      console.error(
        'Errore eliminando lista personalizzata',
        err
      );
    }
  };

  // cambio priorità: update ottimistico + chiamata BE
  const handleChangePriority = async (
    messageId: number,
    newPriority: MessagePriority
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, priority: newPriority }
          : m
      )
    );

    if (
      selectedMessage &&
      selectedMessage.id === messageId
    ) {
      setSelectedMessage((prev) =>
        prev ? { ...prev, priority: newPriority } : prev
      );
    }

    try {
      await updateMessagePriority(messageId, newPriority);
    } catch (err) {
      console.error('Errore aggiornando la priorità', err);
      // eventuale rollback
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header" style={{ position: 'relative' }}>
        {/* Lingua in alto a sinistra */}
        <div className="language-selector">
          <span>{t('language.select')}</span>
          <select
            className="language-select"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
          >
            <option value="it">{t('language.it')}</option>
            <option value="en">{t('language.en')}</option>
            <option value="es">{t('language.es')}</option>
          </select>

          <button
            type="button"
            className="contacts-btn"
            onClick={() => setShowContacts(true)}
          >
            {t('header.contacts')}
          </button>
        </div>

        {/* Titolo centrale */}
        <h1
          style={{
            textAlign: 'center',
            marginBottom: 24,
            color: '#ffd86b',
            textShadow: '0 0 10px rgba(255, 216, 107, 0.4)',
          }}
        >
          Hermes – LinkedIn Message Importer
          <span style={{ fontSize: '0.6em', opacity: 0.6 }}>
            {' '}
            0.1.0
          </span>
        </h1>

        {/* Bottone Aggiorna in alto a destra (reload TUTTA lista) */}
        <button
          style={{
            position: 'absolute',
            right: 20,
            top: 20,
            padding: '4px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#ffd86b',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
          onClick={reloadMessages}
        >
          {t('header.refresh')}
        </button>
      </header>

      <div className="app-content">
        {/* SIDEBAR FILTRI */}
        <aside className="sidebar-panel">
          <div className="panel-title">
            {t('sidebar.filtersTitle')}
          </div>
          <div className="sidebar-list">
            <div
              className={
                'sidebar-item ' +
                (activeFilter === 'all' ? 'active' : '')
              }
              onClick={() => setActiveFilter('all')}
            >
              {t('sidebar.allMessages')}
            </div>
            <div
              className={
                'sidebar-item ' +
                (activeFilter === 'waiting_them' ? 'active' : '')
              }
              onClick={() =>
                setActiveFilter('waiting_them')
              }
            >
              {t('sidebar.waitingThem')}
            </div>
            <div
              className={
                'sidebar-item ' +
                (activeFilter === 'waiting_me' ? 'active' : '')
              }
              onClick={() =>
                setActiveFilter('waiting_me')
              }
            >
              {t('sidebar.waitingMe')}
            </div>
          </div>

          <div className="sidebar-section-title">
            {t('sidebar.periodTitle').toUpperCase()}
          </div>
          <div className="sidebar-list date-filter-group">
            <div
              className={
                'sidebar-item ' +
                (dateFilter === 'all' ? 'active' : '')
              }
              onClick={() => handleSetDateFilter('all')}
            >
              {t('sidebar.period.always')}
            </div>
            <div
              className={
                'sidebar-item ' +
                (dateFilter === 'today' ? 'active' : '')
              }
              onClick={() => handleSetDateFilter('today')}
            >
              {t('sidebar.period.today')}
            </div>
            <div
              className={
                'sidebar-item ' +
                (dateFilter === 'week' ? 'active' : '')
              }
              onClick={() => handleSetDateFilter('week')}
            >
              {t('sidebar.period.week')}
            </div>
            <div
              className={
                'sidebar-item ' +
                (dateFilter === 'month' ? 'active' : '')
              }
              onClick={() => handleSetDateFilter('month')}
            >
              {t('sidebar.period.month')}
            </div>
            <div
              className={
                'sidebar-item ' +
                (dateFilter === 'custom' ? 'active' : '')
              }
              onClick={() => handleSetDateFilter('custom')}
            >
              {t('sidebar.period.custom')}
            </div>
          </div>

          <div className="sidebar-section-title">
            {t('sidebar.customListsTitle').toUpperCase()}
          </div>

          <div className="custom-lists-container">
            <button
              type="button"
              className="custom-lists-add-btn"
              onClick={handleStartCreateList}
            >
              {t('sidebar.customLists.add')}
            </button>

            {isCreatingListName && (
              <div className="custom-list-new">
                <input
                  ref={newListInputRef}
                  type="text"
                  value={newListName}
                  onChange={(e) =>
                    setNewListName(e.target.value)
                  }
                  placeholder={t(
                    'sidebar.customLists.newNamePlaceholder'
                  )}
                />
                <div className="custom-list-new-actions">
                  <button
                    type="button"
                    onClick={handleConfirmNewListName}
                  >
                    {t('sidebar.customLists.ok')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIsCreatingListName(false)
                    }
                  >
                    {t('sidebar.customLists.cancel')}
                  </button>
                </div>
              </div>
            )}

            <div className="custom-lists-scroll">
              {availableCustomLists.map((tag) => (
                <div key={tag} className="custom-list-row">
                  <button
                    type="button"
                    className={
                      'custom-list-pill' +
                      (activeCustomList === tag
                        ? ' active'
                        : '')
                    }
                    onClick={() =>
                      setActiveCustomList((prev) =>
                        prev === tag ? null : tag
                      )
                    }
                  >
                    {tag}
                  </button>
                  <button
                    type="button"
                    className="custom-list-icon-btn"
                    onClick={() => handleEditList(tag)}
                    title="Modifica"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="custom-list-icon-btn"
                    onClick={() => handleDeleteList(tag)}
                    title="Elimina"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* LISTA MESSAGGI */}
        <main className="message-area">
          {listMode.kind !== 'idle' && (
            <div className="custom-list-banner">
              <span>
                {listMode.kind === 'create'
                  ? t('customLists.bannerCreate', {
                      name: listMode.listName,
                    })
                  : t('customLists.bannerEdit', {
                      name: listMode.listName,
                    })}
              </span>
              <button
                type="button"
                className="custom-list-banner-close"
                onClick={handleCancelListMode}
                title={t('customLists.exitListModeTitle')}
              >
                ✕
              </button>
            </div>
          )}

          {showCustomRange && (
            <div className="date-range-bar">
              <span style={{ opacity: 0.8 }}>
                {t('dateRange.label')}
              </span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) =>
                  setCustomFrom(e.target.value)
                }
              />
              <span>→</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) =>
                  setCustomTo(e.target.value)
                }
              />
              <button
                type="button"
                className="date-range-clear"
                onClick={handleClearCustomRange}
                title={t('dateRange.exitTitle')}
              >
                ✕
              </button>
            </div>
          )}

          <div className="sort-bar">
            <span style={{ opacity: 0.85 }}>
              {t('sort.label')}
            </span>
            <select
              className="sort-select"
              value={sortMode}
              onChange={(e) =>
                setSortMode(e.target.value as SortMode)
              }
            >
              <option value="alpha_asc">
                {t('sort.alphaAsc')}
              </option>
              <option value="alpha_desc">
                {t('sort.alphaDesc')}
              </option>
              <option value="date_desc">
                {t('sort.dateDesc')}
              </option>
              <option value="date_asc">
                {t('sort.dateAsc')}
              </option>
              <option value="pri_asc">
                {t('sort.priAsc')}
              </option>
              <option value="pri_desc">
                {t('sort.priDesc')}
              </option>
            </select>
          </div>

          <div
            className="message-search"
            style={{
              marginBottom: 10,
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
              placeholder={t('list.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            <button
              type="button"
              className="thread-search-next"
              onClick={handleNextListMatch}
              disabled={!searchTerm.trim()}
              title={t('list.searchNextTitle')}
            >
              ↓
            </button>
          </div>

          {loading && <p>{t('loading.messages')}</p>}
          {error && (
            <p style={{ color: 'salmon' }}>{error}</p>
          )}
          {!loading &&
            !error &&
            filteredMessages.length === 0 && (
              <p>
                {searchTerm.trim()
                  ? t('empty.noMessagesForTerm', {
                      term: searchTerm,
                    })
                  : t('empty.noMessages')}
              </p>
            )}
          {!loading &&
            !error &&
            filteredMessages.length > 0 && (
              <>
                <MessageList
                  messages={filteredMessages}
                  selectedMessageId={
                    selectedMessage
                      ? selectedMessage.id
                      : null
                  }
                  onSelectMessage={(m) =>
                    setSelectedMessage(m)
                  }
                  searchTerm={searchTerm}
                  onChangePriority={handleChangePriority}
                  selectionMode={listMode.kind !== 'idle'}
                  selectedIds={Array.from(listSelection)}
                  onToggleSelectMessage={
                    handleToggleSelectForList
                  }
                />
                {listMode.kind !== 'idle' && (
                  <button
                    type="button"
                    className="custom-list-confirm-btn"
                    onClick={handleConfirmCustomList}
                    disabled={listSelection.size === 0}
                  >
                    {t('customLists.saveList', {
                      count: listSelection.size,
                    })}
                  </button>
                )}
              </>
            )}
        </main>

        {/* DETTAGLIO THREAD */}
        <section className="detail-panel">
          <div className="panel-title">
            {t('detail.title')}
          </div>
          <MessageDetail
            message={selectedMessage}
            onRefreshThread={handleRefreshCurrentThread}
          />
        </section>
      </div>

      {/* MODALE CONTATTI */}
      {showContacts && (
        <div
          className="modal-overlay"
          onClick={() => setShowContacts(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowContacts(false)}
            >
              ✕
            </button>

            <h3 className="modal-title">Stefano Paolucci</h3>

            <div className="modal-item">
              <span className="modal-label">Whatsapp:</span>
              <a
                className="modal-link"
                href="https://wa.me/393291315594"
                target="_blank"
                rel="noreferrer"
              >
                +39 329 131 5594 💬
              </a>
            </div>

            <div className="modal-item">
              <span className="modal-label">LinkedIn:</span>
              <a
                className="modal-link"
                href="https://www.linkedin.com/in/-stefanopaolucci-/"
                target="_blank"
                rel="noreferrer"
              >
                Profilo in 🔗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
