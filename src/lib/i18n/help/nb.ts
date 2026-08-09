import type { Help } from "./types";

const nb: Help = {
  title: "Hjelp og kom i gang",
  intro:
    "Xupersplit deler felles utgifter uten kontoer: du lager en split, deler lenken, og alle legger inn hva de har betalt. Her er det grunnleggende, situasjonene som faktisk dukker opp, og hvordan du lar en AI-assistent gjøre hele jobben.",

  toc: {
    start: "Kom i gang",
    examples: "Vanlige situasjoner",
    ai: "Med en AI-assistent",
    faq: "Spørsmål og svar",
  },

  startHeading: "Kom i gang",
  steps: [
    {
      title: "1. Lag spliten",
      body: "Gi den navn etter turen eller anledningen og legg til alle som deler kostnadene. Ingen trenger konto, og du kan legge til flere senere. Velg valutaen dere stort sett kommer til å handle i — enkeltutgifter kan være i hvilken som helst annen valuta.",
    },
    {
      title: "2. Del lenken",
      body: "Lenken er spliten. Send den til gjengen i den chatten dere allerede bruker. Alle som har den kan legge inn utgifter og gjøre opp, så send den til gruppa og ingen andre — og ta vare på den selv, for det er slik du kommer inn igjen.",
    },
    {
      title: "3. Legg inn det du har betalt",
      body: "Én utgift per ting noen har betalt for: hvem som betalte, hvor mye, og hvem den var for. Del likt, med andeler, eller med eksakte beløp. Legg inn underveis i stedet for å rekonstruere hele uka siste kvelden.",
    },
    {
      title: "4. Gjør opp",
      body: "Saldoer regner ut det minste antallet overføringer som gjør alle skuls, og tilbyr betaling med Swish, Lightning, USDC og mer. Trykk «Marker som betalt» når pengene faktisk har flyttet seg — ingen betaling går gjennom Xupersplit, så ingenting forteller oss det av seg selv.",
    },
  ],

  examplesHeading: "Vanlige situasjoner",
  examplesIntro:
    "De fleste spørsmål om å dele utgifter er egentlig spørsmål om én av disse seks.",
  examples: [
    {
      title: "En tur der flere har lagt ut",
      body: "Det enkle tilfellet: hver legger inn sine egne kvitteringer underveis, delt likt mellom dem utgiften gjaldt. Hytta på alle fem, heiskortene på de fire som sto på ski, maten på alle. Dere trenger aldri regne ut hvem som skylder hvem — det er siste skjerm.",
    },
    {
      title: "En middag der dere ikke delte på alt",
      body: "Ikke del regningen jevnt og håp at det blir rettferdig. Legg inn én utgift per gruppe av ting de samme folkene delte: vinflasken på de tre som drakk den, hver hovedrett på den som spiste den, forrettene dere delte på alle. Det er noen trykk til, og det blir faktisk riktig.",
    },
    {
      title: "Par, familier og ulike andeler",
      body: "Bruk Andeler og gi paret vekt 2 mot de andres 1, eller en husholdning på fire sine fire deler av taxien. Andeler tar også eksakte beløp per person når du allerede vet fordelingen — beløpene må summere seg til totalen, så ingenting kan forsvinne i det stille.",
    },
    {
      title: "Noen betalte i en annen valuta",
      body: "Legg inn utgiften i valutaen den faktisk ble betalt i. Vekslingskursen låses i det øyeblikket du lagrer, så en bevegelse tre uker senere skriver ikke om hva dere skylder hverandre. Splitens hovedvaluta er den saldoene vises i.",
    },
    {
      title: "Å betale tilbake bare en del",
      body: "Velg Del i betalingsdialogen og skriv inn det som faktisk betales nå. Resten blir liggende på saldoen og forslaget oppdateres. Nyttig når noen runder av til en hel seddel, eller betaler halvparten nå og halvparten ved månedsskiftet.",
    },
    {
      title: "Penger som har beveget seg utenfor appen",
      body: "Noen ga kontanter, eller betalte tilbake før du rakk å lage spliten. Legg det inn som en Overføring — fra den som betalte til den som fikk — så blir det regnet med. «Marker som betalt» på en saldorad gjør nøyaktig det samme.",
    },
  ],

  aiHeading: "Med en AI-assistent",
  aiIntro:
    "Xupersplit er en MCP-server, så en assistent som Claude, ChatGPT, Perplexity eller Grok kan gjøre alt det over for deg — lage spliten, legge inn hva hver enkelt har betalt og si hvem som skylder hvem. Den trenger verken konto eller API-nøkkel, bare adressen. Når den først er koblet til, er det omtrent slik du sier det.",
  aiSetupCta: "Koble til assistenten din",
  promptsIntro:
    "Gi assistenten lenken til spliten når dere jobber på en som allerede finnes — lenken er det som gir tilgang, for mennesker og assistenter likt.",
  prompts: [
    {
      title: "Start en split fra bunnen",
      prompt:
        "Lag en xupersplit som heter «Skituren» med meg, Alice og Bob, i NOK. Jeg betalte 4200 for hytta og Alice betalte 1800 for heiskortene.",
      body: "Du får en lenke tilbake. Del den med gjengen akkurat som en du hadde laget for hånd.",
    },
    {
      title: "Gi den et bilde av kvitteringen",
      prompt:
        "Her er kvitteringen fra middagen. Vinen delte vi tre på, hovedrettene var hver vår egen. Legg det inn i <lenke>.",
      body: "Assistenten leser kvitteringen og legger inn én utgift per gruppe av delte ting, i stedet for én jevn deling av totalen. Si hvem som hadde hva — kan den ikke avgjøre det, skal den spørre i stedet for å gjette.",
    },
    {
      title: "Spør hvordan det ligger an",
      prompt: "Hvem skylder hvem i <lenke>, og hvor mye?",
      body: "Det samme minimale settet med overføringer som Saldoer viser, i én setning.",
    },
    {
      title: "Før opp en tilbakebetaling",
      prompt: "Bob vippset meg akkurat 620 for skituren. Før det inn i <lenke>.",
      body: "Føres som en overføring, så saldoen synker med nøyaktig så mye.",
    },
  ],
  aiNote:
    "Splitter som lages på denne måten er den vanlige kontoløse sorten. En sikker split — der deltakerne er knyttet til kontoene sine — kan ikke lages eller endres av en assistent, fordi serveren bevisst ikke har innlogging.",
  copy: "Kopier",
  copied: "Kopiert ✓",

  faqHeading: "Spørsmål og svar",
  faq: [
    {
      q: "Trenger jeg en konto?",
      a: "Nei. Å lage en split, legge inn utgifter og gjøre opp fungerer uten innlogging. Å logge inn er frivillig og gjør én ting: splittene dine følger deg mellom enheter i stedet for å bo i én nettleser.",
    },
    {
      q: "Hvor hemmelig er lenken egentlig?",
      a: "Nøkkelen i lenken er 122 bits tilfeldighet — den kan ikke gjettes eller brutforseres, og splitsider indekseres aldri av søkemotorer. Men det er en nøkkel, ikke et passord: alle du videresender den til kan åpne spliten, legge inn utgifter og endre betalingsdetaljer. Behandle den som portkoden til hytta.",
    },
    {
      q: "Kan vi legge til noen etter at vi har begynt?",
      a: "Ja, under Innstillinger. Utgifter som allerede er lagt inn blir stående nøyaktig som de var — den som kommer sent er bare med på dem du faktisk legger vedkommende inn på. Det samme gjelder å fjerne noen, så lenge de ikke står på noen utgift.",
    },
    {
      q: "Noen la inn en utgift etter at jeg hadde betalt. Hva nå?",
      a: "Saldoene oppdateres rett og slett, og mellomlegget dukker opp som et nytt forslag til overføring. Ingenting låses av at man betaler. Vil dere unngå det, kan alle markere «Jeg er ferdig — ingen flere utgifter», og betalingsdialogen varsler når noen ikke har åpnet spliten ennå.",
    },
    {
      q: "Hvilke valutaer kan brukes?",
      a: "SEK, EUR, USD, NOK, DKK, ISK, GBP, CHF, PLN, THB — og sats, hvis dere vil kjøre hele spliten i bitcoin. Hver utgift kan ha sin egen valuta; splitens hovedvaluta er den saldoene presenteres i.",
    },
    {
      q: "Går pengene gjennom Xupersplit?",
      a: "Aldri. Xupersplit bygger bare betalingen som du deretter godkjenner i din egen app: en Swish-QR med beløpet fylt ut, en Lightning-faktura, en forhåndsutfylt USDC-overføring på Base, Arbitrum, Optimism eller Solana. For Revolut åpnes mottakerens profil, og for Vipps, MobilePay og IBAN vises detaljene med en kopieringsknapp, fordi de ikke har et åpent person-til-person-grensesnitt å fylle ut på forhånd.",
    },
    {
      q: "Hvordan vet jeg at betalingsdetaljene er riktige?",
      a: "Sjekk mottakerens navn i din egen betalingsapp før du sender — alle med lenken kan endre betalingsdetaljer her. Er detaljene endret etter at de først ble lagt inn, sier betalingsdialogen fra, med dato. Kryptobetalinger kan ikke angres og flagges separat.",
    },
    {
      q: "Hva er en «sikker split»?",
      a: "En valgfri modus for når du helst slipper at lenken er det eneste som står mellom gjengen og en fremmed. Deltakerne knyttes til ekte kontoer, og du bestemmer hvem som må logge inn, hvem som får se spliten og hvordan folk tar plassen sin. Hver enkelt endrer bare sine egne betalingsdetaljer og legger bare inn sine egne utgifter. Det krever at du er innlogget når du lager den.",
    },
    {
      q: "Hvor lenge lagres en split?",
      a: "En split slettes automatisk etter seks måneder uten aktivitet. Lagde du den innlogget, kan du skru det av under Innstillinger. Betalingsdetaljer ryddes bort av seg selv når alle er skuls, med mindre du ber om å beholde dem for en pågående split.",
      more: { label: "Personvern", href: "/privacy" },
    },
    {
      q: "Kan jeg få ut dataene mine, eller slette dem?",
      a: "Under Innstillinger finnes en eksport som laster ned hele spliten som JSON eller CSV — hver deltaker, utgift, overføring og saldo — så du kan ta vare på den eller gi den videre. Enkeltutgifter, og deltakere som ikke står på noen føring, kan du slette selv. Vil du få hele spliten fjernet før den automatiske seksmånedersopprydningen: send en e-post til split@xuper.fun, så skjer det med en gang.",
    },
    {
      q: "Hva koster det, og kan jeg kjøre det selv?",
      a: "Ingenting, og ja. Xupersplit er åpen kildekode under MIT-lisens, og en selvhostet instans får sin egen MCP-server på sin egen /api/mcp.",
      more: { label: "Kildekoden på GitHub", href: "https://github.com/kanylbullen/xupersplit" },
    },
    {
      q: "Hva ser AI-assistenten egentlig?",
      a: "Bare de splittene du gir den lenkene til — den har ingen konto og ingen liste over noe annet. Sikre splitter når den ikke i det hele tatt. Å gi en lenke til en assistent er nøyaktig like stort som å gi den til et menneske: den kan legge til og endre.",
      more: { label: "Om MCP-serveren", href: "/mcp" },
    },
  ],

  stuckHeading: "Står du fortsatt fast?",
  stuck: "Det går til personen som har bygget dette, ikke en supportavdeling. Skriv hva du forventet og hva som skjedde i stedet, så får du svar.",
  stuckCta: "split@xuper.fun",
  backHome: "Lag en split",
};

export default nb;
