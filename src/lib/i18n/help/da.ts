import type { Help } from "./types";

const da: Help = {
  title: "Hjælp og kom i gang",
  intro:
    "Xupersplit deler fælles udgifter uden konti: du opretter et split, deler linket, og alle lægger ind, hvad de har betalt. Her er det grundlæggende, de situationer der faktisk opstår, og hvordan du lader en AI-assistent klare det hele.",

  toc: {
    start: "Kom i gang",
    examples: "Almindelige situationer",
    ai: "Med en AI-assistent",
    faq: "Spørgsmål og svar",
  },

  startHeading: "Kom i gang",
  steps: [
    {
      title: "1. Opret splittet",
      body: "Giv det navn efter turen eller anledningen, og tilføj alle, der deler udgifterne. Ingen behøver en konto, og du kan tilføje flere senere. Vælg den valuta, I mest kommer til at handle i — enkelte udgifter kan være i en hvilken som helst anden valuta.",
    },
    {
      title: "2. Del linket",
      body: "Linket er splittet. Send det til gruppen i den chat, I allerede bruger. Alle med linket kan tilføje udgifter og gøre op, så send det til gruppen og ingen andre — og gem det selv, for det er sådan, du kommer ind igen.",
    },
    {
      title: "3. Læg ind, hvad du har betalt",
      body: "Én udgift pr. ting, nogen har betalt for: hvem der betalte, hvor meget, og hvem den var til. Del ligeligt, med andele eller med præcise beløb. Læg ind undervejs i stedet for at rekonstruere hele ugen den sidste aften.",
    },
    {
      title: "4. Gør op",
      body: "Saldi udregner det mindste antal overførsler, der gør alle kvit, og tilbyder betaling med Swish, Lightning, USDC og mere. Tryk »Markér som betalt«, når pengene rent faktisk er flyttet — ingen betaling går gennem Xupersplit, så intet fortæller os det af sig selv.",
    },
  ],

  examplesHeading: "Almindelige situationer",
  examplesIntro:
    "De fleste spørgsmål om at dele udgifter er i virkeligheden spørgsmål om én af disse syv.",
  examples: [
    {
      title: "En tur, hvor flere har lagt ud",
      body: "Det enkle tilfælde: hver især lægger sine egne kvitteringer ind undervejs, delt ligeligt mellem dem, udgiften gjaldt. Hytten på alle fem, liftkortene på de fire, der stod på ski, maden på alle. I skal aldrig regne ud, hvem der skylder hvem — det er den sidste skærm.",
    },
    {
      title: "En middag, hvor I ikke delte det hele",
      body: "Del ikke regningen jævnt og håb, at det bliver retfærdigt. Læg én udgift ind pr. gruppe af ting, som de samme personer delte: vinflasken på de tre, der drak den, hver hovedret på den, der spiste den, de fælles forretter på alle. Det er et par tryk mere, og det bliver faktisk rigtigt.",
    },
    {
      title: "Par, familier og ulige andele",
      body: "Brug Andele og giv parret vægten 2 mod de andres 1, eller en husstand på fire dens fire dele af taxaen. Andele tager også præcise beløb pr. person, når du allerede kender fordelingen — beløbene skal summe til totalen, så intet kan forsvinde i stilhed.",
    },
    {
      title: "En delt båd, en lejlighed, et projekt der bliver ved",
      body: "Ikke alle splits slutter efter en weekend. En båd, som to familier deler, et øvelokale, et hus med en stående liste over reparationer — udgifterne bliver ved med at komme i årevis. Lad ét og samme split køre videre i stedet for at starte et nyt hver sæson: saldoen fortsætter ganske enkelt, og at gøre op undervejs lukker ingenting. To indstillinger er værd at kende her. Slå »Behold betalingsoplysninger, også når alle er kvit« til under Indstillinger, ellers ryddes gemte MobilePay- og IBAN-oplysninger hver gang I tilfældigvis står på nul. Og opret splittet, mens du er logget ind, så du kan slå den automatiske sletning efter seks måneder uden aktivitet fra — en båd ligger stille hele vinteren, og det tæller som inaktivitet.",
    },
    {
      title: "Nogen betalte i en anden valuta",
      body: "Læg udgiften ind i den valuta, den faktisk blev betalt i. Vekselkursen låses i det øjeblik, du gemmer, så en bevægelse tre uger senere omskriver ikke, hvad I skylder hinanden. Splittets hovedvaluta er den, saldiene vises i.",
    },
    {
      title: "At betale kun en del tilbage",
      body: "Vælg Del i betalingsdialogen, og skriv det, der rent faktisk betales nu. Resten bliver stående på saldoen, og forslaget opdateres. Nyttigt, når nogen runder op til en hel seddel eller betaler halvdelen nu og halvdelen ved månedsskiftet.",
    },
    {
      title: "Penge, der er flyttet uden om appen",
      body: "Nogen gav kontanter eller betalte tilbage, før du nåede at lave splittet. Læg det ind som en Overførsel — fra den, der betalte, til den, der modtog — så tælles det med. »Markér som betalt« på en saldorække gør nøjagtig det samme.",
    },
  ],

  aiHeading: "Med en AI-assistent",
  aiIntro:
    "Xupersplit er en MCP-server, så en assistent som Claude, ChatGPT, Perplexity eller Grok kan gøre alt ovenstående for dig — oprette splittet, lægge ind hvad hver især har betalt og fortælle, hvem der skylder hvem. Den behøver hverken konto eller API-nøgle, kun adressen. Når den først er koblet til, er det omtrent sådan, du siger det.",
  aiSetupCta: "Forbind din assistent",
  promptsIntro:
    "Giv assistenten linket til splittet, når I arbejder på et, der allerede findes — linket er det, der giver adgang, for mennesker og assistenter på samme måde.",
  prompts: [
    {
      title: "Start et split fra bunden",
      prompt:
        "Opret en xupersplit, der hedder »Skituren«, med mig, Alice og Bob, i DKK. Jeg betalte 4200 for hytten, og Alice betalte 1800 for liftkortene.",
      body: "Du får et link tilbage. Del det med gruppen præcis som et, du selv havde lavet.",
    },
    {
      title: "Giv den et billede af kvitteringen",
      prompt:
        "Her er kvitteringen fra middagen. Vinen delte vi tre om, hovedretterne var hver vores egen. Læg det ind i <link>.",
      body: "Assistenten læser kvitteringen og lægger én udgift ind pr. gruppe af delte ting i stedet for én jævn deling af totalen. Sig, hvem der havde hvad — kan den ikke afgøre det, skal den spørge frem for at gætte.",
    },
    {
      title: "Spørg, hvordan det står til",
      prompt: "Hvem skylder hvem i <link>, og hvor meget?",
      body: "Det samme minimale sæt overførsler, som Saldi viser, i én sætning.",
    },
    {
      title: "Registrér en tilbagebetaling",
      prompt: "Bob har lige betalt mig 620 tilbage for skituren. Registrér det i <link>.",
      body: "Bogføres som en overførsel, så saldoen falder med præcis det beløb.",
    },
  ],
  aiNote:
    "Splits, der oprettes ad den vej, er den almindelige kontoløse slags. Et sikkert split — hvor deltagerne er bundet til deres konti — kan ikke oprettes eller ændres af en assistent, fordi serveren bevidst ingen login har.",
  copy: "Kopiér",
  copied: "Kopieret ✓",

  faqHeading: "Spørgsmål og svar",
  faq: [
    {
      q: "Skal jeg have en konto?",
      a: "Nej. At oprette et split, lægge udgifter ind og gøre op virker uden login. At logge ind er frivilligt og gør én ting: dine splits følger dig mellem enheder i stedet for at bo i én browser.",
    },
    {
      q: "Hvor hemmeligt er linket egentlig?",
      a: "Nøglen i linket er 122 bits tilfældighed — den kan ikke gættes eller brute-forces, og splitsider indekseres aldrig af søgemaskiner. Men det er en nøgle, ikke en adgangskode: alle, du sender det videre til, kan åbne splittet, lægge udgifter ind og ændre betalingsoplysninger. Behandl det som dørkoden til hytten.",
    },
    {
      q: "Kan vi tilføje nogen, efter vi er begyndt?",
      a: "Ja, under Indstillinger. Udgifter, der allerede er lagt ind, bliver stående nøjagtig som de var — den, der kommer sent, er kun med på dem, du faktisk lægger vedkommende ind på. Det samme gælder at fjerne nogen, så længe de ikke står på nogen udgift.",
    },
    {
      q: "Nogen lagde en udgift ind, efter jeg havde betalt. Hvad nu?",
      a: "Saldiene opdateres ganske enkelt, og forskellen dukker op som et nyt forslag til overførsel. Intet låses af, at man betaler. Vil I undgå det, kan alle markere »Jeg er færdig — ingen flere udgifter«, og betalingsdialogen advarer, når nogen ikke har åbnet splittet endnu.",
    },
    {
      q: "Hvilke valutaer kan bruges?",
      a: "SEK, EUR, USD, NOK, DKK, ISK, GBP, CHF, PLN, THB — og sats, hvis I vil køre hele splittet i bitcoin. Hver udgift kan have sin egen valuta; splittets hovedvaluta er den, saldiene præsenteres i.",
    },
    {
      q: "Går pengene gennem Xupersplit?",
      a: "Aldrig. Xupersplit bygger kun den betaling, du derefter godkender i din egen app: en Swish-QR med beløbet udfyldt, en Lightning-faktura, en forudfyldt USDC-overførsel på Base, Arbitrum, Optimism eller Solana. For Revolut åbnes modtagerens profil, og for Vipps, MobilePay og IBAN vises oplysningerne med en kopiknap, fordi de ikke har en åben person-til-person-grænseflade at forudfylde.",
    },
    {
      q: "Hvordan ved jeg, at betalingsoplysningerne er de rigtige?",
      a: "Tjek modtagerens navn i din egen betalingsapp, før du sender — alle med linket kan ændre betalingsoplysninger her. Er oplysningerne ændret, efter de først blev lagt ind, siger betalingsdialogen det, med dato. Kryptobetalinger kan ikke fortrydes og markeres særskilt.",
    },
    {
      q: "Hvad er et »sikkert split«?",
      a: "En valgfri tilstand til, når du helst er fri for, at linket er det eneste, der står mellem gruppen og en fremmed. Deltagerne bindes til rigtige konti, og du bestemmer, hvem der skal logge ind, hvem der må se splittet, og hvordan folk tager deres plads. Hver især ændrer kun sine egne betalingsoplysninger og lægger kun sine egne udgifter ind. Det kræver, at du er logget ind, når du opretter det.",
    },
    {
      q: "Hvor længe gemmes et split?",
      a: "Et split slettes automatisk efter seks måneder uden aktivitet. Oprettede du det, mens du var logget ind, kan du slå det fra under Indstillinger. Betalingsoplysninger ryddes af sig selv, når alle er kvit, medmindre du beder om at beholde dem til et igangværende split.",
      more: { label: "Privatlivspolitik", href: "/privacy" },
    },
    {
      q: "Kan jeg få mine data ud eller slette dem?",
      a: "Under Indstillinger findes en eksport, der henter hele splittet som JSON eller CSV — hver deltager, udgift, overførsel og saldo — så du kan gemme det eller give det videre. Enkelte udgifter, og deltagere der ikke står på nogen postering, kan du selv slette. Vil du have hele splittet fjernet før den automatiske seksmåneders oprydning: skriv til split@xuper.fun, så sker det med det samme.",
    },
    {
      q: "Hvad koster det, og kan jeg køre det selv?",
      a: "Ingenting, og ja. Xupersplit er open source under MIT-licens, og en selvhostet instans får sin egen MCP-server på sin egen /api/mcp.",
      more: { label: "Kildekoden på GitHub", href: "https://github.com/kanylbullen/xupersplit" },
    },
    {
      q: "Hvad ser AI-assistenten egentlig?",
      a: "Kun de splits, du giver den links til — den har ingen konto og ingen liste over noget andet. Sikre splits når den slet ikke. At give et link til en assistent er præcis lige så stort som at give det til et menneske: den kan tilføje og ændre.",
      more: { label: "Om MCP-serveren", href: "/mcp" },
    },
  ],

  stuckHeading: "Stadig gået i stå?",
  stuck: "Det går til den person, der har bygget det her, ikke en supportafdeling. Skriv, hvad du forventede, og hvad der skete i stedet, så får du svar.",
  stuckCta: "split@xuper.fun",
  backHome: "Opret et split",
};

export default da;
