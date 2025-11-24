# Hermes – LinkedIn Message Importer

Hermes è un’estensione Chrome + app desktop che ti aiuta a **gestire e organizzare le conversazioni LinkedIn** in modo più efficiente.

Pensata per recruiter, freelancer e power user che hanno decine/centinaia di chat aperte e non vogliono perdere messaggi importanti.

---

##  Cosa fa

-  **Import dei messaggi**
  - Importa la sidebar delle conversazioni LinkedIn
  - Importa il thread della conversazione corrente
  - Salva le informazioni in locale per consultarle anche fuori da LinkedIn

-  **Organizzazione e filtri**
  - Filtri per priorità (es. HIGH, MEDIUM, LOW)
  - Tag personalizzati per classificare contatti e opportunità
  - Ricerca veloce sui messaggi importati

-  **Smart reply**
  - Suggerimenti di risposta (interessato / declina gentilmente / chiedi più info)
  - Template multilingua (IT / EN / ES)
  - Copia rapida sul clipboard, senza invio automatico

-  **Privacy**
  - Nessun dato inviato a server esterni
  - Tutto salvato in locale sul dispositivo dell’utente
  - Nessuna automazione di azioni su LinkedIn (no auto-scroll, no auto-click, no bot)

---

##  Tech stack

**Backend**
- Java 21
- Spring Boot
- Spring Data JPA (+ Specifications)
- REST API
- Maven

**Frontend desktop / web**
- React
- TypeScript
- Custom CSS

**Estensione Chrome**
- Manifest v3
- `scripting`, `tabs`, `activeTab`, `clipboardWrite`
- Content script su `https://www.linkedin.com/*`

**Altro**
- Local storage per i dati utente
- i18n (italiano / inglese / spagnolo)
- Packaging per distribuzione locale

---

##  Perché esiste Hermes

Il problema: LinkedIn non è pensato per chi gestisce **tante conversazioni in parallelo** (recruiter, consulenti, job seeker attivi).

Hermes aiuta a:
- capire a colpo d’occhio **chi è in attesa di risposta**
- non perdere opportunità interessanti in mezzo al rumore
- rispondere più velocemente con template personalizzati
- avere una vista più “da CRM” sulle chat di LinkedIn

---

##  Stato del progetto

-  MVP funzionante
-  Estensione caricata sul Chrome Web Store (in fase di revisione)
-  Privacy Policy e permessi conformi alle linee guida Google
-  Roadmap:
  - esportazione dei dati in CSV/JSON
  - viste avanzate (es. “chat non lette”, “in attesa”, “priorità alta”)
  - integrazione con versioni future dell’app desktop

---

##  Autore

Sviluppato da **Stefano Paolucci** – Java / Spring / Full-Stack Developer.

- LinkedIn: https://www.linkedin.com/in/-stefanopaolucci-/
- Email: Stefano.paolucci91@gmail.com
