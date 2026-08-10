/**
 * Shape of the /help page's content, one file per locale.
 *
 * The lists are fixed-length tuples on purpose. The main dictionaries catch a
 * missing *key* through `Dict`, but an array would happily let a locale ship
 * four of the six examples and no compiler would say a word — on a help page
 * that is the difference between "translated" and "quietly incomplete".
 */

/** A step in the walkthrough. */
export type HelpStep = { title: string; body: string };

/** A situation people actually hit, and what to do about it. */
export type HelpExample = { title: string; body: string };

/** What to say to an assistant. `prompt` is shown verbatim and copyable. */
export type HelpPrompt = { title: string; prompt: string; body: string };

/** A question, its answer, and optionally where to read more. */
export type HelpQA = {
  q: string;
  a: string;
  more?: { label: string; href: string };
};

export type Help = {
  title: string;
  intro: string;

  toc: { start: string; examples: string; ai: string; faq: string };

  startHeading: string;
  steps: [HelpStep, HelpStep, HelpStep, HelpStep];

  examplesHeading: string;
  examplesIntro: string;
  examples: [
    HelpExample,
    HelpExample,
    HelpExample,
    HelpExample,
    HelpExample,
    HelpExample,
    HelpExample,
  ];

  aiHeading: string;
  aiIntro: string;
  aiSetupCta: string;
  promptsIntro: string;
  prompts: [HelpPrompt, HelpPrompt, HelpPrompt, HelpPrompt];
  aiNote: string;
  copy: string;
  copied: string;

  faqHeading: string;
  faq: [
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
    HelpQA,
  ];

  stuckHeading: string;
  stuck: string;
  stuckCta: string;
  backHome: string;
};
