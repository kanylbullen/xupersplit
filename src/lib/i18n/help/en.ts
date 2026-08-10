import type { Help } from "./types";

const en: Help = {
  title: "Help & getting started",
  intro:
    "xupersplit splits shared costs without accounts: you create a split, share the link, and everyone adds what they paid. Below are the basics, the situations people actually run into, and how to hand the whole thing to an AI assistant.",

  toc: {
    start: "Getting started",
    examples: "Everyday situations",
    ai: "With an AI assistant",
    faq: "Questions and answers",
  },

  startHeading: "Getting started",
  steps: [
    {
      title: "1. Create the split",
      body: "Name it after the trip or the occasion and add everyone sharing the costs. Nobody needs an account, and you can add more people later. Pick the currency you'll mostly be spending in — individual expenses can be in any other currency.",
    },
    {
      title: "2. Share the link",
      body: "The link is the split. Send it to the group in whatever chat you already use. Anyone holding it can add expenses and settle up, so send it to the group and nobody else — and keep it yourself, because it's how you get back in.",
    },
    {
      title: "3. Add what you paid",
      body: "One expense per thing somebody paid for: who paid, how much, and who it was for. Split it equally, by shares, or by exact amounts. Add expenses as you go rather than reconstructing the week on the last evening.",
    },
    {
      title: "4. Settle up",
      body: "Balances works out the fewest transfers that make everyone square, and offers to pay by Swish, Lightning, USDC and more. Tap “Mark as paid” once the money has actually moved — no payment ever runs through xupersplit, so nothing tells us on its own.",
    },
  ],

  examplesHeading: "Everyday situations",
  examplesIntro:
    "Most questions about splitting are really questions about one of these seven.",
  examples: [
    {
      title: "A trip where several people paid for things",
      body: "The straightforward case: everyone adds their own receipts as they go, split equally between whoever the cost was for. Cabin on all five, ski passes on the four who skied, groceries on everyone. You never need to work out who owes whom — that's the last screen.",
    },
    {
      title: "A dinner where you didn't all share everything",
      body: "Don't split the bill evenly and hope it comes out fair. Enter one expense per group of items the same people shared: the bottle of wine on the three who drank it, each main course on the person who ate it, the shared starters on everyone. It's a few more taps and it's actually right.",
    },
    {
      title: "Couples, families and unequal shares",
      body: "Use Shares and give a couple a weight of 2 against everyone else's 1, or a household of four its four parts of the taxi. Shares also takes exact amounts per person when you already know the breakdown — the amounts have to add up to the total, so nothing can quietly go missing.",
    },
    {
      title: "A shared boat, a flat, a project that keeps running",
      body: "Not every split ends after a weekend. A boat two families share, a band's rehearsal room, a house with a standing list of repairs — costs keep arriving for years. Keep one split running rather than starting a new one each season: the balance simply carries on, and settling up in between doesn't close anything. Two settings are worth knowing about for these. Turn on “Keep payment info even after everyone is square” in Settings, or the stored Swish and IBAN details are wiped every time you happen to hit zero. And create the split while signed in, so you can switch off the automatic deletion after six months of inactivity — a boat is quiet all winter, and that counts as inactivity.",
    },
    {
      title: "Someone paid in a different currency",
      body: "Enter the expense in the currency it was actually paid in. The exchange rate is locked the moment you save, so a swing three weeks later doesn't rewrite what people owe each other. The split's main currency is what balances are shown in.",
    },
    {
      title: "Paying back only part of it",
      body: "In the pay dialog choose Part and enter what's actually being paid now. The rest stays on the balance and the suggestion updates. Useful when someone rounds to a whole note, or pays half now and half at the end of the month.",
    },
    {
      title: "Money that moved outside the app",
      body: "Someone handed over cash, or paid you back before you'd even made the split. Record it as a Transfer — from whoever paid, to whoever received it — and the balances take it into account. “Mark as paid” on a balance row does exactly the same thing.",
    },
  ],

  aiHeading: "With an AI assistant",
  aiIntro:
    "xupersplit is an MCP server, so an assistant like Claude, ChatGPT, Perplexity or Grok can do all of the above for you — create the split, enter what everyone paid, and tell you who owes whom. It needs no account and no API key, just the endpoint. Once it's connected, this is the kind of thing you say.",
  aiSetupCta: "Connect your assistant",
  promptsIntro:
    "Give the assistant the split's link whenever you're working on one that already exists — the link is what grants access, to people and assistants alike.",
  prompts: [
    {
      title: "Start a split from scratch",
      prompt:
        "Create a xupersplit called “Ski trip” with me, Alice and Bob, in SEK. I paid 4200 for the cabin and Alice paid 1800 for the ski passes.",
      body: "You get a link back. Share it with the group exactly like one you'd made by hand.",
    },
    {
      title: "Hand it a photo of the receipt",
      prompt:
        "Here's the receipt from dinner. The wine was shared by all three of us, the mains were each our own. Add it to <link>.",
      body: "The assistant reads the receipt and enters one expense per group of shared items, rather than one even split of the total. Tell it who had what — if it can't tell, it's supposed to ask rather than guess.",
    },
    {
      title: "Ask where things stand",
      prompt: "Who owes whom in <link>, and how much?",
      body: "The same minimal set of transfers the Balances tab shows, in a sentence.",
    },
    {
      title: "Record a payback",
      prompt: "Bob just swished me 620 for the ski trip. Record it in <link>.",
      body: "Logged as a transfer, so the balance drops by exactly that much.",
    },
  ],
  aiNote:
    "Splits created this way are the ordinary accountless kind. A secure split — participants bound to their accounts — can't be created or edited by an assistant, because the server deliberately has no way to sign in.",
  copy: "Copy",
  copied: "Copied ✓",

  faqHeading: "Questions and answers",
  faq: [
    {
      q: "Do I need an account?",
      a: "No. Creating a split, adding expenses and settling up all work without signing in. Signing in is optional and does one thing: it makes your splits follow you across devices instead of living in one browser.",
    },
    {
      q: "How secret is the link, really?",
      a: "The key in the link is 122 bits of randomness — it can't be guessed or brute-forced, and split pages are never indexed by search engines. But it's a key, not a password: anyone you forward it to can open the split, add expenses and edit payment details. Treat it the way you'd treat the door code to the cabin.",
    },
    {
      q: "Can we add someone after we've started?",
      a: "Yes, from Settings. Expenses already entered stay exactly as they were — a latecomer is only in on the ones you actually put them in. The same goes for removing someone, as long as they aren't on any expense yet.",
    },
    {
      q: "Someone added an expense after I'd already paid. Now what?",
      a: "The balances simply update and the extra shows up as a new suggested transfer. Nothing is locked by paying. To avoid it, everyone can mark “I'm done — no more expenses”, and the pay dialog warns you when somebody hasn't opened the split yet.",
    },
    {
      q: "Which currencies are supported?",
      a: "SEK, EUR, USD, NOK, DKK, ISK, GBP, CHF, PLN, THB — and sats, if you want to run the whole thing in bitcoin. Each expense can be in its own currency; the split's main currency is what the balances are presented in.",
    },
    {
      q: "Does the money go through xupersplit?",
      a: "Never. xupersplit only builds the payment you then approve in your own app: a Swish QR with the amount filled in, a Lightning invoice, a prefilled USDC transfer on Base, Arbitrum, Optimism or Solana. For Revolut it opens the recipient's profile, and for Vipps, MobilePay and IBAN it shows the details with a copy button, because those have no open person-to-person interface to prefill.",
    },
    {
      q: "How do I know the payment details are the right ones?",
      a: "Check the recipient's name in your own payment app before sending — anyone with the link can edit payment details here. If the details were changed after they were first entered, the pay dialog says so, with the date. Crypto payments are irreversible and are flagged separately.",
    },
    {
      q: "What is a “secure split”?",
      a: "An optional mode for when you'd rather not have the link be the only thing standing between the group and a stranger. Participants are bound to real accounts, and you decide who has to sign in, who can view the split, and how people claim their spot. Everyone edits only their own payment details and enters only their own expenses. It requires you to be signed in when you create it.",
    },
    {
      q: "How long is a split kept?",
      a: "A split is deleted automatically after six months without activity. If you created it while signed in you can turn that off in Settings. Payment details are wiped on their own once everyone is square, unless you ask to keep them for an ongoing split.",
      more: { label: "Privacy policy", href: "/privacy" },
    },
    {
      q: "Can I get my data out, or delete it?",
      a: "Settings has an export that downloads the whole split as JSON or CSV — every participant, expense, transfer and balance — so you can keep it or hand it to someone else. Individual expenses, and participants who aren't on any entry, you can delete yourself. To have a whole split removed before the automatic six-month purge, mail split@xuper.fun and it's done right away.",
    },
    {
      q: "What does it cost, and can I run it myself?",
      a: "Nothing, and yes. xupersplit is open source under the MIT licence, and a self-hosted instance gets its own MCP server at its own /api/mcp.",
      more: { label: "Source on GitHub", href: "https://github.com/kanylbullen/xupersplit" },
    },
    {
      q: "What can the AI assistant actually see?",
      a: "Only the splits whose links you give it — it has no account and no listing of anything else. It can't reach secure splits at all. Handing a link to an assistant is exactly as consequential as handing it to a person: it can add and change things.",
      more: { label: "About the MCP server", href: "/mcp" },
    },
  ],

  stuckHeading: "Still stuck?",
  stuck: "It goes to the person who built this, not a support desk. Say what you expected and what happened instead, and you'll get an answer.",
  stuckCta: "split@xuper.fun",
  backHome: "Create a split",
};

export default en;
