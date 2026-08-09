import type { Help } from "./types";

const is: Help = {
  title: "Hjálp og fyrstu skref",
  intro:
    "Xupersplit skiptir sameiginlegum kostnaði án aðganga: þú býrð til skiptingu, deilir hlekknum og allir skrá hvað þeir greiddu. Hér eru grunnatriðin, aðstæðurnar sem koma raunverulega upp, og hvernig þú lætur gervigreindaraðstoðarmann sjá um allt saman.",

  toc: {
    start: "Fyrstu skref",
    examples: "Algengar aðstæður",
    ai: "Með gervigreindaraðstoð",
    faq: "Spurningar og svör",
  },

  startHeading: "Fyrstu skref",
  steps: [
    {
      title: "1. Búðu til skiptinguna",
      body: "Nefndu hana eftir ferðinni eða tilefninu og bættu við öllum sem deila kostnaðinum. Enginn þarf aðgang, og þú getur bætt við fleirum síðar. Veldu gjaldmiðilinn sem þið eyðið mest í — einstök útgjöld mega vera í hvaða öðrum gjaldmiðli sem er.",
    },
    {
      title: "2. Deildu hlekknum",
      body: "Hlekkurinn er skiptingin. Sendu hann á hópinn í því spjalli sem þið notið hvort eð er. Allir sem hafa hann geta bætt við útgjöldum og gert upp, svo sendu hann á hópinn og engan annan — og geymdu hann sjálf(ur), því þannig kemstu inn aftur.",
    },
    {
      title: "3. Skráðu það sem þú greiddir",
      body: "Ein færsla fyrir hvert sem einhver greiddi: hver greiddi, hversu mikið og fyrir hverja. Skiptu jafnt, með hlutföllum eða með nákvæmum upphæðum. Skráðu jafnóðum í stað þess að endurgera alla vikuna síðasta kvöldið.",
    },
    {
      title: "4. Gerið upp",
      body: "Stöður reikna út fæstu millifærslurnar sem gera alla kvitta og bjóða greiðslu með Swish, Lightning, USDC og fleiru. Ýttu á „Merkja sem greitt“ þegar peningarnir hafa raunverulega færst — engin greiðsla fer í gegnum Xupersplit, svo ekkert segir okkur það af sjálfu sér.",
    },
  ],

  examplesHeading: "Algengar aðstæður",
  examplesIntro:
    "Flestar spurningar um kostnaðarskiptingu eru í raun spurningar um eina af þessum sex.",
  examples: [
    {
      title: "Ferð þar sem fleiri en einn lögðu út",
      body: "Einfalda tilfellið: hver og einn skráir sínar eigin kvittanir jafnóðum, skipt jafnt milli þeirra sem útgjöldin vörðuðu. Bústaðurinn á alla fimm, lyftukortin á þá fjóra sem fóru á skíði, maturinn á alla. Þið þurfið aldrei að reikna út hver skuldar hverjum — það er síðasti skjárinn.",
    },
    {
      title: "Kvöldverður þar sem þið deilduð ekki öllu",
      body: "Ekki skipta reikningnum jafnt og vona að það verði sanngjarnt. Skráðu eina færslu fyrir hvern hóp af hlutum sem sömu aðilar deildu: vínflöskuna á þá þrjá sem drukku hana, hvern aðalrétt á þann sem borðaði hann, sameiginlegu forréttina á alla. Það eru nokkrir smellir í viðbót, og það verður raunverulega rétt.",
    },
    {
      title: "Pör, fjölskyldur og ójöfn hlutföll",
      body: "Notaðu Hlutföll og gefðu parinu vægið 2 á móti 1 hjá hinum, eða fjögurra manna heimili sína fjóra hluta af leigubílnum. Hlutföll taka líka nákvæmar upphæðir á mann þegar þú veist skiptinguna fyrir — upphæðirnar verða að standast heildarupphæðina, svo ekkert getur horfið í kyrrþey.",
    },
    {
      title: "Einhver greiddi í öðrum gjaldmiðli",
      body: "Skráðu útgjöldin í þeim gjaldmiðli sem raunverulega var greitt í. Gengið er læst um leið og þú vistar, svo sveifla þremur vikum síðar endurskrifar ekki hvað þið skuldið hvert öðru. Aðalgjaldmiðill skiptingarinnar er sá sem stöðurnar birtast í.",
    },
    {
      title: "Að greiða aðeins hluta til baka",
      body: "Veldu Hluti í greiðsluglugganum og sláðu inn það sem raunverulega er greitt núna. Afgangurinn situr áfram á stöðunni og tillagan uppfærist. Gagnlegt þegar einhver rúnnar upp í heilan seðil eða greiðir helminginn núna og helminginn um mánaðamót.",
    },
    {
      title: "Peningar sem færðust utan appsins",
      body: "Einhver rétti reiðufé, eða borgaði til baka áður en þú náðir að búa til skiptinguna. Skráðu það sem Millifærslu — frá þeim sem greiddi til þess sem fékk — og þá er tekið tillit til þess. „Merkja sem greitt“ á stöðulínu gerir nákvæmlega það sama.",
    },
  ],

  aiHeading: "Með gervigreindaraðstoð",
  aiIntro:
    "Xupersplit er MCP-þjónn, svo aðstoðarmaður eins og Claude, ChatGPT, Perplexity eða Grok getur gert allt ofangreint fyrir þig — búið til skiptinguna, skráð hvað hver greiddi og sagt þér hver skuldar hverjum. Hann þarf hvorki aðgang né API-lykil, bara slóðina. Þegar hann er tengdur segirðu eitthvað á þessa leið.",
  aiSetupCta: "Tengdu aðstoðarmanninn þinn",
  promptsIntro:
    "Gefðu aðstoðarmanninum hlekk skiptingarinnar þegar þið vinnið með eina sem er þegar til — hlekkurinn er það sem veitir aðgang, jafnt fyrir fólk og aðstoðarmenn.",
  prompts: [
    {
      title: "Byrjaðu skiptingu frá grunni",
      prompt:
        "Búðu til xupersplit sem heitir „Skíðaferðin“ með mér, Alice og Bob, í ISK. Ég greiddi 42.000 fyrir bústaðinn og Alice greiddi 18.000 fyrir lyftukortin.",
      body: "Þú færð hlekk til baka. Deildu honum með hópnum alveg eins og einum sem þú bjóst til sjálf(ur).",
    },
    {
      title: "Réttu honum mynd af kvittuninni",
      prompt:
        "Hér er kvittunin af kvöldverðinum. Víninu deildum við þrjú, aðalréttirnir voru hvers og eins. Bættu því við <hlekkur>.",
      body: "Aðstoðarmaðurinn les kvittunina og skráir eina færslu fyrir hvern hóp af sameiginlegum hlutum, í stað einnar jafnrar skiptingar á heildinni. Segðu honum hver fékk hvað — geti hann ekki greint það á hann að spyrja frekar en að giska.",
    },
    {
      title: "Spurðu hvernig staðan er",
      prompt: "Hver skuldar hverjum í <hlekkur>, og hversu mikið?",
      body: "Sama lágmarkssett af millifærslum og Stöður sýna, í einni setningu.",
    },
    {
      title: "Skráðu endurgreiðslu",
      prompt: "Bob millifærði rétt í þessu 6.200 á mig fyrir skíðaferðina. Skráðu það í <hlekkur>.",
      body: "Skráist sem millifærsla, svo staðan lækkar um nákvæmlega þá upphæð.",
    },
  ],
  aiNote:
    "Skiptingar sem verða til á þennan hátt eru af venjulegu gerðinni, án aðgangs. Örugga skiptingu — þar sem þátttakendur eru bundnir við reikningana sína — getur aðstoðarmaður hvorki búið til né breytt, því þjónninn hefur af ásetningi enga innskráningu.",
  copy: "Afrita",
  copied: "Afritað ✓",

  faqHeading: "Spurningar og svör",
  faq: [
    {
      q: "Þarf ég aðgang?",
      a: "Nei. Að búa til skiptingu, skrá útgjöld og gera upp virkar allt án innskráningar. Innskráning er valfrjáls og gerir eitt: skiptingarnar þínar fylgja þér milli tækja í stað þess að búa í einum vafra.",
    },
    {
      q: "Hversu leynilegur er hlekkurinn í raun?",
      a: "Lykillinn í hlekknum er 122 bitar af slembni — hann er ekki hægt að giska á eða brjóta, og leitarvélar skrá skiptingarsíður aldrei. En hann er lykill, ekki lykilorð: hver sem þú áframsendir hann á getur opnað skiptinguna, skráð útgjöld og breytt greiðsluupplýsingum. Farðu með hann eins og dyrakóðann að bústaðnum.",
    },
    {
      q: "Getum við bætt einhverjum við eftir að við byrjuðum?",
      a: "Já, í Stillingum. Útgjöld sem þegar eru skráð standa nákvæmlega óbreytt — sá sem kemur seint er aðeins með í þeim sem þú setur hann raunverulega í. Sama gildir um að fjarlægja einhvern, svo lengi sem viðkomandi er ekki á neinni færslu.",
    },
    {
      q: "Einhver skráði útgjöld eftir að ég var búin(n) að greiða. Hvað nú?",
      a: "Stöðurnar einfaldlega uppfærast og mismunurinn birtist sem ný tillaga að millifærslu. Ekkert læsist við það að greiða. Viljið þið forðast það geta allir merkt „Ég er búin(n) — engin fleiri útgjöld“, og greiðsluglugginn varar við þegar einhver hefur ekki opnað skiptinguna enn.",
    },
    {
      q: "Hvaða gjaldmiðla er hægt að nota?",
      a: "SEK, EUR, USD, NOK, DKK, ISK, GBP, CHF, PLN, THB — og sats, ef þið viljið keyra alla skiptinguna í bitcoin. Hver færsla má hafa sinn eigin gjaldmiðil; aðalgjaldmiðill skiptingarinnar er sá sem stöðurnar birtast í.",
    },
    {
      q: "Fara peningarnir í gegnum Xupersplit?",
      a: "Aldrei. Xupersplit býr aðeins til greiðsluna sem þú samþykkir svo í þínu eigin appi: Swish-QR með upphæðinni útfylltri, Lightning-reikning, forútfyllda USDC-millifærslu á Base, Arbitrum, Optimism eða Solana. Fyrir Revolut opnast prófíll móttakanda, og fyrir Vipps, MobilePay og IBAN eru upplýsingarnar sýndar með afritunarhnappi, því þau bjóða ekki upp á opið viðmót milli einstaklinga til að forútfylla.",
    },
    {
      q: "Hvernig veit ég að greiðsluupplýsingarnar séu réttar?",
      a: "Athugaðu nafn móttakanda í þínu eigin greiðsluappi áður en þú sendir — hver sem er með hlekkinn getur breytt greiðsluupplýsingum hér. Hafi upplýsingunum verið breytt eftir að þær voru fyrst skráðar segir greiðsluglugginn frá því, með dagsetningu. Rafmyntagreiðslur verða ekki afturkallaðar og eru merktar sérstaklega.",
    },
    {
      q: "Hvað er „örugg skipting“?",
      a: "Valfrjáls stilling fyrir þegar þú vilt síður að hlekkurinn sé það eina sem stendur milli hópsins og ókunnugs. Þátttakendur eru bundnir við raunverulega aðganga, og þú ræður hverjir þurfa að skrá sig inn, hverjir mega sjá skiptinguna og hvernig fólk tekur sitt sæti. Hver og einn breytir aðeins sínum eigin greiðsluupplýsingum og skráir aðeins sín eigin útgjöld. Það krefst þess að þú sért innskráð(ur) þegar þú býrð hana til.",
    },
    {
      q: "Hversu lengi geymist skipting?",
      a: "Skipting eyðist sjálfkrafa eftir sex mánuði án virkni. Bjóstu hana til innskráð(ur) geturðu slökkt á því í Stillingum. Greiðsluupplýsingar hreinsast af sjálfu sér þegar allir eru kvittir, nema þú biðjir um að halda þeim fyrir skiptingu sem er í gangi.",
      more: { label: "Persónuvernd", href: "/privacy" },
    },
    {
      q: "Get ég náð í gögnin mín eða eytt þeim?",
      a: "Í Stillingum er útflutningur sem sækir alla skiptinguna sem JSON eða CSV — hvern þátttakanda, útgjöld, millifærslur og stöður — svo þú getir geymt hana eða afhent hana öðrum. Einstakar færslur, og þátttakendur sem eru ekki á neinni færslu, geturðu eytt sjálf(ur). Viljir þú láta eyða allri skiptingunni áður en sjálfvirka sex mánaða hreinsunin fer fram, sendu póst á split@xuper.fun og það er gert strax.",
    },
    {
      q: "Hvað kostar þetta, og get ég keyrt það sjálf(ur)?",
      a: "Ekkert, og já. Xupersplit er opinn hugbúnaður undir MIT-leyfi, og sjálfhýst eintak fær sinn eigin MCP-þjón á sínu eigin /api/mcp.",
      more: { label: "Kóðinn á GitHub", href: "https://github.com/kanylbullen/xupersplit" },
    },
    {
      q: "Hvað sér gervigreindaraðstoðarmaðurinn eiginlega?",
      a: "Aðeins þær skiptingar sem þú gefur honum hlekkina að — hann hefur engan aðgang og enga skrá yfir neitt annað. Öruggar skiptingar nær hann alls ekki í. Að gefa aðstoðarmanni hlekk er nákvæmlega jafn afdrifaríkt og að gefa hann manneskju: hann getur bætt við og breytt.",
      more: { label: "Um MCP-þjóninn", href: "/mcp" },
    },
  ],

  stuckHeading: "Ertu enn föst/fastur?",
  stuck: "Þetta fer til manneskjunnar sem smíðaði þetta, ekki í þjónustuver. Segðu hverju þú bjóst við og hvað gerðist í staðinn, þá færðu svar.",
  stuckCta: "split@xuper.fun",
  backHome: "Búa til skiptingu",
};

export default is;
