import type { Content } from './types.ts';

const en: Content = {
  lang: 'en',
  dir: '/',
  other: { code: 'it', href: '/it/', label: 'Italiano' },
  meta: {
    title: 'Federico Barbieri',
    description:
      'Fullstack developer in Brescia, Italy. I build web, mobile and cloud platforms end to end: Java and Spring, Vaadin, Flutter, React Native, TypeScript, Firebase.',
  },
  ui: {
    skip: 'Skip to work',
    navLabel: 'Sections',
    exploreWork: 'Explore my work',
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
    skillsNote: 'Ordered by how much of my working time they take. Flip the page for the evidence.',
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
    rlHorizon: 'footer · clay diorama · 1831 × 599 · day / night',
  },
  hero: {
    first: 'Federico',
    last: 'Barbieri',
    role: 'Fullstack developer',
    place: 'Brescia, Italy',
    intro:
      'I build web, mobile and cloud platforms end to end: what the user sees, and what makes it work.',
  },
  groups: [
    {
      id: 'current',
      org: 'Current role',
      period: '2025 - today',
      works: [
        {
          id: 'platform',
          title: 'Platform ecosystem',
          years: '2025-2026',
          tags: ['Java', 'Spring Boot', 'Vaadin', 'OIDC', 'MySQL'],
          summary:
            'A training company’s products built as one ecosystem behind a single login: management platform, marketplace, ticketing, timesheets.',
          problem: 'Separate tools, separate logins. Every new product meant another user database.',
          did: 'I designed the architecture and wrote most of the code. One authorization server issues OIDC tokens that carry identity only; each product keeps its own roles and decides who gets in.',
          under:
            'Spring Boot 4 on Java 25, Vaadin 25 with Flow and React views, Spring Authorization Server, JPA and Flyway on MySQL, Stripe embedded checkout. Releases are git tags: the image goes to GHCR and redeploys with docker compose. Around 1,000 commits across five repositories, top committer on each.',
          chain: ['Vaadin 25', 'Spring Boot · Java 25', 'Authorization Server · OIDC', 'JPA · Flyway', 'MySQL'],
        },
      ],
      also: [
        'A Playwright scraper in Java, ported from a Python prototype, feeding MySQL.',
        'An Electron desktop client for internal tooling.',
        'Python scripts that validate Excel and PDF data for an enterprise client’s compliance process.',
        'A company website in Next.js.',
      ],
      alsoTags: 'scraper, Electron, Python, website',
    },
    {
      id: 'previous',
      org: 'Previous role',
      period: '2022 - 2025',
      works: [
        {
          id: 'pm',
          title: 'Project management platform',
          years: '2022-2024',
          tags: ['Flutter', 'Next.js', 'Firebase', 'TypeScript'],
          summary:
            'A project management platform: a mobile app and a web app with gantt, timelines, task automations and Microsoft 365.',
          problem: 'Teams planning from phone and desktop, with views that spreadsheets and chat could not give them.',
          did: 'I was lead author on both clients: the Flutter app and the Next.js web app, down to the gantt, the rich-text editor, PDF export and Microsoft 365 sign-in.',
          under:
            'Flutter with flutter_bloc and dio, Next.js with TipTap and react-pdf, MSAL and Microsoft Graph, Firestore and Cloud Functions on Node. Over 1,000 commits as lead author.',
          chain: ['Flutter', 'Next.js', 'Cloud Functions', 'Firestore', 'Microsoft Graph'],
        },
      ],
      also: [
        'A location-based social app for a client under NDA: Expo and Firebase, geohash proximity search, map clustering, subscription-gated chat.',
        'A company website in Next.js.',
      ],
      alsoTags: 'NDA app, website',
    },
    {
      id: 'personal',
      org: 'Personal',
      period: '2024 - 2026',
      works: [
        {
          id: 'viaggi',
          title: 'App Viaggi',
          years: '2025-2026',
          tags: ['Expo', 'React Native', 'Firebase', 'TypeScript'],
          summary:
            'A native app for planning group trips: vote the destination, build the itinerary, split the expenses. Built twice, on purpose.',
          problem: 'Group trips die in chat threads: nobody decides the destination, the expenses get lost, the plan lives in one head.',
          did: 'I was top committer on v1, built by six of us in 2025 (Angular, Ionic, Express, Prisma on Postgres). Then I wrote a technical plan and rebuilt it alone on Expo: destination voting, automatic expense settlement, itinerary on map and calendar, realtime chat.',
          under:
            'Expo SDK 56 with expo-router and NativeWind, Zustand, Zod, react-native-maps. Cloud Functions v2 on Node 20. Firestore rules tested against the emulator, unit tests on the expense split.',
          chain: ['Expo 56 · expo-router', 'Cloud Functions v2', 'Firestore · tested rules', 'Firebase europe-west1'],
        },
        {
          id: 'traq',
          title: 'Traq',
          years: '2024',
          tags: ['Expo', 'Spotify API', 'Python'],
          summary:
            'A music guessing game on printed cards: scan the QR code, the track starts on Spotify, name it before your friends do.',
          problem: 'Music quizzes need a host with a playlist. I wanted a box of cards that runs the game by itself.',
          did: 'A React Native app for scanning, playback and scoring. A Python script builds the deck from Spotify and paints a radial gradient into every QR code, so it looks like a deck and not a sheet of barcodes.',
          under:
            'Expo SDK 51, expo-camera, Zustand, NativeWind, Spotify Web API. Card generator in Python with qrcode and Pillow.',
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
      items: ['Java', 'TypeScript', 'Dart', 'Python', 'SQL'],
      proof: ['Java, platform ecosystem', 'TypeScript, web and mobile', 'Dart, mobile app', 'Python, scripts and cards', 'SQL, Flyway migrations'],
    },
    {
      group: 'Back-end',
      items: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'MySQL', 'Node.js', 'Express', 'FastAPI'],
      proof: ['platform ecosystem, ~1,000 commits', 'OIDC single sign-on in production', 'Cloud Functions, two products'],
    },
    {
      group: 'Front-end',
      items: ['Vaadin', 'TypeScript', 'React', 'Next.js', 'Vite', 'Tailwind'],
      proof: ['Vaadin 25, Flow and React views', 'Next.js, two company websites', 'this page, Vite and Tailwind 4'],
    },
    {
      group: 'Mobile',
      items: ['Flutter', 'React Native', 'Expo'],
      proof: ['Flutter, the project management app', 'App Viaggi, Expo 56', 'Traq, Expo 51'],
    },
    {
      group: 'Cloud',
      items: ['Firebase', 'Cloud Functions', 'Firestore', 'Docker', 'Traefik', 'GitHub Actions', 'Google Cloud'],
      proof: ['Firestore rules tested on the emulator', 'GHCR images, docker compose deploys'],
    },
    {
      group: 'Also',
      items: ['Python', 'Postgres', 'Stripe', 'Playwright', 'Electron'],
      proof: ['App Viaggi v1, Express on Postgres', 'Java scraper on Playwright', 'Stripe embedded checkout'],
    },
  ],
  experience: [
    {
      org: 'Company in professional training',
      role: 'Fullstack developer',
      from: 'March 2025',
      to: 'today',
      text: 'I design and build the company’s platforms from first draft to go-live, make the architecture and stack calls, and built the single sign-on behind all of them.',
    },
    {
      org: 'Software house',
      role: 'Fullstack developer',
      from: 'November 2022',
      to: 'March 2025',
      text: 'Web and mobile platforms end to end, architecture and cloud included. Lead author on both clients of a project management product.',
    },
    {
      org: 'Digital agency',
      role: 'Web developer',
      from: 'May 2022',
      to: 'October 2022',
      text: 'Back-end of a custom WooCommerce e-commerce, an interactive map on the Google Maps API, internal automation scripts.',
    },
    {
      org: 'IT services for the banking sector',
      role: 'IT systems analyst',
      from: 'January 2020',
      to: 'August 2021',
      text: 'Application management for banks: batch runs and monitoring, log analysis and incident resolution, SQL on Windows, Linux and mainframe hosts.',
    },
  ],
  education: [
    {
      school: 'Digital Universitas',
      what: 'Full-time programme on digital skills, with scholarships from companies and entrepreneurs',
      years: '2021-2022',
    },
    {
      school: 'Istituto Industriale Statale Benedetto Castelli, Brescia',
      what: 'Diploma in computer science (perito informatico, EQF 4)',
      years: '2018',
    },
  ],
  about: {
    paragraphs: [
      'I’m Federico, a fullstack developer from Brescia, Italy. Writing software professionally since 2020, building platforms end to end since 2022: back-end, front-end, mobile, and the cloud underneath.',
      'What I like is the whole loop: deciding what a product must do, choosing the stack, shipping it, keeping it honest. Outside work I build what I wish existed: a trip planner for friends, a [[music game on printed cards]].',
    ],
    languages: 'Italian, native. English, B2/C1.',
  },
  contact: {
    email: 'federico.barbieri99@gmail.com',
    linkedin: 'https://www.linkedin.com/in/federico-barbieri-6b6944225/',
    cta: 'Write me an email',
    note: 'The full detail is in my CV. Ask and I’ll send it: email is [[the fastest way to reach me]].',
  },
};

export default en;
