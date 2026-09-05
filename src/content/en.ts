import type { Content } from './types.ts';

const en: Content = {
  lang: 'en',
  dir: '/',
  other: { code: 'it', href: '/it/', label: 'Italiano' },
  meta: {
    title: 'Federico Barbieri',
    description:
      'Fullstack developer in Brescia, Italy. Web, mobile and cloud platforms end to end: Java and Spring, Vaadin, Flutter, React Native, TypeScript, Firebase.',
  },
  ui: {
    skip: 'Skip to work',
    navWork: 'Work',
    navSkills: 'Skills',
    navExperience: 'Experience',
    navAbout: 'About',
    navContact: 'Contact',
    modeFront: 'front',
    modeBackstage: 'backstage',
    toggleLabel: 'Show the backstage of this page',
    toggleHint: 'Flip the page to see what makes it work',
    workHeading: 'Selected work',
    alsoHeading: 'Also',
    problem: 'The problem',
    did: 'What I did',
    under: 'Under the hood',
    skillsHeading: 'Skills',
    skillsNote: 'Sized by the share of my working time they take. Flip the page for the evidence.',
    expHeading: 'Experience',
    eduHeading: 'Education',
    aboutHeading: 'About',
    contactHeading: 'Contact',
    present: 'today',
    footer: 'No cookies, no tracking.',
    tlPanel: 'Running timelines',
    hudScroll: 'scroll',
    hudLog: 'last events',
    rlMascot: 'mascot',
    rlH2: 'h2 · wdth 75 · clamp(40px, 6vw, 80px)',
    rlSection: 'padding clamp(72px, 11vh, 150px)',
    rlName: 'h1 · Bricolage Grotesque · wdth 75 · opsz 96',
    rlSize: 'clamp(88px, 14vw, 220px)',
    rlGutter: 'gutter clamp(20px, 4vw, 64px)',
    rlMeasure: 'measure ≤ 60ch',
    rlMode: 'data-mode="backstage"',
    rlRoute: 'route /',
    rlStack: 'vite · typescript · tailwind 4 · animejs 4.5',
  },
  hero: {
    first: 'Federico',
    last: 'Barbieri',
    role: 'Fullstack developer',
    place: 'Brescia, Italy',
    intro:
      'Taking an idea and making it real is what drew me to programming. I build web, mobile and cloud platforms end to end: what the user sees, and what makes it work.',
  },
  groups: [
    {
      id: 'aitech',
      org: 'Aitech',
      period: '2025 – today',
      works: [
        {
          id: 'aitech',
          title: 'Aitech platform ecosystem',
          years: '2025–2026',
          tags: ['Java', 'Spring Boot', 'Vaadin', 'OIDC', 'MySQL'],
          summary:
            'A suite of products for a training company, internal and customer-facing, that share one identity: a management platform for the core business, a central authorization server, a marketplace, ticketing, timesheets. I design the architecture and write most of the code.',
          problem:
            'The company ran its business on separate tools with separate logins. Every new product meant another user database and another password, and none of the tools talked to each other.',
          did: 'I designed and built the products as one ecosystem with a single identity. The management platform is the largest of them: it models the company’s day-to-day operations end to end, from planning to reporting, and integrates the external services the business already relies on. A separate authorization server handles login for everything and issues OIDC tokens that carry identity only, while each product keeps its own roles and decides who gets in. The marketplace sells with Stripe checkout; ticketing and timesheets run on the same stack and the same login. Decisions are written down as ADRs before they ship.',
          under:
            'Spring Boot 4 on Java 25, Vaadin 25 with Flow and React views, Spring Security, Spring Authorization Server (Authorization Code flow, per-product access gate on the authorize endpoint), JPA with Flyway on MySQL (78 migrations on the management platform alone), Stripe embedded checkout. Releases are git tags: GitHub Actions on self-hosted runners build the image, push it to GHCR and redeploy with docker compose. Around 1,000 commits across five repositories, top committer on each.',
          chain: ['Vaadin 25', 'Spring Boot · Java 25', 'Authorization Server · OIDC', 'JPA · Flyway', 'MySQL'],
        },
      ],
      also: [
        'A Playwright scraper in Java, ported from a Python prototype, feeding a MySQL database.',
        'An Electron desktop client for internal tooling.',
        'Python scripts that validate Excel and PDF data for an enterprise client’s compliance process.',
        'The company website in Next.js.',
      ],
      alsoTags: 'scraper, Electron, Python, website',
    },
    {
      id: 'starktech',
      org: 'StarkTech',
      period: '2022 – 2025',
      works: [
        {
          id: 'towedo',
          title: 'Towedo',
          years: '2022–2024',
          tags: ['Flutter', 'Next.js', 'Firebase', 'TypeScript'],
          summary:
            'A project management platform: a mobile app, a web app with gantt and timelines, task automations and Microsoft 365 integration. I was the main developer on both clients.',
          problem:
            'Teams needed one place to plan work from phone and desktop, with the planning views that spreadsheets and chat could not give them.',
          did: 'I built the Flutter app with BLoC state management and the Next.js web app: gantt and timeline charts, task automations, a rich-text editor, PDF export, and sign-in and calendar through Microsoft 365. Server logic runs as Firebase Cloud Functions.',
          under:
            'Flutter with flutter_bloc and dio, Next.js with React, TipTap, react-pdf, MSAL and Microsoft Graph, Firebase Auth, Firestore and Cloud Functions on Node. About 42,000 lines of Dart and 39,000 of TypeScript, over 1,000 commits as lead author.',
          chain: ['Flutter · BLoC', 'Next.js', 'Cloud Functions', 'Firestore', 'Microsoft Graph'],
        },
      ],
      also: [
        'A location-based social app for a client under NDA: Expo and Firebase, geohash proximity search, map clustering, subscription-gated chat. About 26,000 lines, 53 commits of mine.',
        'The company website in Next.js.',
      ],
      alsoTags: 'NDA app, website',
    },
    {
      id: 'personal',
      org: 'Personal',
      period: '2024 – 2026',
      works: [
        {
          id: 'viaggi',
          title: 'App Viaggi',
          years: '2025–2026',
          tags: ['Expo', 'React Native', 'Firebase', 'TypeScript'],
          summary:
            'A native app for planning group trips: vote the destination, propose stays, build the itinerary on map and calendar, split expenses, chat. Built twice, on purpose.',
          problem:
            'Group trips die in chat threads: nobody decides the destination, expenses get lost, the plan lives in one head. The first version, built by a team of six in 2025, worked, and taught us what the product really needed.',
          did: 'I was top committer on v1 (Angular, Ionic, Express, Prisma on Postgres). Then I wrote a technical plan and rebuilt it alone in 2026 on Expo: destination voting, expense splitting with automatic settlement, itinerary on map and calendar, realtime chat, push notifications. This time the Firestore security rules are tested against the emulator, and design decisions live next to the code.',
          under:
            'Expo SDK 56 with expo-router and NativeWind, Zustand, react-hook-form and Zod, i18next in Italian and English, react-native-maps. Cloud Functions v2 on Node 20 for voting, expenses, invites and notifications. Firestore rules tested with the emulator, unit tests on the expense split. About 12,900 lines of TypeScript.',
          chain: ['Expo 56 · expo-router', 'Cloud Functions v2', 'Firestore · tested rules', 'Firebase europe-west1'],
        },
        {
          id: 'traq',
          title: 'Traq',
          years: '2024',
          tags: ['Expo', 'Spotify API', 'Python'],
          summary:
            'A music guessing game with printed cards: scan the QR code, the track starts on Spotify, guess title and artist before your friends do.',
          problem:
            'Music quizzes need a host with a playlist. I wanted a box of cards that runs the game by itself, at a table, with the phones people already have.',
          did: 'I built the app in React Native with Expo: camera scanning, Spotify playback, single and multiplayer scoring. A Python script builds the song list from Spotify and generates the printable cards, painting a radial colour gradient into each QR code so the deck looks like a deck, not a sheet of barcodes.',
          under:
            'Expo SDK 51, expo-camera and barcode scanning, Zustand, NativeWind, Spotify Web API. Card generator in Python with qrcode and Pillow. Small codebase, whole product: printed cards, camera, streaming API.',
          chain: ['Expo 51 · camera', 'Spotify Web API', 'Python · qrcode · Pillow'],
        },
      ],
      also: [],
      alsoTags: '',
    },
  ],
  skills: [
    {
      group: 'Languages',
      tier: 1,
      items: ['Java', 'TypeScript', 'Dart', 'Python', 'SQL'],
      proof: ['Java · Aitech ecosystem, scraper', 'TypeScript · Towedo web, App Viaggi, Traq', 'Dart · Towedo mobile', 'Python · Traq cards, scripts', 'SQL · Flyway migrations'],
    },
    {
      group: 'Back-end',
      tier: 1,
      items: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'MySQL', 'Node.js', 'Express', 'FastAPI'],
      proof: ['Aitech ecosystem · ~1,000 commits', 'OIDC single sign-on in production', 'Cloud Functions on Node · Towedo, App Viaggi'],
    },
    {
      group: 'Front-end',
      tier: 1,
      items: ['Vaadin', 'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind'],
      proof: ['Vaadin 25 · Flow and React views', 'Towedo web · 39,000 lines of TypeScript', 'two company websites in Next.js'],
    },
    {
      group: 'Mobile',
      tier: 2,
      items: ['Flutter · BLoC', 'React Native · Expo'],
      proof: ['Towedo · 42,000 lines of Dart', 'App Viaggi · Expo 56', 'Traq · Expo 51'],
    },
    {
      group: 'Cloud',
      tier: 2,
      items: ['Firebase', 'Cloud Functions', 'Firestore', 'Docker', 'GitHub Actions', 'Google Cloud'],
      proof: ['Firestore rules tested on the emulator', 'images on GHCR · docker compose deploys'],
    },
    {
      group: 'Also',
      tier: 3,
      items: ['Python', 'Postgres', 'Stripe', 'Playwright', 'Electron'],
      proof: ['App Viaggi v1 · Express on Postgres', 'Java scraper on Playwright', 'Stripe embedded checkout'],
    },
  ],
  experience: [
    {
      org: 'Aitech S.r.l.',
      role: 'Fullstack developer',
      from: 'March 2025',
      to: 'today',
      text: 'Design and development of fullstack platforms for internal and external use, from first draft to go-live. I make the architecture and stack decisions, integrate external products, and built the centralised single sign-on for the whole application ecosystem.',
    },
    {
      org: 'StarkTech S.p.A.',
      role: 'Fullstack developer',
      from: 'November 2022',
      to: 'March 2025',
      text: 'Web and mobile platforms: software architecture, cloud infrastructure and the full development cycle. Lead author on both clients of a project management product.',
    },
    {
      org: '134U (Kit For You, PAIC)',
      role: 'Web developer',
      from: 'May 2022',
      to: 'October 2022',
      text: 'Back-end of a custom WooCommerce e-commerce, an interactive map on the Google Maps API, and automation scripts for internal processes. First contact with Web3 and smart contracts.',
    },
    {
      org: 'XEOS.IT, RES Synesis',
      role: 'IT systems analyst',
      from: 'January 2020',
      to: 'August 2021',
      text: 'Application management for banking institutions: batch runs and monitoring, log analysis and incident resolution on Windows, Linux and mainframe hosts, SQL for database operations.',
    },
  ],
  education: [
    {
      school: 'Digital Universitas',
      what: 'Full-time programme on digital skills, with scholarships from companies and entrepreneurs',
      years: '2021–2022',
    },
    {
      school: 'Istituto Industriale Statale Benedetto Castelli, Brescia',
      what: 'Diploma in computer science (perito informatico, EQF 4)',
      years: '2018',
    },
  ],
  about: {
    paragraphs: [
      'I’m Federico, a fullstack developer from Brescia, Italy. I’ve been writing software professionally since 2020, and building platforms end to end since 2022: back-end, front-end, mobile, and the cloud underneath.',
      'What I like is the whole loop: understanding what a product must do, choosing a stack that fits, writing it, shipping it, and keeping it honest with documentation and tests. I write decisions down before I write code.',
      'Outside work I build the things I wish existed: a trip planner for groups of friends, a [[music game on printed cards]].',
    ],
    languages: 'Italian, native. English, B2/C1.',
  },
  contact: {
    email: 'federico.barbieri99@gmail.com',
    linkedin: 'https://www.linkedin.com/in/federico-barbieri-6b6944225/',
    cta: 'Write me an email',
    note: 'I’m open to fullstack roles, remote or around Brescia. Email is [[the fastest way to reach me]].',
  },
};

export default en;
