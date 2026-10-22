# Turnering – turneringsapp för Android och webbläsare

En app för att köra turneringar direkt i mobilen eller datorn: skriv in spelare eller
lag, mata in poäng omgång för omgång, se en tabell som uppdateras automatiskt och skapa
ett slutspel där t.ex. topp 32 från tabellen seedas in i ett slutspelsträd.

## Köra i webbläsaren

- **Online:** https://titaniccheese.github.io/TournamentApplication/
  (kräver att GitHub Pages är påslaget en gång: *Settings → Pages → Source: GitHub Actions*).
  Kan läggas till på hemskärmen och fungerar sedan även offline.
- **Som fil:** ladda ner `Turnering.html` under **Releases → Senaste version** och öppna den
  i valfri webbläsare (dator, iPhone, surfplatta). Allt finns i den enda filen – inget internet behövs.

Data sparas i webbläsaren på den enhet du använder. Flytta mellan enheter med
**Mer → Exportera/Importera säkerhetskopia**.

## Installera på Android

1. Gå till **Releases** i det här repot på mobilen och öppna **Senaste version**.
2. Ladda ner `Turnering.apk` och öppna filen.
3. Tillåt installation från okända källor om telefonen frågar (gäller webbläsaren/filhanteraren).

En ny APK byggs automatiskt av GitHub Actions vid varje push. Nya versioner kan
installeras ovanpå den gamla – dina turneringar finns kvar.

> All data sparas lokalt i telefonen. Använd **Mer → Exportera säkerhetskopia**
> då och då, särskilt innan du avinstallerar appen.

## Format

Välj format när du skapar en turnering (eller under **Format / Mer → Byt format**):

| Mall | Upplägg |
|---|---|
| **Poängliga** | Poäng per omgång, automatisk tabell, slutspel för topp X |
| **Valorant Champions** | 16 lag i 4 GSL-grupper (Bo3, dubbelutslagning i gruppen), topp 2 till dubbelutslaget slutspel (Bo3, undre final och final Bo5) – som Champions Shanghai |
| **CS Major** | Swiss-fas (Bo1, avgörande matcher Bo3), 3 vinster vidare / 3 förluster ute, topp 8 till utslagning |
| **Mario Kart** | Poängfas i slumpade 1v1v1v1-lobbyer där spelets poäng skrivs in (max 60, valfritt antal omgångar). De X bästa (standard 8) går till heat om 4 där topp 2 går vidare till en final |
| **Gruppspel + slutspel** | Alla möter alla i grupper, de bästa till utslagning |
| **Utslagning / Dubbelutslagning** | Direkt till slutspelsträd |
| **Anpassat** | Bygg eget format fas för fas |

Allt går att anpassa per fas: antal grupper, hur många som går vidare, Bo1/Bo2/Bo3/Bo5/Bo7 per
runda (t.ex. separat för semifinal, final, undre final), poäng för vinst/oavgjort/förlust,
dubbelmöten, match om tredjepris, omstartad final, heatstorlek, antal race och poängtabell.
Seedningen kan flyttas om eller slumpas innan varje fas startar. Lag kan ha en spelarlista
med valfri lagstorlek (t.ex. 5 för CS2/Valorant).

## Spelarstatistik (CS2, Valorant, LoL, Rocket League eller eget spel)

Välj spel när turneringen skapas eller under **Mer → Spel & statistik**. Då dyker fliken
**Stats** upp:

1. Ladda upp en skärmbild av scoreboarden efter en karta (från Stats-fliken eller direkt i en match).
2. Mistral läser av varje spelares siffror (t.ex. K, D, A, MVP, poäng, skada) och kopplar
   spelarnamnen till lagens spelarlistor, även med klantaggar.
3. Du granskar och rättar siffrorna bredvid bilden och sparar.

Topplistan räknar ihop alla kartor: totalsummor (kills, MVP), snitt (t.ex. ACS) och
K/D, KDA och +/−. Sortera på valfri kolumn, filtrera på lag och sätt ett minsta antal kartor.

