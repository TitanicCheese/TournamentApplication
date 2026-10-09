# Turnering – turneringsapp för Android

En app för att köra turneringar direkt i mobilen: skriv in spelare, mata in poäng
omgång för omgång, se en tabell som uppdateras automatiskt och skapa ett slutspel
där t.ex. topp 32 från tabellen seedas in i ett slutspelsträd.

## Installera på Android

1. Gå till **Releases** i det här repot på mobilen och öppna **Senaste version**.
2. Ladda ner `Turnering.apk` och öppna filen.
3. Tillåt installation från okända källor om telefonen frågar (gäller webbläsaren/filhanteraren).

En ny APK byggs automatiskt av GitHub Actions vid varje push. Nya versioner kan
installeras ovanpå den gamla – dina turneringar finns kvar.

> All data sparas lokalt i telefonen. Använd **Mer → Exportera säkerhetskopia**
> då och då, särskilt innan du avinstallerar appen.

## Funktioner

**Spelare**
- Lägg till en och en eller många på en gång (ett namn per rad, valfri klubb efter kommatecken)
- Redigera namn/klubb, markera spelare som inaktiva (räknas inte i tabellen), ta bort
- Sök bland spelarna

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
- Flera turneringar, byt namn, kopiera spelarlistan till en ny turnering
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
  app.js        Gränssnittet
tests/          Tester för logiken (node --test tests/*.test.js)
app/            Android-skal (WebView) som paketerar web/ till en APK
.github/        GitHub Actions som testar och bygger APK:n
```

### Bygga själv

Kräver JDK 17 och Android SDK:

```
./gradlew assembleRelease
# APK: app/build/outputs/apk/release/app-release.apk
```

Webbappen kan också provas direkt i datorn genom att öppna `web/index.html`.

Signeringsnyckeln `app/turnering.keystore` ligger i repot med avsikt så att alla
byggen signeras likadant och kan installeras som uppdateringar. Byt till en egen
nyckel om appen ska publiceras på Google Play.
