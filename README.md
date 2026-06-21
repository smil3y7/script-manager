# Skriptarna

Centralni dashboard za poganjanje tvojih avtomatizacijskih skript - en seznam,
en gumb "Zaženi", izpis rezultata na enem mestu namesto razmetanih datotek po
računalnikih.

## Kako deluje

- `registry/scripts.json` - **register**. En vnos = ena skripta, ki se pojavi
  na dashboardu. To je edina datoteka, ki jo urejaš, ko dodajaš novo skripto.
- `scripts/python/` in `scripts/js/` - dejanske skripte.
- `app/api/run/[slug]/route.ts` - endpoint, ki prebere register in zažene
  ustrezno skripto kot podproces, ujame stdout/stderr in ju vrne dashboardu.
- `app/page.tsx` + `components/ScriptCard.tsx` - sam dashboard.

Trenutno sta noter dva primera (`hello-python`, `hello-js`) - služita kot
predloga za konvencijo. Lahko ju kasneje pobrišeš.

## Dodajanje nove skripte

1. Skripto skopiraj v `scripts/python/ime-skripte.py` ali `scripts/js/ime-skripte.js`.
2. V skripti beri vhodne podatke kot navadne CLI argumente (`sys.argv` /
   `process.argv`), izpisuj rezultat na stdout, napake na stderr.
3. Dodaj vnos v `registry/scripts.json`:

```json
{
  "slug": "moja-skripta",
  "name": "Ime, ki se prikaže na dashboardu",
  "description": "Kratek opis, kaj skripta dela.",
  "language": "python",
  "entry": "scripts/python/moja-skripta.py",
  "tags": ["scraping"],
  "inputs": [
    { "name": "url", "label": "URL", "type": "text", "default": "" }
  ],
  "timeout_ms": 30000
}
```

4. Commit + push - Vercel deploya samodejno (glej spodaj).

`inputs` lahko pustiš prazen seznam (`[]`), če skripta ne potrebuje nobenega
vnosa - takrat se na kartici prikaže samo gumb "Zaženi".

### Tip vnosa "password"

Za vnose, ki ne smejo biti vidni na zaslonu (gesla, žetoni), uporabi
`"type": "password"` namesto `"text"` - polje se prikaže maskirano.

### Skripte, ki jih dashboard ne more "Zagnati" (`language: "docs"`)

Nekatere skripte niso CLI orodja, ampak brskalniški bookmarkleti/devtools
console scripti (potrebujejo `document`, `indexedDB` ipd.) ali GUI aplikacije.
Teh dashboard ne more dejansko izvesti - namesto tega jih registriraj z
`"language": "docs"`. Gumb se takrat preimenuje v "Pokaži kodo" in ob kliku
samo prikaže vsebino datoteke za ročno kopiranje/uporabo, namesto da jo
poskuša pognati kot proces.

```json
{
  "slug": "moj-bookmarklet",
  "name": "Ime bookmarkleta",
  "description": "Kaj naredi in kje ga uporabiš (npr. devtools konzola).",
  "language": "docs",
  "entry": "scripts/docs/moj-bookmarklet.js",
  "tags": ["brskalnik"],
  "inputs": [],
  "note": "Kratko opozorilo/navodilo, prikazano na kartici."
}
```

