export interface Work {
  id: string;
  title: string;
  years: string;
  tags: string[];
  summary: string;
  problem: string;
  did: string;
  under: string;
  chain: string[];
  link?: { href: string; label: string };
}

// One employer (or "personal"): a header in the ledger, its case studies, and smaller things done there.
export interface WorkGroup {
  id: string;
  org: string;
  period: string;
  works: Work[];
  // smaller things done there: rendered as one collapsed "Also" row, alsoTags is its short summary
  also: string[];
  alsoTags: string;
}

// tier 1 = what I do every day, 3 = used in shipped work. Drives the type size on the front.
export interface SkillGroup {
  group: string;
  tier: 1 | 2 | 3;
  items: string[];
  proof: string[];
}

export interface Experience {
  org: string;
  role: string;
  from: string;
  to: string;
  text: string;
}

export interface Content {
  lang: 'en' | 'it';
  dir: string;
  other: { code: string; href: string; label: string };
  meta: { title: string; description: string };
  ui: Record<string, string>;
  hero: { first: string; last: string; role: string; place: string; intro: string };
  groups: WorkGroup[];
  skills: SkillGroup[];
  experience: Experience[];
  education: { school: string; what: string; years: string }[];
  about: { paragraphs: string[]; languages: string };
  contact: { email: string; linkedin: string; cta: string; note: string };
}
