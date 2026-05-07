# MaalariPro Lite

Yksinkertainen web-sovellus maalausurakoiden hinnoitteluun ja tarjousten hallintaan. Sovellus toimii kokonaan selaimessa — tilejä ei tarvita ja tiedot tallennetaan paikallisesti `localStorage`-muistiin.

> Tämä on Oulun ammattikorkeakoulun **Web-sovellusten perusteet** -opintojakson harjoitustyö (kevät 2026).

## Käyttötarkoitus

Maalareiden ja pienyrittäjien työkalu, jolla voi:

- laskea maalausurakan kokonaishinnan (pinta-alat, materiaalit, työ, kate, ALV)
- tallentaa tarjouksen ja palata siihen myöhemmin
- avata tulostettava tarjousnäkymä, jonka voi tulostaa tai tallentaa PDF:nä

## Ominaisuudet

- **Hinnoittelulaskuri** rivipohjaisesti (m² × €/m²) + materiaalit + työ + kate + ALV 25,5 %
- **Tallennetut tarjoukset** `localStorage`-muistissa — lista, muokkaus ja poisto
- **Tulostettava tarjousnäkymä** ja `window.print()`-tuki
- **Avoimen datan widget** etusivulla: Tilastokeskuksen rakennuskustannusindeksi
- **Responsiivinen** mobile-first käyttöliittymä (Tailwind CSS)
- **Useita sivuja** ja navigointi (Next.js App Router)
- **Suomenkielinen** käyttöliittymä

## Tekniikat

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 3](https://tailwindcss.com/)

## Käyttöönotto

Tarvitset [Node.js](https://nodejs.org/) version 18.17 tai uudemman.

```bash
git clone <repon-url> maalaripro-lite
cd maalaripro-lite
npm install
npm run dev
```

Avaa selaimessa: <http://localhost:3000>

> [!NOTE]
> Sovellus ei vaadi mitään API-avaimia eikä `.env`-tiedostoja. Avoimen datan rajapinta (Tilastokeskus) on julkinen.

### Tuotantoversio

```bash
npm run build
npm start
```

## Käyttöohje

1. **Etusivu** näyttää lyhyen esittelyn ja Tilastokeskuksen rakennuskustannusindeksin viimeisimmät arvot.
2. **Laskuri** (`/laskuri`):
   - Täytä asiakkaan nimi ja kohde.
   - Lisää maalausrivejä (kuvaus, pinta-ala m², yksikköhinta €/m²). Voit lisätä useita rivejä.
   - Anna materiaalikulut, työtunnit, tuntihinta ja katetavoite.
   - Yhteenveto päivittyy reaaliajassa. Klikkaa **Tallenna tarjous**.
3. **Tarjoukset** (`/tarjoukset`):
   - Näe kaikki tallennetut tarjoukset.
   - **Avaa** näyttää tulostettavan tarjousnäkymän — paina **Tulosta** sivun yläreunasta.
   - **Muokkaa** lataa tarjouksen takaisin laskuriin.
   - **Poista** poistaa tarjouksen pysyvästi (vahvistuksen jälkeen).

Ensimmäisellä käyttökerralla sovellukseen luodaan automaattisesti **kaksi esimerkkitarjousta**, jotta toimintoja pääsee heti kokeilemaan. Esimerkit voi poistaa normaalisti.

## Käytetty avoin data

**Tilastokeskus — Rakennuskustannusindeksi (2021 = 100)**

- Rajapinta: <https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/rki/statfin_rki_pxt_142p.px>
- Tietokanta: <https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/StatFin__rki/statfin_rki_pxt_142p.px/>
- Lisenssi: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.fi)
- Ei vaadi rekisteröitymistä eikä API-avainta.

Rajapintaa kutsutaan suoraan selaimesta (`POST` JSON-kyselyllä). Sovellus hakee 14 viimeisintä kuukausihavaintoa kokonaisindeksistä ja näyttää uusimman arvon, vuosimuutoksen sekä trendiviivan.

## Projektin rakenne

```
maalaripro-lite/
├── app/                    Next.js App Router -sivut
│   ├── page.tsx            Etusivu
│   ├── laskuri/            Hinnoittelulaskuri
│   └── tarjoukset/         Tarjouslista + yksittäisen tarjouksen näkymä
├── components/             React-komponentit
│   └── ui/                 Yleiset UI-elementit (Button, Card, Input)
├── lib/                    Logiikka
│   ├── pricing.ts          Laskentafunktiot (puhtaat funktiot)
│   ├── storage.ts          localStorage-wrapper + demo-data
│   ├── stat-fi.ts          Tilastokeskus-rajapinta
│   └── types.ts            TypeScript-tyypit
└── README.md
```

## Sovelluslogiikka

Hinnan muodostus (`lib/pricing.ts`):

1. **Rivien yhteissumma** = Σ (pinta-ala × €/m²)
2. **Työn hinta** = tunnit × tuntihinta
3. **Välisumma** = rivien yhteissumma + materiaalit + työ
4. **Kate** = välisumma × kateprosentti
5. **Veroton hinta** = välisumma + kate
6. **ALV** = veroton × 25,5 %
7. **Loppusumma** = veroton + ALV

## Käytetyt apuvälineet ja lähteet

- [Next.js -dokumentaatio](https://nextjs.org/docs) (App Router, asennus)
- [Tailwind CSS -dokumentaatio](https://tailwindcss.com/docs)
- [Tilastokeskuksen PxWeb API -ohje](https://www.stat.fi/tup/tilastotietokannat/api-ohje.html)
- Käytetty **GitHub Copilot** -avustajaa koodin kirjoittamisessa.

## Tietosuoja

Sovellus ei lähetä mitään tietoja palvelimille. Kaikki tarjoustiedot säilyvät vain käyttäjän omassa selaimessa (`localStorage`). Tilastokeskuksen avoin data haetaan suoraan selaimesta heidän julkisesta rajapinnastaan.

## Lisenssi

Vain opetuskäyttöön. Ei takuuta.
