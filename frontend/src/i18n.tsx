import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { ReactNode } from 'react';

export type Lang = 'it' | 'en' | 'es';

type Values = Record<string, string | number>;

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, values?: Values) => string;
};

const DICT: Record<Lang, Record<string, string>> = {
  it: {
    // lingua
    'language.select': 'Lingua:',
    'language.it': 'Italiano',
    'language.en': 'Inglese',
    'language.es': 'Spagnolo',

    // header
    'header.refresh': 'Aggiorna 🔄',

    // sidebar filtri
    'sidebar.filtersTitle': 'Filtri su lista',
    'sidebar.allMessages': 'Tutti i messaggi',
    'sidebar.waitingThem': 'Aspetto risposta',
    'sidebar.waitingMe': 'Da rispondere',

    // periodo
    'sidebar.periodTitle': 'Periodo',
    'sidebar.period.always': 'Sempre',
    'sidebar.period.today': 'Oggi',
    'sidebar.period.week': 'Questa settimana',
    'sidebar.period.month': 'Questo mese',
    'sidebar.period.custom': 'Imposta periodo…',

    // liste personalizzate
    'sidebar.customListsTitle': 'Liste personalizzate',
    'sidebar.customLists.add': '+ Aggiungi nuova lista',
    'sidebar.customLists.newNamePlaceholder': 'Nome nuova lista…',
    'sidebar.customLists.ok': 'OK',
    'sidebar.customLists.cancel': '✕',
    'customLists.confirmDelete': 'Eliminare la lista "{name}"?',
    'customLists.bannerCreate':
      'Aggiungi elementi alla nuova lista "{name}"',
    'customLists.bannerEdit':
      'Modifica elementi della lista "{name}"',
    'customLists.exitListModeTitle': 'Esci dalla modalità lista',
    'customLists.saveList': 'Salva lista ({count} elementi)',

    // filtro periodo barra
    'dateRange.label': 'Periodo:',
    'dateRange.exitTitle': 'Esci dal filtro per periodo',

    // sort
    'sort.label': 'Ordina per:',
    'sort.alphaAsc': 'Nome A → Z',
    'sort.alphaDesc': 'Nome Z → A',
    'sort.dateDesc': 'Dal più recente',
    'sort.dateAsc': 'Dal più vecchio',
    'sort.priAsc': 'Priorità più alta',
    'sort.priDesc': 'Priorità più bassa',

    // lista: search & stati
    'list.searchPlaceholder': 'Cerca per nome o testo…',
    'list.searchNextTitle':
      'Vai al prossimo risultato nella lista',
    'loading.messages': 'Caricamento messaggi…',
    'error.loadingMessages':
      'Errore nel caricamento dei messaggi.',
    'empty.noMessages': 'Nessun messaggio trovato.',
    'empty.noMessagesForTerm':
      'Nessun messaggio trovato per “{term}”.',

    // dettaglio
    'detail.title': 'Dettaglio conversazione',
    'detail.empty':
      'Seleziona una conversazione dalla lista per vedere il thread completo.',
    'detail.openOnLinkedin': 'Apri su LinkedIn',
    'detail.priority': 'Priorità:',
    'detail.source': 'Risorsa:',
    'detail.tags': 'Tags:',
    'detail.searchPlaceholder': 'Cerca nel thread…',
    'detail.searchNextTitle': 'Vai al prossimo risultato',
    'detail.noThread':
      'Nessun thread importato. Usa il comando "Importa thread" dell’estensione per salvare il botta-e-risposta completo.',

    // priorità
    'priority.changeTitle': 'Cambia priorità',
    'priority.low': 'BASSA',
    'priority.medium': 'MEDIA',
    'priority.high': 'ALTA',
    'header.contacts': 'Contatti',
    'detail.refreshThread': 'Aggiorna',
  },

  en: {
    'language.select': 'Language:',
    'language.it': 'Italian',
    'language.en': 'English',
    'language.es': 'Spanish',

    'header.refresh': 'Refresh 🔄',

    'sidebar.filtersTitle': 'List filters',
    'sidebar.allMessages': 'All messages',
    'sidebar.waitingThem': 'Waiting for reply',
    'sidebar.waitingMe': 'To reply',

    'sidebar.periodTitle': 'Period',
    'sidebar.period.always': 'Always',
    'sidebar.period.today': 'Today',
    'sidebar.period.week': 'This week',
    'sidebar.period.month': 'This month',
    'sidebar.period.custom': 'Custom period…',

    'sidebar.customListsTitle': 'Custom lists',
    'sidebar.customLists.add': '+ Add new list',
    'sidebar.customLists.newNamePlaceholder': 'New list name…',
    'sidebar.customLists.ok': 'OK',
    'sidebar.customLists.cancel': '✕',
    'customLists.confirmDelete': 'Delete list "{name}"?',
    'customLists.bannerCreate':
      'Add items to new list "{name}"',
    'customLists.bannerEdit':
      'Edit items of list "{name}"',
    'customLists.exitListModeTitle': 'Exit list mode',
    'customLists.saveList': 'Save list ({count} items)',

    'dateRange.label': 'Period:',
    'dateRange.exitTitle': 'Clear period filter',

    'sort.label': 'Sort by:',
    'sort.alphaAsc': 'Name A → Z',
    'sort.alphaDesc': 'Name Z → A',
    'sort.dateDesc': 'Newest first',
    'sort.dateAsc': 'Oldest first',
    'sort.priAsc': 'Highest priority',
    'sort.priDesc': 'Lowest priority',

    'list.searchPlaceholder': 'Search by name or text…',
    'list.searchNextTitle':
      'Jump to next match in list',
    'loading.messages': 'Loading messages…',
    'error.loadingMessages':
      'Error while loading messages.',
    'empty.noMessages': 'No messages found.',
    'empty.noMessagesForTerm':
      'No messages found for “{term}”.',

    'detail.title': 'Conversation details',
    'detail.empty':
      'Select a conversation from the list to see the full thread.',
    'detail.openOnLinkedin': 'Open on LinkedIn',
    'detail.priority': 'Priority:',
    'detail.source': 'Source:',
    'detail.tags': 'Tags:',
    'detail.searchPlaceholder': 'Search in thread…',
    'detail.searchNextTitle': 'Jump to next match',
    'detail.noThread':
      'No thread imported. Use the extension “Import thread” command to save the full back-and-forth.',

    'priority.changeTitle': 'Change priority',
    'priority.low': 'LOW',
    'priority.medium': 'MEDIUM',
    'priority.high': 'HIGH',
    'header.contacts': 'Contacts',
    'detail.refreshThread': 'Refresh',
  },

  es: {
    'language.select': 'Idioma:',
    'language.it': 'Italiano',
    'language.en': 'Inglés',
    'language.es': 'Español',

    'header.refresh': 'Actualizar 🔄',

    'sidebar.filtersTitle': 'Filtros de lista',
    'sidebar.allMessages': 'Todos los mensajes',
    'sidebar.waitingThem': 'Espero respuesta',
    'sidebar.waitingMe': 'Por responder',

    'sidebar.periodTitle': 'Periodo',
    'sidebar.period.always': 'Siempre',
    'sidebar.period.today': 'Hoy',
    'sidebar.period.week': 'Esta semana',
    'sidebar.period.month': 'Este mes',
    'sidebar.period.custom': 'Definir periodo…',

    'sidebar.customListsTitle': 'Listas personalizadas',
    'sidebar.customLists.add': '+ Añadir nueva lista',
    'sidebar.customLists.newNamePlaceholder':
      'Nombre de la nueva lista…',
    'sidebar.customLists.ok': 'OK',
    'sidebar.customLists.cancel': '✕',
    'customLists.confirmDelete':
      '¿Eliminar la lista "{name}"?',
    'customLists.bannerCreate':
      'Añade elementos a la nueva lista "{name}"',
    'customLists.bannerEdit':
      'Edita los elementos de la lista "{name}"',
    'customLists.exitListModeTitle': 'Salir del modo lista',
    'customLists.saveList': 'Guardar lista ({count} elementos)',

    'dateRange.label': 'Periodo:',
    'dateRange.exitTitle': 'Quitar filtro de periodo',

    'sort.label': 'Ordenar por:',
    'sort.alphaAsc': 'Nombre A → Z',
    'sort.alphaDesc': 'Nombre Z → A',
    'sort.dateDesc': 'Más recientes primero',
    'sort.dateAsc': 'Más antiguos primero',
    'sort.priAsc': 'Prioridad más alta',
    'sort.priDesc': 'Prioridad más baja',

    'list.searchPlaceholder': 'Buscar por nombre o texto…',
    'list.searchNextTitle':
      'Saltar a la siguiente coincidencia',
    'loading.messages': 'Cargando mensajes…',
    'error.loadingMessages':
      'Error al cargar los mensajes.',
    'empty.noMessages': 'No se encontraron mensajes.',
    'empty.noMessagesForTerm':
      'No se encontraron mensajes para “{term}”.',

    'detail.title': 'Detalle de la conversación',
    'detail.empty':
      'Selecciona una conversación de la lista para ver el hilo completo.',
    'detail.openOnLinkedin': 'Abrir en LinkedIn',
    'detail.priority': 'Prioridad:',
    'detail.source': 'Recurso:',
    'detail.tags': 'Tags:',
    'detail.searchPlaceholder': 'Buscar en el hilo…',
    'detail.searchNextTitle': 'Saltar a la siguiente coincidencia',
    'detail.noThread':
      'No se ha importado el hilo. Usa el comando "Importar hilo" de la extensión para guardar toda la conversación.',

    'priority.changeTitle': 'Cambiar prioridad',
    'priority.low': 'BAJA',
    'priority.medium': 'MEDIA',
    'priority.high': 'ALTA',
    'header.contacts': 'Contactos',
    'detail.refreshThread': 'Actualizar',
  },
};

const I18nContext = createContext<I18nContextValue | undefined>(
  undefined
);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('it');

  const t = useMemo(
    () =>
      (key: string, values?: Values) => {
        let text = DICT[lang][key] ?? key;
        if (values) {
          for (const [k, v] of Object.entries(values)) {
            text = text.replace(
              new RegExp(`{${k}}`, 'g'),
              String(v)
            );
          }
        }
        return text;
      },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
}
