import type { Help } from "./types";

const fi: Help = {
  title: "Ohjeet ja käyttöönotto",
  intro:
    "Xupersplit jakaa yhteiset kulut ilman tilejä: luot jaon, jaat linkin, ja jokainen kirjaa mitä on maksanut. Tässä ovat perusasiat, tilanteet joita oikeasti tulee vastaan, ja se miten annat tekoälyavustajan hoitaa koko homman.",

  toc: {
    start: "Näin pääset alkuun",
    examples: "Tavalliset tilanteet",
    ai: "Tekoälyavustajan kanssa",
    faq: "Kysymyksiä ja vastauksia",
  },

  startHeading: "Näin pääset alkuun",
  steps: [
    {
      title: "1. Luo jako",
      body: "Nimeä se matkan tai tilaisuuden mukaan ja lisää kaikki, jotka jakavat kulut. Kukaan ei tarvitse tiliä, ja voit lisätä lisää ihmisiä myöhemmin. Valitse valuutta, jossa pääosin kulutatte — yksittäinen kulu voi olla missä tahansa muussa valuutassa.",
    },
    {
      title: "2. Jaa linkki",
      body: "Linkki on jako. Lähetä se porukalle siinä chatissa, jota jo käytätte. Kuka tahansa linkin haltija voi lisätä kuluja ja selvittää velat, joten lähetä se ryhmälle eikä kenellekään muulle — ja säilytä se itse, koska sitä kautta pääset takaisin sisään.",
    },
    {
      title: "3. Kirjaa mitä maksoit",
      body: "Yksi kulu jokaisesta asiasta, jonka joku maksoi: kuka maksoi, kuinka paljon ja keitä varten. Jaa tasan, osuuksilla tai tarkoilla summilla. Kirjaa matkan varrella sen sijaan, että rakentaisit koko viikon uudelleen viimeisenä iltana.",
    },
    {
      title: "4. Selvittäkää velat",
      body: "Saldot laskee pienimmän määrän siirtoja, joilla kaikki ovat kuitit, ja tarjoaa maksutavaksi Swishin, Lightningin, USDC:n ja muita. Paina ”Merkitse maksetuksi”, kun raha on oikeasti liikkunut — mikään maksu ei kulje Xupersplitin kautta, joten mikään ei kerro sitä meille itsestään.",
    },
  ],

  examplesHeading: "Tavalliset tilanteet",
  examplesIntro:
    "Useimmat kulujen jakamista koskevat kysymykset ovat oikeasti kysymyksiä jostakin näistä kuudesta.",
  examples: [
    {
      title: "Matka, jolla useampi maksoi",
      body: "Helpoin tapaus: jokainen kirjaa omat kuittinsa matkan varrella, jaettuna tasan niiden kesken, joita kulu koski. Mökki kaikille viidelle, hissiliput neljälle hiihtäneelle, ruoat kaikille. Teidän ei tarvitse koskaan laskea kuka on velkaa kenelle — se on viimeinen näkymä.",
    },
    {
      title: "Illallinen, jolla ette jakaneet kaikkea",
      body: "Älä jaa laskua tasan ja toivo, että se menee oikein. Kirjaa yksi kulu jokaisesta ryhmästä, jonka samat ihmiset jakoivat: viinipullo sen kolmen kesken, jotka sen joivat, jokainen pääruoka sille joka sen söi, yhteiset alkuruoat kaikille. Se on muutama painallus lisää, ja se menee oikeasti oikein.",
    },
    {
      title: "Pariskunnat, perheet ja eri kokoiset osuudet",
      body: "Käytä Osuuksia ja anna pariskunnalle painoksi 2 muiden 1:tä vastaan, tai neljän hengen taloudelle sen neljä osaa taksista. Osuudet ottaa myös tarkat summat henkilöä kohden, kun tiedät jaon jo valmiiksi — summien on täsmättävä loppusummaan, joten mikään ei voi hiljaa kadota.",
    },
    {
      title: "Joku maksoi toisessa valuutassa",
      body: "Kirjaa kulu siinä valuutassa, jossa se oikeasti maksettiin. Valuuttakurssi lukitaan sillä hetkellä kun tallennat, joten kolmen viikon päästä tapahtuva heilahdus ei kirjoita uusiksi sitä, mitä olette toisillenne velkaa. Jaon päävaluutta on se, jossa saldot näytetään.",
    },
    {
      title: "Vain osan maksaminen takaisin",
      body: "Valitse maksuikkunassa Osa ja kirjoita se, mikä nyt oikeasti maksetaan. Loppu jää saldolle ja ehdotus päivittyy. Kätevä silloin, kun joku pyöristää tasasetelille tai maksaa puolet nyt ja puolet kuun vaihteessa.",
    },
    {
      title: "Raha, joka liikkui sovelluksen ulkopuolella",
      body: "Joku antoi käteistä tai maksoi takaisin ennen kuin ehdit edes tehdä jakoa. Kirjaa se Siirtona — maksajalta saajalle — niin se otetaan huomioon. ”Merkitse maksetuksi” saldorivillä tekee täsmälleen saman asian.",
    },
  ],

  aiHeading: "Tekoälyavustajan kanssa",
  aiIntro:
    "Xupersplit on MCP-palvelin, joten Clauden, ChatGPT:n, Perplexityn tai Grokin kaltainen avustaja voi tehdä kaiken yllä olevan puolestasi — luoda jaon, kirjata kuka maksoi mitäkin ja kertoa kuka on velkaa kenelle. Se ei tarvitse tiliä eikä API-avainta, pelkän osoitteen. Kun se on kytketty, sanot suunnilleen näin.",
  aiSetupCta: "Kytke avustajasi",
  promptsIntro:
    "Anna avustajalle jaon linkki aina kun työskentelette jo olemassa olevan jaon parissa — linkki on se, joka antaa pääsyn, niin ihmisille kuin avustajillekin.",
  prompts: [
    {
      title: "Aloita jako tyhjästä",
      prompt:
        "Luo xupersplit nimeltä ”Hiihtoreissu” minun, Alicen ja Bobin kesken, euroissa. Minä maksoin 420 mökistä ja Alice maksoi 180 hissilipuista.",
      body: "Saat linkin takaisin. Jaa se porukalle aivan kuten itse tekemäsi.",
    },
    {
      title: "Anna sille kuva kuitista",
      prompt:
        "Tässä on illallisen kuitti. Viinin jaoimme kolmen kesken, pääruoat olivat jokaisen omat. Lisää se jakoon <linkki>.",
      body: "Avustaja lukee kuitin ja kirjaa yhden kulun jokaisesta jaetusta ryhmästä sen sijaan, että jakaisi loppusumman tasan. Kerro kuka otti mitäkin — jos se ei pysty päättelemään sitä, sen kuuluu kysyä eikä arvata.",
    },
    {
      title: "Kysy, miten tilanne on",
      prompt: "Kuka on velkaa kenelle jaossa <linkki>, ja kuinka paljon?",
      body: "Sama pienin mahdollinen siirtojen joukko, jonka Saldot näyttää, yhtenä lauseena.",
    },
    {
      title: "Kirjaa takaisinmaksu",
      prompt: "Bob maksoi minulle juuri 62 euroa takaisin hiihtoreissusta. Kirjaa se jakoon <linkki>.",
      body: "Kirjautuu siirtona, joten saldo laskee juuri sen verran.",
    },
  ],
  aiNote:
    "Näin luodut jaot ovat tavallisia, ilman tiliä toimivia jakoja. Suojattua jakoa — jossa osallistujat on sidottu tileihinsä — avustaja ei voi luoda eikä muokata, koska palvelimella ei tarkoituksella ole kirjautumista lainkaan.",
  copy: "Kopioi",
  copied: "Kopioitu ✓",

  faqHeading: "Kysymyksiä ja vastauksia",
  faq: [
    {
      q: "Tarvitsenko tilin?",
      a: "Et. Jaon luominen, kulujen kirjaaminen ja velkojen selvittäminen toimivat ilman kirjautumista. Kirjautuminen on vapaaehtoista ja tekee yhden asian: jakosi seuraavat mukana laitteesta toiseen sen sijaan, että asuisivat yhdessä selaimessa.",
    },
    {
      q: "Kuinka salainen linkki oikeastaan on?",
      a: "Linkin avain on 122 bittiä satunnaisuutta — sitä ei voi arvata eikä murtaa, eivätkä hakukoneet indeksoi jakosivuja koskaan. Mutta se on avain, ei salasana: kuka tahansa, jolle sen välität, voi avata jaon, kirjata kuluja ja muuttaa maksutietoja. Kohtele sitä kuin mökin ovikoodia.",
    },
    {
      q: "Voimmeko lisätä jonkun sen jälkeen, kun olemme aloittaneet?",
      a: "Kyllä, Asetuksista. Jo kirjatut kulut pysyvät täsmälleen ennallaan — myöhemmin tullut on mukana vain niissä, joihin hänet oikeasti lisäät. Sama koskee poistamista, kunhan henkilö ei ole millään kululla.",
    },
    {
      q: "Joku kirjasi kulun sen jälkeen, kun olin jo maksanut. Mitä nyt?",
      a: "Saldot yksinkertaisesti päivittyvät ja erotus ilmestyy uutena siirtoehdotuksena. Maksaminen ei lukitse mitään. Jos haluatte välttää sen, jokainen voi merkitä ”Olen valmis — ei enää kuluja”, ja maksuikkuna varoittaa, kun joku ei ole vielä avannut jakoa.",
    },
    {
      q: "Mitä valuuttoja voi käyttää?",
      a: "SEK, EUR, USD, NOK, DKK, ISK, GBP, CHF, PLN, THB — ja satsit, jos haluatte pyörittää koko jaon bitcoineissa. Jokaisella kululla voi olla oma valuuttansa; jaon päävaluutta on se, jossa saldot esitetään.",
    },
    {
      q: "Kulkevatko rahat Xupersplitin kautta?",
      a: "Eivät koskaan. Xupersplit vain rakentaa maksun, jonka sitten hyväksyt omassa sovelluksessasi: Swish-QR-koodin summa valmiina, Lightning-laskun, valmiiksi täytetyn USDC-siirron Basessa, Arbitrumissa, Optimismissa tai Solanassa. Revolutissa avataan saajan profiili, ja Vippsin, MobilePayn ja IBANin kohdalla tiedot näytetään kopiointipainikkeen kanssa, koska niillä ei ole avointa henkilöltä henkilölle -rajapintaa esitäytettäväksi.",
    },
    {
      q: "Mistä tiedän, että maksutiedot ovat oikeat?",
      a: "Tarkista saajan nimi omassa maksusovelluksessasi ennen lähettämistä — kuka tahansa linkin haltija voi muuttaa maksutietoja täällä. Jos tietoja on muutettu sen jälkeen kun ne ensin kirjattiin, maksuikkuna kertoo sen päivämäärineen. Kryptomaksuja ei voi perua, ja ne merkitään erikseen.",
    },
    {
      q: "Mikä on ”suojattu jako”?",
      a: "Valinnainen tila siihen, kun et halua linkin olevan ainoa asia porukan ja tuntemattoman välissä. Osallistujat sidotaan oikeisiin tileihin, ja sinä päätät kenen on kirjauduttava, kuka saa nähdä jaon ja miten paikan ottaa. Jokainen muokkaa vain omia maksutietojaan ja kirjaa vain omat kulunsa. Se vaatii, että olet kirjautuneena kun luot sen.",
    },
    {
      q: "Kuinka kauan jako säilyy?",
      a: "Jako poistetaan automaattisesti kuuden kuukauden käyttämättömyyden jälkeen. Jos loit sen kirjautuneena, voit kytkeä sen pois Asetuksista. Maksutiedot siivotaan itsestään, kun kaikki ovat kuitit, ellet pyydä säilyttämään niitä käynnissä olevaa jakoa varten.",
      more: { label: "Tietosuojaseloste", href: "/privacy" },
    },
    {
      q: "Saanko tietoni ulos tai poistettua?",
      a: "Asetuksissa on vienti, joka lataa koko jaon JSON- tai CSV-muodossa — jokaisen osallistujan, kulun, siirron ja saldon — jotta voit säilyttää sen tai antaa sen eteenpäin. Yksittäiset kulut ja osallistujat, jotka eivät ole millään kirjauksella, voit poistaa itse. Jos haluat koko jaon poistettavaksi ennen automaattista kuuden kuukauden siivousta, lähetä viesti osoitteeseen split@xuper.fun, niin se hoituu heti.",
    },
    {
      q: "Mitä se maksaa, ja voinko pyörittää sitä itse?",
      a: "Ei mitään, ja kyllä. Xupersplit on avointa lähdekoodia MIT-lisenssillä, ja itse ylläpidetty instanssi saa oman MCP-palvelimensa omaan /api/mcp-osoitteeseensa.",
      more: { label: "Lähdekoodi GitHubissa", href: "https://github.com/kanylbullen/xupersplit" },
    },
    {
      q: "Mitä tekoälyavustaja oikeastaan näkee?",
      a: "Vain ne jaot, joiden linkit sille annat — sillä ei ole tiliä eikä listaa mistään muusta. Suojattuihin jakoihin se ei ylety lainkaan. Linkin antaminen avustajalle on yhtä iso asia kuin sen antaminen ihmiselle: se voi lisätä ja muuttaa.",
      more: { label: "Tietoa MCP-palvelimesta", href: "/mcp" },
    },
  ],

  stuckHeading: "Jäitkö silti jumiin?",
  stuck: "Viesti menee tämän rakentaneelle ihmiselle, ei asiakaspalveluun. Kerro mitä odotit ja mitä sen sijaan tapahtui, niin saat vastauksen.",
  stuckCta: "split@xuper.fun",
  backHome: "Luo jako",
};

export default fi;
