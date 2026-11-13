import type { Content } from './types.ts';

const it: Content = {
  lang: 'it',
  dir: '/it/',
  other: { code: 'en', href: '/', label: 'English' },
  meta: {
    title: 'Federico Barbieri',
    description:
      'Fullstack developer a Brescia. Costruisco piattaforme web, mobile e cloud a tutto tondo: Java e Spring, Vaadin, Flutter, React Native, TypeScript, Firebase.',
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
    skillsNote: 'In ordine di quanto tempo di lavoro mi occupano. Gira la pagina per le prove.',
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
    rlHorizon: 'footer · clay diorama · 1831 × 599 · day / night',
  },
  hero: {
    first: 'Federico',
    last: 'Barbieri',
    role: 'Fullstack developer',
    place: 'Brescia',
    intro:
      'Costruisco piattaforme web, mobile e cloud a tutto tondo: quello che l’utente vede e quello che le fa funzionare.',
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
            'I prodotti di un’azienda della formazione costruiti come un unico ecosistema dietro un solo login: gestionale, marketplace, ticketing, timesheet.',
          problem: 'Strumenti separati, login separati. Ogni nuovo prodotto voleva dire un altro database utenti.',
          did: 'Ho progettato l’architettura e scritto gran parte del codice. Un authorization server emette token OIDC che portano solo l’identità; ogni prodotto tiene i propri ruoli e decide chi entra.',
          under:
            'Spring Boot 4 su Java 25, Vaadin 25 con viste Flow e React, Spring Authorization Server, JPA e Flyway su MySQL, checkout Stripe embedded. I rilasci sono tag git: l’immagine va su GHCR e si ridistribuisce con docker compose. Circa 1.000 commit su cinque repository, primo committer in ognuno.',
          chain: ['Vaadin 25', 'Spring Boot · Java 25', 'Authorization Server · OIDC', 'JPA · Flyway', 'MySQL'],
        },
      ],
      also: [
        'Uno scraper Playwright in Java, porting di un prototipo Python, che alimenta MySQL.',
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
            'Una piattaforma di project management: app mobile e web app con gantt, timeline, automazioni sui task e Microsoft 365.',
          problem: 'Team che pianificano da telefono e desktop, con viste che fogli di calcolo e chat non potevano dare.',
          did: 'Ero autore principale di entrambi i client: l’app Flutter e la web app Next.js, fino al gantt, all’editor rich-text, all’export PDF e all’accesso Microsoft 365.',
          under:
            'Flutter con flutter_bloc e dio, Next.js con TipTap e react-pdf, MSAL e Microsoft Graph, Firestore e Cloud Functions su Node. Oltre 1.000 commit come autore principale.',
          chain: ['Flutter', 'Next.js', 'Cloud Functions', 'Firestore', 'Microsoft Graph'],
        },
      ],
      also: [
        'Un’app social geolocalizzata per un cliente sotto NDA: Expo e Firebase, ricerca di prossimità con geohash, clustering su mappa, chat vincolata all’abbonamento.',
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
            'Un’app nativa per organizzare viaggi di gruppo: votare la destinazione, costruire l’itinerario, dividere le spese. Costruita due volte, apposta.',
          problem: 'I viaggi di gruppo muoiono nelle chat: nessuno decide la destinazione, le spese si perdono, il piano vive nella testa di uno solo.',
          did: 'Ero primo committer della v1, fatta in sei nel 2025 (Angular, Ionic, Express, Prisma su Postgres). Poi ho scritto un piano tecnico e l’ho ricostruita da solo su Expo: voto della destinazione, conguaglio automatico delle spese, itinerario su mappa e calendario, chat realtime.',
          under:
            'Expo SDK 56 con expo-router e NativeWind, Zustand, Zod, react-native-maps. Cloud Functions v2 su Node 20. Rules Firestore testate sull’emulatore, unit test sulla divisione spese.',
          chain: ['Expo 56 · expo-router', 'Cloud Functions v2', 'Firestore · rules testate', 'Firebase europe-west1'],
        },
        {
          id: 'traq',
          title: 'Traq',
          years: '2024',
          tags: ['Expo', 'Spotify API', 'Python'],
          summary:
            'Un gioco musicale su carte stampate: inquadri il QR, parte la traccia su Spotify, indovini prima degli altri.',
          problem: 'I quiz musicali hanno bisogno di un conduttore con una playlist. Volevo una scatola di carte che facesse girare il gioco da sola.',
          did: 'Un’app React Native per scansione, riproduzione e punteggi. Uno script Python costruisce il mazzo da Spotify e dipinge un gradiente radiale dentro ogni QR, perché sembri un mazzo e non un foglio di codici a barre.',
          under:
            'Expo SDK 51, expo-camera, Zustand, NativeWind, Spotify Web API. Generatore di carte in Python con qrcode e Pillow.',
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
      proof: ['Java, ecosistema di piattaforme', 'TypeScript, web e mobile', 'Dart, app mobile', 'Python, script e carte', 'SQL, migrazioni Flyway'],
    },
    {
      group: 'Backend',
      items: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'MySQL', 'Node.js', 'Express', 'FastAPI'],
      proof: ['ecosistema di piattaforme, ~1.000 commit', 'single sign-on OIDC in produzione', 'Cloud Functions, due prodotti'],
    },
    {
      group: 'Frontend',
      items: ['Vaadin', 'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind'],
      proof: ['Vaadin 25, viste Flow e React', 'Next.js, due siti aziendali', 'questa pagina, Vite e Tailwind 4'],
    },
    {
      group: 'Mobile',
      items: ['Flutter', 'React Native', 'Expo'],
      proof: ['Flutter, l’app di project management', 'App Viaggi, Expo 56', 'Traq, Expo 51'],
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
      text: 'Progetto e costruisco le piattaforme dell’azienda dalla prima bozza al go-live, prendo le decisioni su architettura e stack, e ho costruito il single sign-on che sta sotto a tutte.',
    },
    {
      org: 'Software house',
      role: 'Fullstack developer',
      from: 'novembre 2022',
      to: 'marzo 2025',
      text: 'Piattaforme web e mobile a tutto tondo, architettura e cloud inclusi. Autore principale di entrambi i client di un prodotto di project management.',
    },
    {
      org: 'Agenzia digitale',
      role: 'Sviluppatore web',
      from: 'maggio 2022',
      to: 'ottobre 2022',
      text: 'Backend di un e-commerce personalizzato su WooCommerce, una mappa interattiva con Google Maps API, script di automazione interni.',
    },
    {
      org: 'Servizi IT per il settore bancario',
      role: 'Analista di sistemi informatici',
      from: 'gennaio 2020',
      to: 'agosto 2021',
      text: 'Application management per istituti bancari: elaborazioni e monitoraggio, analisi dei log e risoluzione errori, SQL su ambienti Windows, Linux e Host.',
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
      'Quello che mi piace è il giro completo: decidere cosa deve fare un prodotto, scegliere lo stack, portarlo online, tenerlo onesto. Fuori dal lavoro costruisco le cose che vorrei esistessero: un pianificatore di viaggi per gli amici, un [[gioco musicale su carte stampate]].',
    ],
    languages: 'Italiano, madrelingua. Inglese, B2/C1.',
  },
  contact: {
    email: 'federico.barbieri99@gmail.com',
    linkedin: 'https://www.linkedin.com/in/federico-barbieri-6b6944225/',
    cta: 'Scrivimi una email',
    note: 'Il dettaglio completo è nel mio CV. Chiedi e te lo mando: l’email è [[il modo più veloce per raggiungermi]].',
  },
};

export default it;
