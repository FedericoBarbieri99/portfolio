import type { Content } from './types.ts';

const it: Content = {
  lang: 'it',
  dir: '/it/',
  other: { code: 'en', href: '/', label: 'English' },
  meta: {
    title: 'Federico Barbieri',
    description:
      'Fullstack developer a Brescia. Piattaforme web, mobile e cloud a tutto tondo: Java e Spring, Vaadin, Flutter, React Native, TypeScript, Firebase.',
  },
  ui: {
    skip: 'Vai ai progetti',
    navLabel: 'Sezioni',
    exploreWork: 'Esplora i progetti',
    navWork: 'Progetti',
    navSkills: 'Competenze',
    navExperience: 'Esperienza',
    navAbout: 'Chi sono',
    navContact: 'Contatti',
    modeFront: 'front',
    modeBackstage: 'backstage',
    toggleLabel: 'Mostra il backstage di questa pagina',
    toggleHint: 'Gira la pagina per vedere cosa la fa funzionare',
    workHeading: 'Progetti scelti',
    alsoHeading: 'E poi',
    problem: 'Il problema',
    did: 'Cosa ho fatto',
    under: 'Sotto il cofano',
    skillsHeading: 'Competenze',
    skillsNote: 'In ordine di tempo di lavoro che occupano. Gira la pagina per le prove.',
    expHeading: 'Esperienza',
    eduHeading: 'Formazione',
    aboutHeading: 'Chi sono',
    contactHeading: 'Contatti',
    present: 'oggi',
    footer: 'Niente cookie, niente tracciamento.',
    tlPanel: 'Timeline in esecuzione',
    hudScroll: 'scroll',
    hudLog: 'ultimi eventi',
    rlMascot: 'mascotte',
    rlH2: 'h2 · wdth 75 · clamp(40px, 6vw, 80px)',
    rlSection: 'padding clamp(72px, 11vh, 150px)',
    rlName: 'h1 · Bricolage Grotesque · wdth 75 · opsz 96',
    rlSize: 'clamp(88px, 14vw, 220px)',
    rlGutter: 'gutter clamp(20px, 4vw, 64px)',
    rlMeasure: 'misura ≤ 60ch',
    rlMode: 'data-mode="backstage"',
    rlRoute: 'route /it/',
    rlStack: 'vite · typescript · tailwind 4 · animejs 4.5',
  },
  hero: {
    first: 'Federico',
    last: 'Barbieri',
    role: 'Fullstack developer',
    place: 'Brescia',
    intro:
      'Prendere un’idea e renderla qualcosa di vero è la parte che mi ha sempre attratto della programmazione. Seguo piattaforme web, mobile e cloud a tutto tondo: quello che l’utente vede e quello che le fa funzionare.',
  },
  groups: [
    {
      id: 'current',
      org: 'Ruolo attuale',
      period: '2025 - oggi',
      works: [
        {
          id: 'platform',
          title: 'Ecosistema di piattaforme',
          years: '2025-2026',
          tags: ['Java', 'Spring Boot', 'Vaadin', 'OIDC', 'MySQL'],
          summary:
            'Una suite di prodotti per un’azienda della formazione professionale, interni e rivolti ai clienti, con una sola identità: un gestionale per il core business, un authorization server centrale, un marketplace, ticketing e timesheet. Progetto l’architettura e scrivo gran parte del codice.',
          problem:
            'L’azienda gestiva il proprio lavoro su strumenti separati con login separati. Ogni nuovo prodotto voleva dire un altro database utenti e un’altra password, e nessuno strumento parlava con gli altri.',
          did: 'Ho progettato e costruito i prodotti come un unico ecosistema con una sola identità. Il gestionale è il più grande: modella l’operatività quotidiana dell’azienda da capo a fondo, dalla pianificazione alla rendicontazione, e integra i servizi esterni su cui il business già si appoggia. Un authorization server separato gestisce il login di tutto ed emette token OIDC che portano solo l’identità, mentre ogni prodotto tiene i propri ruoli e decide chi entra. Il marketplace vende con checkout Stripe; ticketing e timesheet girano sullo stesso stack e sullo stesso login. Le decisioni sono scritte come ADR prima di andare in produzione.',
          under:
            'Spring Boot 4 su Java 25, Vaadin 25 con viste Flow e React, Spring Security, Spring Authorization Server (Authorization Code flow, gate di accesso per prodotto sull’endpoint authorize), JPA con Flyway su MySQL (78 migrazioni solo sul gestionale), checkout Stripe embedded. I rilasci sono tag git: GitHub Actions su runner self-hosted costruisce l’immagine, la pubblica su GHCR e ridistribuisce con docker compose. Circa 1.000 commit su cinque repository, primo committer in ognuno.',
          chain: ['Vaadin 25', 'Spring Boot · Java 25', 'Authorization Server · OIDC', 'JPA · Flyway', 'MySQL'],
        },
      ],
      also: [
        'Uno scraper Playwright in Java, porting di un prototipo Python, che alimenta un database MySQL.',
        'Un client desktop Electron per strumenti interni.',
        'Script Python che validano dati Excel e PDF per il processo di conformità di un cliente enterprise.',
        'Un sito aziendale in Next.js.',
      ],
      alsoTags: 'scraper, Electron, Python, sito',
    },
    {
      id: 'previous',
      org: 'Ruolo precedente',
      period: '2022 - 2025',
      works: [
        {
          id: 'pm',
          title: 'Piattaforma di project management',
          years: '2022-2024',
          tags: ['Flutter', 'Next.js', 'Firebase', 'TypeScript'],
          summary:
            'Una piattaforma di project management: app mobile, web app con gantt e timeline, automazioni sui task e integrazione Microsoft 365. Ero lo sviluppatore principale su entrambi i client.',
          problem:
            'I team avevano bisogno di un posto solo per pianificare il lavoro da telefono e desktop, con le viste di pianificazione che fogli di calcolo e chat non potevano dare.',
          did: 'Ho costruito l’app Flutter con state management BLoC e la web app Next.js: gantt e timeline, automazioni sui task, editor rich-text, export PDF, accesso e calendario tramite Microsoft 365. La logica server gira come Firebase Cloud Functions.',
          under:
            'Flutter con flutter_bloc e dio, Next.js con React, TipTap, react-pdf, MSAL e Microsoft Graph, Firebase Auth, Firestore e Cloud Functions su Node. Circa 42.000 righe di Dart e 39.000 di TypeScript, oltre 1.000 commit come autore principale.',
          chain: ['Flutter', 'Next.js', 'Cloud Functions', 'Firestore', 'Microsoft Graph'],
        },
      ],
      also: [
        'Un’app social geolocalizzata per un cliente sotto NDA: Expo e Firebase, ricerca di prossimità con geohash, clustering su mappa, chat vincolata all’abbonamento. Circa 26.000 righe, 53 commit miei.',
        'Un sito aziendale in Next.js.',
      ],
      alsoTags: 'app NDA, sito',
    },
    {
      id: 'personal',
      org: 'Personali',
      period: '2024 - 2026',
      works: [
        {
          id: 'viaggi',
          title: 'App Viaggi',
          years: '2025-2026',
          tags: ['Expo', 'React Native', 'Firebase', 'TypeScript'],
          summary:
            'Un’app nativa per organizzare viaggi di gruppo: votare la destinazione, proporre alloggi, costruire l’itinerario su mappa e calendario, dividere le spese, chattare. Costruita due volte, apposta.',
          problem:
            'I viaggi di gruppo muoiono nelle chat: nessuno decide la destinazione, le spese si perdono, il piano vive nella testa di uno solo. La prima versione, fatta in sei nel 2025, funzionava, e ci ha insegnato cosa serviva davvero.',
          did: 'Ero primo committer della v1 (Angular, Ionic, Express, Prisma su Postgres). Poi ho scritto un piano tecnico e l’ho ricostruita da solo nel 2026 su Expo: voto della destinazione, spese con conguaglio automatico, itinerario su mappa e calendario, chat realtime, notifiche push. Stavolta le security rules di Firestore sono testate sull’emulatore e le decisioni di design vivono accanto al codice.',
          under:
            'Expo SDK 56 con expo-router e NativeWind, Zustand, react-hook-form e Zod, i18next in italiano e inglese, react-native-maps. Cloud Functions v2 su Node 20 per voti, spese, inviti e notifiche. Rules Firestore testate con l’emulatore, unit test sulla divisione spese. Circa 12.900 righe di TypeScript.',
          chain: ['Expo 56 · expo-router', 'Cloud Functions v2', 'Firestore · rules testate', 'Firebase europe-west1'],
        },
        {
          id: 'traq',
          title: 'Traq',
          years: '2024',
          tags: ['Expo', 'Spotify API', 'Python'],
          summary:
            'Un gioco musicale con carte stampate: inquadri il QR, parte la traccia su Spotify, indovini titolo e artista prima degli altri.',
          problem:
            'I quiz musicali hanno bisogno di un conduttore con una playlist. Volevo una scatola di carte che facesse girare il gioco da sola, a un tavolo, con i telefoni che la gente ha già.',
          did: 'Ho costruito l’app in React Native con Expo: scansione con la fotocamera, riproduzione Spotify, punteggi in singolo e multiplayer. Uno script Python costruisce la lista dei brani da Spotify e genera le carte stampabili, dipingendo un gradiente radiale dentro ogni QR perché il mazzo sembri un mazzo e non un foglio di codici a barre.',
          under:
            'Expo SDK 51, expo-camera e lettura barcode, Zustand, NativeWind, Spotify Web API. Generatore di carte in Python con qrcode e Pillow. Codebase piccola, prodotto intero: carte stampate, fotocamera, API di streaming.',
          chain: ['Expo 51 · camera', 'Spotify Web API', 'Python · qrcode · Pillow'],
        },
      ],
      also: [],
      alsoTags: '',
    },
  ],
  skills: [
    {
      group: 'Linguaggi',
      items: ['Java', 'TypeScript', 'Dart', 'Python', 'SQL'],
      proof: ['Java, ecosistema di piattaforme, scraper', 'TypeScript, web app, App Viaggi, Traq', 'Dart, app mobile', 'Python, carte di Traq, script', 'SQL, migrazioni Flyway'],
    },
    {
      group: 'Backend',
      items: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'MySQL', 'Node.js', 'Express', 'FastAPI'],
      proof: ['ecosistema di piattaforme, ~1.000 commit', 'single sign-on OIDC in produzione', 'Cloud Functions su Node, due prodotti'],
    },
    {
      group: 'Frontend',
      items: ['Vaadin', 'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind'],
      proof: ['Vaadin 25, viste Flow e React', 'una web app, 39.000 righe di TypeScript', 'due siti aziendali in Next.js'],
    },
    {
      group: 'Mobile',
      items: ['Flutter', 'React Native', 'Expo'],
      proof: ['un’app mobile, 42.000 righe di Dart', 'App Viaggi, Expo 56', 'Traq, Expo 51'],
    },
    {
      group: 'Cloud',
      items: ['Firebase', 'Cloud Functions', 'Firestore', 'Docker', 'Traefik', 'GitHub Actions', 'Google Cloud'],
      proof: ['rules Firestore testate sull’emulatore', 'immagini su GHCR, deploy con docker compose'],
    },
    {
      group: 'E poi',
      items: ['Python', 'Postgres', 'Stripe', 'Playwright', 'Electron'],
      proof: ['App Viaggi v1, Express su Postgres', 'scraper Java su Playwright', 'checkout Stripe embedded'],
    },
  ],
  experience: [
    {
      org: 'Azienda della formazione professionale',
      role: 'Fullstack developer',
      from: 'marzo 2025',
      to: 'oggi',
      text: 'Progetto e sviluppo piattaforme fullstack per uso interno ed esterno, dalla prima bozza al go-live. Prendo le decisioni su architettura e stack, integro prodotti esterni e ho costruito il single sign-on centralizzato dell’intero ecosistema applicativo.',
    },
    {
      org: 'Software house',
      role: 'Fullstack developer',
      from: 'novembre 2022',
      to: 'marzo 2025',
      text: 'Piattaforme web e mobile: architettura software, infrastruttura cloud e intero ciclo di sviluppo. Autore principale di entrambi i client di un prodotto di project management.',
    },
    {
      org: 'Agenzia digitale',
      role: 'Sviluppatore web',
      from: 'maggio 2022',
      to: 'ottobre 2022',
      text: 'Backend di un e-commerce personalizzato su WooCommerce, una mappa interattiva con Google Maps API e script di automazione per i processi interni. Primo approccio a Web3 e smart contract.',
    },
    {
      org: 'Servizi IT per il settore bancario',
      role: 'Analista di sistemi informatici',
      from: 'gennaio 2020',
      to: 'agosto 2021',
      text: 'Application management per istituti bancari: esecuzione e monitoraggio di elaborazioni, analisi dei log e risoluzione errori su ambienti Windows, Linux e Host, SQL per la gestione dei database.',
    },
  ],
  education: [
    {
      school: 'Digital Universitas',
      what: 'Percorso full-time sulle competenze digitali, con borse di studio offerte da aziende e imprenditori',
      years: '2021-2022',
    },
    {
      school: 'Istituto Industriale Statale Benedetto Castelli, Brescia',
      what: 'Diploma di perito informatico, livello 4 EQF',
      years: '2018',
    },
  ],
  about: {
    paragraphs: [
      'Sono Federico, fullstack developer di Brescia. Scrivo software per lavoro dal 2020 e costruisco piattaforme a tutto tondo dal 2022: backend, frontend, mobile e il cloud sotto.',
      'Quello che mi piace è il giro completo: capire cosa deve fare un prodotto, scegliere uno stack che ci stia, scriverlo, portarlo online e tenerlo onesto con documentazione e test. Scrivo le decisioni prima di scrivere il codice.',
      'Fuori dal lavoro costruisco le cose che vorrei esistessero: un pianificatore di viaggi per gruppi di amici, un [[gioco musicale su carte stampate]].',
    ],
    languages: 'Italiano, madrelingua. Inglese, B2/C1.',
  },
  contact: {
    email: 'federico.barbieri99@gmail.com',
    linkedin: 'https://www.linkedin.com/in/federico-barbieri-6b6944225/',
    cta: 'Scrivimi una email',
    note: 'Vuoi più dettagli, o il mio CV? Basta chiedere: l’email è [[il modo più veloce per raggiungermi]].',
  },
};

export default it;
