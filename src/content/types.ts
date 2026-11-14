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

// ordered by how much working time they take; all set at one size
export interface SkillGroup {
  group: string;
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
  other: { code: string; href: string; label: string; short: string };
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