Avläsningen använder Mistrals gratisplan:
1. Skapa ett gratiskonto på [console.mistral.ai](https://console.mistral.ai). Inget betalkort behövs.
2. Skapa en API-nyckel under **API Keys** och klistra in den under **Mer → Spel & statistik**. Nyckeln sparas
   bara på enheten och följer inte med i säkerhetskopior.

Standardmodellen är `ministral-14b-latest`, den största modellen på gratisplanen som kan läsa bilder. På gratisplanen får Mistral använda bilderna
för att förbättra sina modeller. Webbversionen på claude.ai använder i stället ditt Claude-konto.

Utan AI går det att fylla i siffrorna själv – spelarlistan fylls i automatiskt.

## Funktioner

**Spelare**
- Lägg till en och en eller många på en gång (ett namn per rad, valfritt lag efter kommatecken)
- Redigera namn och lag, markera spelare som inaktiva (räknas inte i tabellen), ta bort
- Sök bland spelarna

**Lag**
- Två sätt att använda lag:
  - *Individuell turnering med lag* – spelarna tävlar var för sig men tillhör lag. Lagens poäng
    räknas ihop till en **lagtabell** (summa, snitt per medlem eller de X bästa i laget).
  - *Lagturnering* – lagen är deltagarna: poäng matas in per lag, med medlemslista per lag.
- Skapa lag manuellt, med färg, eller **fördela spelarna automatiskt** (slumpat eller jämna lag efter tabellen)
- Lottningens grupper kan sparas direkt som lag
- Slutspel kan spelas mellan spelare eller mellan lag

**Poäng**
- Omgångar (Omgång 1, 2, 3 …) som kan döpas om och tas bort
- Mata in poäng per spelare – Enter hoppar till nästa spelare
- Valbara snabbknappar (t.ex. `3, 1, 0` för vinst/oavgjort/förlust)
- Förloppsindikator som visar hur många som fått poäng i omgången
- Decimaler och minuspoäng stöds

**Tabell**
- Uppdateras automatiskt vid varje inmatning
- Särskiljning vid lika poäng: bästa omgång → snitt → namn (delad placering markeras med `=`)
- Pilar som visar klättring/fall sedan förra omgången
- Linje som markerar slutspelsgränsen (t.ex. topp 32)
- Tryck på en spelare för statistik: poäng och placering efter varje omgång
- Möjlighet att bara räkna de X bästa omgångarna
- Storbildsläge (stor text, skärmen hålls tänd) och dela tabellen som text

**Slutspel**
- Välj antal (4, 8, 16, 32, 64 eller eget antal) – de bästa i tabellen placeras in automatiskt
- Standardseedning (1 mot 32, 2 mot 31 …, där 1 och 2 bara kan mötas i finalen) eller slumpad lottning
- Antal som inte är en jämn trädstorlek ger walk over till de högst seedade
- Varning om delad poäng precis vid gränsen
- Tryck på en match för att skriva in resultat – vinnaren går automatiskt vidare
- Ändras ett tidigare resultat uppdateras senare matcher
- Match om tredjepris (valfri), vinnarbanner med pallplatser, dela slutspelet som text

**Mer**
- Flera turneringar (individuella eller lagturneringar), byt namn, kopiera spelarlistan till en ny turnering
- Matchtimer med larm (ljud + vibration), syns i toppfältet medan den går
- Lottning: slumpade par eller grupper, eller jämna grupper efter tabellen (ormfördelning)
- Slumpa en spelare
- Exportera/importera säkerhetskopia (JSON) och exportera tabellen som CSV (Excel)
- Ljust/mörkt tema
- Ångra efter borttagningar

## Projektstruktur

```
web/            Själva appen (HTML/CSS/JS) – fungerar även i en vanlig webbläsare
  logic.js      Tabellberäkning, seedning och slutspelsträd (ren logik)
  stages.js     Formatmotor: GSL, gruppspel, Swiss, utslagning, dubbelutslagning, heat
  stats.js      Spelarstatistik: speldefinitioner, topplistor, avläsning av scoreboards
  vendor/       Anthropics officiella JS-SDK (@anthropic-ai/sdk 0.131.0), paketerad för webbläsaren
  app.js        Gränssnittet
tests/          Tester för logiken (node --test tests/*.test.js)
tools/          Bygger den fristående Turnering.html
app/            Android-skal (WebView) som paketerar web/ till en APK
.github/        GitHub Actions som testar och bygger APK:n
```

### Bygga själv

Kräver JDK 17 och Android SDK:

```
./gradlew assembleRelease
# APK: app/build/outputs/apk/release/app-release.apk
```

Webbappen kan också provas direkt i datorn genom att öppna `web/index.html`, och
`node tools/build-single-html.js` bygger den fristående `Turnering.html`.

Signeringsnyckeln `app/turnering.keystore` ligger i repot med avsikt så att alla
byggen signeras likadant och kan installeras som uppdateringar. Byt till en egen
nyckel om appen ska publiceras på Google Play.