Polje `note` (opcijsko, na voljo za vsak tip skripte) se prikaže kot amber
opozorilni okvir na kartici - uporabi ga za pomembne omejitve (npr. "deluje
samo lokalno", "pred uporabo zamenjaj geslo v kodi").

## Lokalni zagon

```bash
npm install
npm run dev
```

Stran je na `http://localhost:3000`. Node skripte delujejo takoj. Python
skripte delujejo lokalno, če imaš nameščen `python3` v PATH.

## Skripte, ki delujejo samo lokalno (ne na Vercel produkciji)

Nekaj registriranih skript bere/piše tvoj lokalni datotečni sistem
(SQLite baze, projektne mape, .ttf datoteke ob sebi). Take skripte imajo v
registru `note` polje, ki to izrecno pove, in se na dashboardu prikažejo z
amber opozorilnim okvirjem. Trenutno so to:

- `export-schema` - bere `.sqlite` datoteko s podane poti
- `autodoc-generate` - rekurzivno bere projektno mapo
- `fontconverter` - bere `.ttf` datoteko poleg same sebe
- `export-project-dump` - rekurzivno bere projektno mapo

Te lahko poganjaš prek dashboarda samo lokalno (`npm run dev`). Na Vercelu
bodo vrnile napako, ker pot, ki jo vpišeš, ne obstaja na Vercelovem
strežniku - to ni bug, ampak inherentna omejitev serverless okolja brez
dostopa do tvojega diska (glej tudi "Omejitve" spodaj).

## Pomembno: Python skripte na Vercelu

To je edina prava past pri tem pristopu, zato bodi pozoren:

**Next.js API routes (`app/api/...`) tečejo izključno v Node.js okolju.**
Ko deployaš na Vercel, ta projekt nima `python3` interpreterja na voljo
znotraj Node funkcije - `spawn("python3", ...)` bo na produkciji vrnil
napako, čeprav lokalno deluje (ker ti imaš Python nameščen na svojem
računalniku).

Trenutna koda to zazna in vrne razumljivo sporočilo o napaki namesto, da bi
se tiho zlomila - ampak Python skripte realno ne bodo delovale na Vercelu
brez ene od spodnjih rešitev.

### Rešitev A - Vercel Python Service (priporočeno, če imaš veliko Python skript)

Vercel zdaj podpira poganjanje cele Python aplikacije (npr. majhen FastAPI/
Flask strežnik) **poleg** Next.js frontenda v istem projektu, prek koncepta
"Services". V praksi to pomeni:

1. Dodaš mapo, npr. `api-python/`, z `requirements.txt` in vstopno datoteko
   (`main.py` ali `app.py`), ki izpostavi FastAPI/Flask app z enim endpointom
   na skripto (ali enim splošnim `/run/<slug>` endpointom, ki interno kliče
   pravo funkcijo).
2. Python skripte prepišeš iz "standalone CLI" v funkcije, ki jih ta FastAPI/
   Flask app kliče direktno (brez `subprocess` - kličeš Python funkcijo
   znotraj istega procesa).
3. Next.js dashboard kliče ta Python servis namesto lokalnega `spawn`.

Ker se Vercel-ova podpora za to redno posodablja, preveri trenutna navodila
tukaj, preden začneš: https://vercel.com/docs/functions/runtimes/python

### Rešitev B - prepiši v Node.js

Če je Python skripta preprosta (parsanje, klici API-jev, manipulacija
podatkov - torej večina "hitrih" avtomatizacij), jo je pogosto hitreje
prepisati v Node.js kot graditi ločen Python servis. Potem teče direktno
znotraj obstoječe `app/api/run/[slug]/route.ts` brez dodatne infrastrukture.

### Rešitev C - zunanji runner

Python skripto pustiš teči drugje (lokalno, na malem VPS-u, GitHub Actions
ipd.) in dashboard nanjo samo kliče prek HTTP-ja ali sproži prek webhooka.
Smiselno za tisto "daljšo" skripto, ki tako ali tako morda presega Vercelove
časovne omejitve izvajanja funkcij.

**Za zdaj:** dokler ne izbereš ene od zgornjih, Node skripte na dashboardu
delujejo na Vercelu takoj, Python skripte pa samo lokalno. To ti še vedno da
en centralen pregled in lokalno udobje "pritisni gumb" za vse, dokler se ne
odločiš, ali ti je vredno Python del preseliti.

## Deploy na Vercel

1. Ustvari prazen repo na GitHubu in vanj pushaj to mapo.
2. Na vercel.com -> "Add New Project" -> izberi repo. Vercel samodejno
   prepozna Next.js, dodatne nastavitve niso potrebne.
3. Vsak push na glavno vejo samodejno deploya novo verzijo.

## Omejitve, ki jih velja poznati

- **Brez trajnega shranjevanja zgodovine zagonov.** Vsak klic "Zaženi" je
  samostojen - rezultat vidiš v UI, ko se izvede, ni pa shranjen za nazaj.
  Če boš to kasneje rabil, je smiselno dodati majhno bazo (npr. Vercel
  Postgres ali KV) in beležiti vsak zagon.
- **Serverless funkcije so brez trajnega file sistema.** Če katera skripta
  bere/piše lokalne datoteke (cache, izvozi), to na Vercelu ne bo delovalo
  kot doma - rabi zunanje shranjevanje (npr. S3-kompatibilen storage) ali pa
  naj taka skripta ostane "lokalna" (Rešitev C zgoraj).
- **Časovna omejitev izvajanja.** `maxDuration` je v `route.ts` nastavljen na
  60 sekund - to je Vercel Pro privzeta zgornja meja za navadne funkcije.
  Free plan ima nižjo mejo. Za skripte, ki trajajo dlje, glej Rešitev C.
