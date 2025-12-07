# Exam #1: "CMSmall" FINAL VOTE 30
## Student: s312192 HUGONIN ALBERTO

## React Client Application Routes

- Route `/`: root principale del front-office
- Route `/back-office`: pagina solo per i loggati
- Route `/back-office/add`: per creazione pagina

## API Server

- GET `/api/sessions/current`
  - Riceve: richiesta autenticata
  - Risponde: oggetto composto da id,nome, ruolo e email dell'utente loggato
- GET `/api/users`
  - Riceve: richiesta autenticata
  - Risponde:  lista di oggetti contenenti: nome e id di ciascun utente
  - Controlli: deve essere un admin
- GET `/api/sitename`
  - Riceve: richiesta anche non autenticata
  - Risponde:  nome del sito sottoforma di stringa
- GET `/api/images`
  - Riceve: richiesta anche non autenticata
  - Risponde: lista delle immagini pubblicamente accessibili sul server
- GET `/api/pages/`
  - Riceve: richiesta anche non autenticata
  - Risponde: lista di pagine senza contenuti già pubblicate se utente non loggato o tutte le pagine se l'utente è loggato
- GET `/api/pages/:id`
  - Riceve: richiesta anche non autenticata con parametro id
  - Risponde: pagina corrispondente con contenuto
  - Controlli: se la pagina non è stata pubblicata la fornisce solo se l'utente è loggato
- POST `/api/session`
  - Riceve: richiesta di autenticazione
  - Risponde: se l'autenticazione è avvenuta con successo con le informazioni della sessione (id,nome,email,ruolo) se no errore
- POST `/api/pages`
  - Riceve: richiesta autenticata contenente oggetto pagina
  - Risponde: id della pagina appena creata 
  - Controlli: Nella pagina può essere specificato il proprietario ma prima di usarlo si va a controllare che sia lo stesso da cui è arrivata la richiesta oppure che sia un amministratore per ragioni di sicurezza
- DELETE `/api/pages/:id`
  - Riceve: richiesta autenticata con parametro
  - Risponde: id della pagina appena cancellata
  - Controlli: La cancellazione avviene se è richiesta da un amministratore o se l'autore della pagina è l'utente loggato
- DELETE `/api/sessions/current`
  - Riceve: richiesta autenticata di logout
  - Risponde: conferma se logout ok
- PUT  `/api/pages/:id`
  - Riceve: richiesta autenticata con parametro id e oggetto pagina
  - Risponde: id della pagina modificata
  - Controlli: Nel body della richiesta può essere specificato il proprietario ma prima di usarlo si va a controllare che sia lo stesso da cui è arrivata la richiesta oppure che sia un amministratore per ragioni di sicurezza
- PUT `/api/sitename`
  - Riceve: richiesta autenticata da parte di amministratore con stringa nome sito
  - Risponde: con il nome del sito dopo la modifica



## Database Tables

- Table `users` - contiene id utente, email, nome, sale, password e ruolo (0 amministratore e 1 utente normale)
- Table `pages` - contiene id pagina, titolo, author id (chiave esterna collegata a id di utenti), data creazione, data pubblicazione
- Table `contents` - contiene id contenuto, pageId (id pagina chiave esterna), type per il tipo di contenuto,text,image 


## Main React Components
- `MainRoute` (in `MainRoute.jsx`): è il componente principale che si occupa della visualizzazione sia del front-office che back-office e unisce NavBar, PageCreator, PagesBar
- `NavBar` (in `NavBar.jsx`): è la barra di navigazione in alto e si occupa di gestire l'accesso alla funzionalità di login, creazione pagina e bottoni di spostamento. Contiene il componente `LoginMenu` (in `LoginMenu.jsx`) sottoforma di menu a scomparsa che si occupa di fornire un interfaccia di autenticazione 
- `PageCreator` (in `PageCreator.jsx`): è il componente principale che si occupa della visualizzazione, editing e creazione della pagina. Riceve le informazioni sulla pagina dal MainRoute e le utilizza per i suoi scopi agendo in maniera diretta sulle API. Contiene ContentsManager e ContentsCreator
- `ContentsManager` (in `ContentsManager.jsx`): è il componente che si occupa della gestione dei contenuti (modifica,creazione e ordinamento) appoggiandosi su ContentsCreator  (in `ContentsCreator.jsx`) per la gestione del singolo contenuto
- `PagesBar` (in `PagesBar.jsx`): componente che si occupa di visualizzare le pagine come lista di contenuti, e mettendo in comunicazione il MainRoute e PageCreator permette di modificare la pagina selezionata o cancellarla direttamente

## Screenshot

![Screenshot](./IMG/ListaPagine.png)
![Screenshot](./IMG/PageCreate.png)

## Users Credentials

- stefano@test.com, pwd, Utente
- alberto@test.com, pwd, Admin 
- anna@test.com, pwd, Utente
- daniela@test.com, pwd, Utente
- davide@test.com, pwd, Utente