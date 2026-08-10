import type { Help } from "./types";

const sv: Help = {
  title: "Hjälp och kom igång",
  intro:
    "xupersplit delar gemensamma utgifter utan konton: du skapar en split, delar länken, och alla lägger in vad de betalat. Här är grunderna, situationerna som faktiskt dyker upp, och hur du låter en AI-assistent sköta alltihop.",

  toc: {
    start: "Kom igång",
    examples: "Vanliga situationer",
    ai: "Med en AI-assistent",
    faq: "Frågor och svar",
  },

  startHeading: "Kom igång",
  steps: [
    {
      title: "1. Skapa spliten",
      body: "Döp den efter resan eller tillfället och lägg till alla som delar kostnaderna. Ingen behöver ett konto, och du kan lägga till fler senare. Välj valutan ni mest kommer att handla i — enskilda utgifter kan vara i vilken annan valuta som helst.",
    },
    {
      title: "2. Dela länken",
      body: "Länken är spliten. Skicka den till gruppen i den chatt ni redan använder. Alla som har den kan lägga in utgifter och göra upp, så skicka den till gruppen och ingen annan — och spara den själv, för det är så du kommer tillbaka in.",
    },
    {
      title: "3. Lägg in vad du betalat",
      body: "En utgift per sak som någon betalat: vem som betalade, hur mycket, och vilka den var för. Dela lika, med andelar, eller med exakta belopp. Lägg in efter hand i stället för att rekonstruera hela veckan sista kvällen.",
    },
    {
      title: "4. Gör upp",
      body: "Saldon räknar ut det minsta antal överföringar som gör alla kvitt, och erbjuder betalning med Swish, Lightning, USDC och mer. Tryck ”Markera som betald” när pengarna faktiskt flyttat — ingen betalning går genom xupersplit, så inget talar om det för oss av sig självt.",
    },
  ],

  examplesHeading: "Vanliga situationer",
  examplesIntro:
    "De flesta frågor om att dela utgifter är egentligen frågor om någon av de här sju.",
  examples: [
    {
      title: "En resa där flera har lagt ut",
      body: "Det enkla fallet: var och en lägger in sina egna kvitton efterhand, delat lika mellan dem utgiften gällde. Stugan på alla fem, liftkorten på de fyra som åkte, maten på allihop. Ni behöver aldrig räkna ut vem som ska ha vad — det är sista skärmen.",
    },
    {
      title: "En middag där ni inte delade på allt",
      body: "Dela inte notan jämnt och hoppas att det blir rättvist. Lägg in en utgift per grupp av saker som samma personer delade: vinflaskan på de tre som drack den, varje varmrätt på den som åt den, de gemensamma förrätterna på alla. Det är några tryck till, och det blir faktiskt rätt.",
    },
    {
      title: "Par, familjer och ojämna andelar",
      body: "Använd Andelar och ge paret vikten 2 mot de andras 1, eller ett hushåll på fyra sina fyra delar av taxin. Andelar tar också exakta belopp per person när du redan vet fördelningen — beloppen måste summera till totalen, så ingenting kan tyst försvinna.",
    },
    {
      title: "En delad båt, en lägenhet, ett projekt som rullar vidare",
      body: "Alla splitar tar inte slut efter en helg. En båt som två familjer delar, ett replokal, ett hus med en stående lista på reparationer — utgifterna fortsätter komma i åratal. Låt en och samma split rulla i stället för att starta en ny varje säsong: saldot fortsätter helt enkelt, och att göra upp däremellan stänger ingenting. Två inställningar är värda att känna till för de här. Slå på ”Behåll betaluppgifter även när alla är kvitt” under Inställningar, annars rensas sparade Swish- och IBAN-uppgifter varje gång ni råkar stå på noll. Och skapa spliten inloggad, så att du kan stänga av den automatiska raderingen efter sex månaders inaktivitet — en båt står stilla hela vintern, och det räknas som inaktivitet.",
    },
    {
      title: "Någon betalade i en annan valuta",
      body: "Lägg in utgiften i valutan den faktiskt betalades i. Växelkursen låses i samma sekund du sparar, så en rörelse tre veckor senare skriver inte om vad ni är skyldiga varandra. Splitens huvudvaluta är den saldona visas i.",
    },
    {
      title: "Att betala tillbaka bara en del",
      body: "Välj Del i betaldialogen och ange vad som faktiskt betalas nu. Resten ligger kvar på saldot och förslaget uppdateras. Bra när någon avrundar till en jämn sedel, eller betalar halva nu och halva vid månadsskiftet.",
    },
    {
      title: "Pengar som rört sig utanför appen",
      body: "Någon gav kontanter, eller betalade tillbaka innan du ens hunnit göra spliten. Lägg in det som en Överföring — från den som betalade till den som fick — så räknas det med. ”Markera som betald” på en saldorad gör exakt samma sak.",
    },
  ],

  aiHeading: "Med en AI-assistent",
  aiIntro:
    "xupersplit är en MCP-server, så en assistent som Claude, ChatGPT, Perplexity eller Grok kan göra allt ovanstående åt dig — skapa spliten, lägga in vad var och en betalat och berätta vem som är skyldig vem. Den behöver varken konto eller API-nyckel, bara adressen. När den väl är inkopplad är det ungefär så här du säger.",
  aiSetupCta: "Koppla in din assistent",
  promptsIntro:
    "Ge assistenten splitens länk när ni jobbar på en som redan finns — länken är det som ger åtkomst, för människor och assistenter lika.",
  prompts: [
    {
      title: "Starta en split från noll",
      prompt:
        "Skapa en xupersplit som heter ”Skidresan” med mig, Alice och Bob, i SEK. Jag betalade 4200 för stugan och Alice betalade 1800 för liftkorten.",
      body: "Du får tillbaka en länk. Dela den med gruppen precis som en du gjort för hand.",
    },
    {
      title: "Ge den ett foto av kvittot",
      prompt:
        "Här är kvittot från middagen. Vinet delade vi tre på, varmrätterna var var och ens egen. Lägg in det i <länk>.",
      body: "Assistenten läser kvittot och lägger in en utgift per grupp av delade saker, i stället för en jämn delning av totalen. Säg vem som hade vad — kan den inte avgöra det ska den fråga i stället för att gissa.",
    },
    {
      title: "Fråga hur det ligger till",
      prompt: "Vem är skyldig vem i <länk>, och hur mycket?",
      body: "Samma minimala uppsättning överföringar som Saldon visar, fast i en mening.",
    },
    {
      title: "Bokför en återbetalning",
      prompt: "Bob swishade precis 620 till mig för skidresan. Lägg in det i <länk>.",
      body: "Bokförs som en överföring, så saldot sjunker med exakt så mycket.",
    },
  ],
  aiNote:
    "Splitar som skapas den här vägen är den vanliga kontolösa sorten. En säker split — där deltagarna är knutna till sina konton — går inte att skapa eller ändra med en assistent, eftersom servern medvetet saknar inloggning.",
  copy: "Kopiera",
  copied: "Kopierat ✓",

  faqHeading: "Frågor och svar",
  faq: [
    {
      q: "Behöver jag ett konto?",
      a: "Nej. Att skapa en split, lägga in utgifter och göra upp fungerar utan inloggning. Att logga in är frivilligt och gör en enda sak: dina splitar följer med mellan enheter i stället för att bo i en webbläsare.",
    },
    {
      q: "Hur hemlig är länken egentligen?",
      a: "Nyckeln i länken är 122 bitar slump — den går inte att gissa eller forcera, och splitsidor indexeras aldrig av sökmotorer. Men det är en nyckel, inte ett lösenord: alla du vidarebefordrar den till kan öppna spliten, lägga in utgifter och ändra betaluppgifter. Behandla den som portkoden till stugan.",
    },
    {
      q: "Kan vi lägga till någon efter att vi börjat?",
      a: "Ja, under Inställningar. Utgifter som redan är inlagda ligger kvar precis som de var — den som kommer sent är bara med på dem du faktiskt lägger in hen på. Detsamma gäller att ta bort någon, så länge hen inte finns på någon utgift.",
    },
    {
      q: "Någon la in en utgift efter att jag redan betalat. Hur nu?",
      a: "Saldona uppdateras helt enkelt och mellanskillnaden dyker upp som ett nytt förslag på överföring. Ingenting låses av att man betalar. Vill ni undvika det kan alla markera ”Jag är klar — inga fler utgifter”, och betaldialogen varnar när någon inte öppnat spliten än.",
    },
    {
      q: "Vilka valutor går att använda?",
      a: "SEK, EUR, USD, NOK, DKK, ISK, GBP, CHF, PLN, THB — och sats, om ni vill köra hela spliten i bitcoin. Varje utgift kan ha sin egen valuta; splitens huvudvaluta är den saldona presenteras i.",
    },
    {
      q: "Går pengarna genom xupersplit?",
      a: "Aldrig. xupersplit bygger bara betalningen som du sedan godkänner i din egen app: en Swish-QR med beloppet ifyllt, en Lightning-faktura, en förifylld USDC-överföring på Base, Arbitrum, Optimism eller Solana. För Revolut öppnas mottagarens profil, och för Vipps, MobilePay och IBAN visas uppgifterna med en kopieringsknapp, eftersom de saknar ett öppet person-till-person-gränssnitt att förifylla.",
    },
    {
      q: "Hur vet jag att betaluppgifterna är rätt?",
      a: "Kontrollera mottagarens namn i din egen betalapp innan du skickar — alla med länken kan ändra betaluppgifter här. Har uppgifterna ändrats efter att de först lades in säger betaldialogen det, med datum. Kryptobetalningar går inte att ångra och flaggas separat.",
    },
    {
      q: "Vad är en ”säker split”?",
      a: "Ett frivilligt läge för när du hellre slipper att länken är det enda som står mellan gruppen och en främling. Deltagarna knyts till riktiga konton, och du bestämmer vem som måste logga in, vem som får se spliten och hur man tar sin plats. Var och en ändrar bara sina egna betaluppgifter och lägger bara in sina egna utgifter. Det kräver att du är inloggad när du skapar den.",
    },
    {
      q: "Hur länge sparas en split?",
      a: "En split raderas automatiskt efter sex månader utan aktivitet. Skapade du den inloggad kan du stänga av det under Inställningar. Betaluppgifter rensas av sig själva när alla är kvitt, om du inte ber att få behålla dem för en pågående split.",
      more: { label: "Integritetspolicy", href: "/privacy" },
    },
    {
      q: "Kan jag få ut mina data, eller radera dem?",
      a: "Under Inställningar finns en export som laddar ner hela spliten som JSON eller CSV — varje deltagare, utgift, överföring och saldo — så att du kan spara den eller lämna över den. Enskilda utgifter, och deltagare som inte står på någon post, kan du ta bort själv. Vill du få hela spliten raderad innan den automatiska sexmånadersgallringen: mejla split@xuper.fun, så sker det direkt.",
    },
    {
      q: "Vad kostar det, och kan jag köra det själv?",
      a: "Ingenting, och ja. xupersplit är öppen källkod under MIT-licens, och en självhostad instans får sin egen MCP-server på sin egen /api/mcp.",
      more: { label: "Källkoden på GitHub", href: "https://github.com/kanylbullen/xupersplit" },
    },
    {
      q: "Vad ser AI-assistenten egentligen?",
      a: "Bara de splitar vars länkar du ger den — den har inget konto och ingen lista över något annat. Säkra splitar når den inte alls. Att ge en länk till en assistent är precis lika stort som att ge den till en människa: den kan lägga till och ändra.",
      more: { label: "Om MCP-servern", href: "/mcp" },
    },
  ],

  stuckHeading: "Fastnat ändå?",
  stuck: "Det går till personen som byggt det här, inte en supportavdelning. Skriv vad du förväntade dig och vad som hände i stället, så får du svar.",
  stuckCta: "split@xuper.fun",
  backHome: "Skapa en split",
};

export default sv;
