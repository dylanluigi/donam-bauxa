# Dona'm Bauxa — Disseny Conceptual i Estructural (P1)
**Assignatura:** Tecnologia Multimèdia · **Branca:** `interficie-sola`

---

## 1. Concepte i Enfocament del Projecte

### El problema real
La cultura musical de Mallorca és rica i diversa, però la seva informació està **fragmentada**: cada sala publica els seus events a Instagram, els festivals tenen webs pròpies poc optimitzades i els artistes locals no disposen d'un espai de visibilitat centralitzat. L'usuari que vol saber "on hi ha música en directe aquest cap de setmana a Mallorca" no té una resposta única i fiable.

### La solució: Dona'm Bauxa
Plataforma web centralitzada, **100% en català**, per descobrir música en viu, artistes i festivals a Mallorca. Integra en un sol lloc:
- Descoberta d'artistes locals
- Agenda d'events filtrable i geolocalitzada
- Mapa interactiu de Mallorca
- Personalització per a l'usuari (favorits, calendari)

### Proposta diferenciadora
| Competidor típic | Dona'm Bauxa |
|-----------------|--------------|
| Webs de sales (1 sala, 1 web) | Totes les sales i formats en un sol lloc |
| Xarxes socials (efímer, no filtrable) | Agenda estructurada, filtrable per data/zona/gènere |
| Agenda genèrica (nacional) | Hiperlocalitzada a Mallorca, en català, amb zones de l'illa |
| Sense context d'artista | Fitxes completes amb discografia, membres i links a Spotify |
| Sense geolocalització | Mapa interactiu de l'illa amb tots els events |

**Valor afegit clau**: la combinació de mapa geogràfic + filtre per zones de Mallorca + export al calendari personal és única en l'ecosistema cultural mallorquí.

### Target d'usuaris
- **Usuari principal**: Resident o visitant de Mallorca (16–60 anys) que busca plans musicals en directe
- **Usuari secundari**: Músic o banda emergent que vol visibilitat local
- **Usuari administrador**: Organitzador cultural o gestor de la plataforma (Google OAuth)

---

## 2. Arquitectura de la Informació

### 2.1 Jerarquia de continguts

```
DONA'M BAUXA
├── Home (punt d'entrada)
│   ├── Events Destacats    ← contingut editorial (curated)
│   ├── Pròxims Events      ← contingut dinàmic (per data)
│   ├── Artistes Destacats  ← contingut editorial
│   ├── Notícies            ← contingut editorial
│   └── CTA → Mapa
│
├── Artistes                ← directori complet
│   ├── [cerca + filtres]
│   └── Fitxa d'artista (modal)
│       ├── Bio, gèneres, zona
│       ├── Membres
│       ├── Discografia
│       └── Links (Spotify, Instagram)
│
├── Agenda                  ← directori complet
│   ├── [cerca + filtres avançats]
│   └── Detall d'event (modal)
│       ├── Lloc + adreça
│       ├── Data/hora + preu
│       ├── Artista actuant
│       └── [Afegir al calendari .ics]
│
├── Mapa                    ← vista geogràfica
│   ├── [filtres: zona + categoria]
│   ├── Marcadors d'events
│   └── Sidebar d'events sincronitzat
│
├── Favorits                ← personalització
│   ├── Artistes guardats
│   └── Events guardats
│
└── Admin                   ← gestió de continguts (restringit)
    ├── [Login Google OAuth]
    └── Formulari: afegir artista
        └── Preview JSON Schema.org
```

### 2.2 Flux de navegació

```
[Entrada: URL / / #home]
         │
    ┌────▼────┐
    │  HOME   │ ← punt d'entrada principal
    └────┬────┘
         │  L'usuari escaneja highlights
         │
    ┌────▼──────────────────────────┐
    │  Quina necessitat té?         │
    └───┬─────────┬────────┬────────┘
        │         │        │
   Vol trobar  Vol veure  Vol guardar
   artistes    on és      coses
        │         │        │
   ┌────▼──┐ ┌───▼──┐ ┌───▼─────┐
   │ARTIS- │ │ MAPA │ │FAVORITS │
   │ TES   │ │      │ │         │
   └────┬──┘ └───┬──┘ └─────────┘
        │         │
   Modal de    Popup de
   detall      l'event
        │         │
   ┌────▼─────────▼──────────┐
   │      AGENDA (#events)    │
   │  [filtra per data/zona]  │
   └────────────┬─────────────┘
                │
         Detall d'event
                │
        ┌───────▼───────┐
        │ Export .ics   │ → Google Calendar / iCal
        └───────────────┘
```

### 2.3 Wireframes de cada pàgina

**HOME**
```
┌──────────────────────────────────────────────────────┐
│ [Logo Dona'm Bauxa]  Home Artistes Agenda Mapa ♥(3)  │  ← navbar sticky
├──────────────────────────────────────────────────────┤
│                                                      │
│   Descobreix la Bauxa de Mallorca                    │  ← hero section
│   Música en directe. Artistes locals. Ara.           │
│   [Veure Agenda]  [Explorar Artistes]                │
│                                                      │
├──────────────────────────────────────────────────────┤
│  EVENTS DESTACATS                                    │
│  ┌──────────────┐ ┌──────────────┐                   │  ← 2 cols, 50% cada
│  │ 🎵 [Concert] │ │ 🎵 [Festi.]  │                   │     gradient + overlay
│  │ Nom Event    │ │ Nom Event    │                   │
│  │ 15 Mar · Palma│ │ 22 Mar · Sineu│                  │
│  │ Artista      │ │ Artista      │                   │
│  │ 15€ [📅]    │ │ Gratis [📅] │                   │
│  └──────────────┘ └──────────────┘                   │
├──────────────────────────────────────────────────────┤
│  PRÒXIMS ESDEVENIMENTS                               │
│  ┌──┐ Nom event              [Concert] [Rock] [Palma]│  ← card horitzontal
│  │15 │ Artista · Sala · 21h                  12€     │     data box esquerra
│  │MAR│                                       [📅][♥]│
│  └──┘                                               │
│  ┌──┐ Nom event              [Festival] [Jazz]       │
│  │22 │ ...                                           │
│  └──┘                                               │
├──────────────────────────────────────────────────────┤
│  ARTISTES DESTACATS                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │  ← grid 4 cols
│  │ [SVG]  │ │ [SVG]  │ │ [SVG]  │ │ [SVG]  │        │
│  │  Nom   │ │  Nom   │ │  Nom   │ │  Nom   │        │
│  │ [Pop]  │ │ [Rock] │ │[Indie] │ │ [Jazz] │        │
│  │[Palma] │ │[Palma] │ │[Sineu] │ │[Manacor│        │
│  │[+Info] │ │[+Info] │ │[+Info] │ │[+Info] │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
├──────────────────────────────────────────────────────┤
│  NOTÍCIES                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  ← 3 cols
│  │ [Gradient│ │ [Gradient│ │ [Gradient│             │
│  │  + ♪ ]  │ │  + ♪ ]  │ │  + ♪ ]  │             │
│  │ Titular  │ │ Titular  │ │ Titular  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
├──────────────────────────────────────────────────────┤
│  ████████ Explora el mapa de la bauxa [Veure Mapa]   │  ← CTA gradient
├──────────────────────────────────────────────────────┤
│  Dona'm Bauxa | Artistes | Zones | Contacte          │  ← footer
└──────────────────────────────────────────────────────┘
```

**ARTISTES**
```
┌──────────────────────────────────────────────────────┐
│ [Navbar]                                             │
├──────────────────────────────────────────────────────┤
│  🎵 Artistes de Mallorca                             │
│  Descobreix el talent local                          │
├──────────────────────────────────────────────────────┤
│  [🔍 Cerca artista...]  [Gènere ▾]  [Zona ▾]  [✕]  │  ← filter bar
│  Mostrant 14 artistes                                │
├──────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ [SVG]  │ │ [SVG]  │ │ [SVG]  │  ...              │  ← grid responsive
│  │  Nom   │ │  Nom   │ │  Nom   │                   │
│  │ [Rock] │ │ [Pop]  │ │[Indie] │                   │
│  │ Palma  │ │ Sineu  │ │ Palma  │                   │
│  │ ♥ [+]  │ │ ♥ [+]  │ │ ♥ [+]  │                   │
│  └────────┘ └────────┘ └────────┘                   │
└──────────────────────────────────────────────────────┘

MODAL ARTISTA (overlay):
┌──────────────────────────────────────────────────────┐
│  [Foto artista]     Nom Artista              [✕]    │
│  [Pop] [Rock] · Palma · Fundat 2015                  │
│  ─────────────────────────────────────────────────  │
│  Bio: Lorem ipsum descripcio de l'artista...         │
│  Membres: Nom1, Nom2, Nom3                           │
│  Àlbums: Títol (2020), Títol (2023)                  │
│  [🎵 Spotify]  [📷 Instagram]  [🌐 Wikipedia]        │
└──────────────────────────────────────────────────────┘
```

**AGENDA**
```
┌──────────────────────────────────────────────────────┐
│ [Navbar]                                             │
├──────────────────────────────────────────────────────┤
│  📅 Agenda Musical                                   │
├──────────────────────────────────────────────────────┤
│  [🔍 Cerca...]  [Gènere ▾]  [Zona ▾]  [Categoria ▾] │  ← fila 1 filtres
│  [Des de 📅]  [Fins a 📅]                    [✕]   │  ← fila 2 filtres
│  Mostrant 15 esdeveniments                           │
├──────────────────────────────────────────────────────┤
│  ┌──┐ Nom Event                  [Concert][Rock]     │
│  │15 │ Artista · Sala Can Bufí · 21:00h     15€     │
│  │MAR│ 📍 Carrer..., Palma                  [📅][♥] │
│  └──┘                                               │
│  ┌──┐ Nom Festival               [Festival][Jazz]   │
│  │22 │ Artista1, Artista2 · Parc...  Gratis [📅][♥] │
│  └──┘                                               │
└──────────────────────────────────────────────────────┘
```

**MAPA**
```
┌──────────────────────────────────────────────────────┐
│ [Navbar]                                             │
├──────────────────────────────────────────────────────┤
│  🗺 Mapa de Bauxa                                    │
├───────────────────────────────────┬──────────────────┤
│  [Zona ▾]  [Categoria ▾]  [✕]    │  Esdeveniments   │
│                                   │  ┌──┐ Nom Event  │
│  ┌─────────────────────────────┐  │  │15 │ Palma     │
│  │                             │  │  └──┘            │
│  │   MAPA INTERACTIU           │  │  ┌──┐ Nom Event  │
│  │   Mallorca (Leaflet.js)     │  │  │22 │ Sineu     │
│  │                             │  │  └──┘            │
│  │  🔴 Concert                 │  │  ┌──┐ ...        │
│  │  🟡 Festival                │  │  │   │           │
│  │  🟢 Festa Popular           │  │  └──┘            │
│  │                             │  │                  │
│  └─────────────────────────────┘  │  (scrollable)    │
│  ● Concert  ● Festival  ● Festa   │                  │
├───────────────────────────────────┴──────────────────┤
└──────────────────────────────────────────────────────┘
```

**FAVORITS**
```
┌──────────────────────────────────────────────────────┐
│ [Navbar]                                             │
├──────────────────────────────────────────────────────┤
│  ♥ Els Meus Favorits                                 │
├──────────────────────────────────────────────────────┤
│  ARTISTES FAVORITS                                   │
│  [cards d'artistes guardats o estat buit]            │
│                                                      │
│  EVENTS FAVORITS                                     │
│  [cards d'events guardats o estat buit]              │
│                                                      │
│  [Estat buit: ♥ No tens res guardat encara.          │
│   Explora artistes i events!]                        │
└──────────────────────────────────────────────────────┘
```

**ADMIN**
```
┌──────────────────────────────────────────────────────┐
│ [Navbar] (link Admin visible si autenticat)          │
├──────────────────────────────────────────────────────┤
│  [No autenticat]           │  [Autenticat]           │
│  🔒 Accés restringit       │  AFEGIR ARTISTA         │
│  [Inicia sessió amb Google]│  Nom *  [__________]   │
│                            │  Gèneres * [_________]  │
│                            │  Descripció * [______]  │
│                            │  Any fundació [______]  │
│                            │  Zona [Palma ▾]         │
│                            │  Spotify [__________]   │
│                            │  Membres [__________]   │
│                            │  Àlbum [____] Any [__]  │
│                            │  [+ Afegir Àlbum]       │
│                            │  ▶ Preview JSON         │
│                            │  [Afegir Artista]       │
└──────────────────────────────────────────────────────┘
```

---

## 3. Disseny Gràfic i Coherència Visual

### 3.1 Identitat visual

**Dona'm Bauxa** és una expressió mallorquina que significa *"Dóna'm festa/alegria"*. La identitat visual reflecteix:
- **Calidesa mediterrània**: colors terrosos i ocres que evoquen la terra de Mallorca
- **Elegància cultural**: tipografia serif per als títols, sans-serif per al cos
- **Energia musical**: patrons gràfics amb símbols musicals, gradients vibrants per a les cards

### 3.2 Sistema tipogràfic

| Rol | Font | Pes | Ús |
|-----|------|-----|----|
| Títols principals | Playfair Display | 700–800 | `<h1>`, `<h2>`, seccions hero |
| Subtítols | Playfair Display | 700 | `<h3>`, `<h4>` |
| Cos de text | Inter | 400–500 | Paràgrafs, descripcions |
| UI / etiquetes | Inter | 600–700 | Botons, badges, nav |
| Logos/inicials SVG | Georgia (serif) | Bold | Placeholders d'artista |

**Justificació**: Playfair Display aporta prestigi i caràcter cultural (associat a disseny editorial i arts); Inter és la sans-serif de referència per a legibilitat en pantalla. El contrast serif/sans-serif crea jerarquia visual clara.

### 3.3 Paleta de colors

| Token | Hex | Ús |
|-------|-----|----|
| `--color-primary` | `#C45A3C` | Accions principals, concerts, CTA |
| `--color-secondary` | `#1B4965` | Fons foscos, secondary actions |
| `--color-secondary-dark` | `#0F2E42` | Fons més profunds, footer |
| `--color-accent` | `#6B8E4E` | Festes populars, èxits positius |
| `--color-festival` | `#D4A843` | Festivals, destacats daurats |
| `--color-neutral` | `#F8F5F0` | Fons principals |
| `--color-text` | `#1A1A1A` | Text principal |

**Sistema de codificació per categoria** (consistent en tota l'app):

```
Concert     → #C45A3C (vermell terrós)    ← marcador mapa + badge + card gradient
Festival    → #D4A843 (daurat)            ← marcador mapa + badge + card gradient
Festa pop.  → #6B8E4E (verd oliva)        ← marcador mapa + badge + card gradient
```

### 3.4 Components visuals del sistema

**Cards d'events (featured)**: gradient 135° combinant 2 colors de la paleta + overlay semitransparent amb icones musicals (♪ ♫ ♩) + contingut alineat a la part inferior. Permet reconèixer la categoria a cop d'ull.

**Cards d'events (llista)**: layout horitzontal — caixa de data colorejada (46×56px) a l'esquerra, informació a la dreta. Optimitza l'escaneig visual d'una llista llarga.

**Cards d'artistes**: imatge quadrada (SVG placeholder amb inicials + gradient únic per artista) + badge de zona a la cantonada superior dreta + gèneres com a pills de colors.

**Badges**: sistema de pills de color codificat per categoria, gènere i zona. Petits, densos d'informació, mai el color com a únic diferenciador (sempre text).

**Animacions**: `fade-in-up` amb retard escalonat de 50ms entre elements del mateix grup → percepció de càrrega progressiva i dinàmica.

---

## 4. Experiència d'Usuari (UX)

### 4.1 Principis aplicats

**Reconeixement sobre memòria**: els colors de categoria (vermell/daurat/verd) apareixen de forma consistent en badges, marcadors del mapa i cards. L'usuari aprèn una sola vegada el sistema i el reconeix a qualsevol pantalla.

**Progressió natural**: el Home mostra una selecció curada → l'usuari pot aprofundir a Artistes o Agenda → pot geolocalitzar via Mapa → pot personalitzar via Favorits. Cada pas afegeix profunditat sense forçar.

**Feedback immediat**: filtratge en temps real sense botó "Aplicar" → l'usuari veu els resultats a mesura que escriu o selecciona. El comptador dinàmic ("Mostrant X resultats") confirma l'acció.

**Prevenció d'errors**: botó "Netejar filtres" sempre visible quan hi ha filtres actius. Camp obligatori marcat amb `*`. Missatge d'estat buit clar en lloc de llista buida silenciosa.

**Accessibilitat**: skip-to-content link, ARIA labels en botons interactius, alt text en imatges, contrast suficient entre text i fons, navegació per teclat (Bootstrap + HTML semàntic).

### 4.2 Decisions de UX justificades

| Decisió | Justificació |
|---------|-------------|
| **SPA (hash routing)** | Navegació instantània sense recàrregues. L'usuari pot comparar artistes i events sense esperar. |
| **Modal per a detalls** | No perd el context de la llista en la que estava (no es navega a una nova pàgina). |
| **Filtre en 2 files a Agenda** | Evita scroll horitzontal en mòbil. Agrupa cerca+filtres principals (fila 1) i data+categoria (fila 2). |
| **Sidebar al Mapa** | L'usuari veu simultàniament el mapa i la llista → pot explorar geogràficament i llegir detalls sense moure's. |
| **Favorits per localStorage** | No requereix registre → elimina fricció. L'usuari pot guardar coses des del primer moment. |
| **Export .ics** | Integra l'app amb el calendari que l'usuari ja utilitza. Redueix el pas de recordar l'event. |
| **Badge al navbar** | L'usuari sap quants favorits té en qualsevol moment sense haver de navegar a la pàgina. |

### 4.3 Estratègia responsive (Mobile-first)

| Breakpoint | Layout |
|-----------|--------|
| **< 576px** (mòbil) | 1 columna, hamburger menu, cards full-width, filtres en acordió |
| **576–768px** (mòbil gran) | 2 columnes per a artistes, cards compactes |
| **768–992px** (tablet / md) | 2 columnes events destacats, navbar horitzontal, 3 cols artistes |
| **> 992px** (escriptori / lg) | Layout complet: 4 cols artistes, 2 cols mapa+sidebar, featured 50% |

**Estratègia**: tots els components estan construïts amb el grid de Bootstrap 12 columnes. Les classes `col-md-*` i `col-lg-*` gestionen automàticament la recomposició en cada breakpoint. El navbar passa a hamburger en mòbil (`navbar-toggler`). Els filtres del mapa es col·lapsen verticalment.

---

## 5. Justificació Tècnica

### 5.1 Stack tecnològic i raonament

| Capa | Tecnologia | Per què |
|------|-----------|---------|
| **Frontend** | Vanilla JS (ES6 modules) | Sense dependències de framework → bundle mínim, control total del DOM, sense overhead de React/Vue. Adequat per a una SPA sense estat complex. |
| **Backend** | Node.js + Express 4.x | Lleuger, àmplia comunitat, perfecte per a servir estàtics + API REST simple. |
| **Autenticació** | Google OAuth 2.0 (Passport.js) | Delega la seguretat a Google. Cap gestió de contrasenyes. El correu de Google és el token d'identitat. |
| **Mapes** | Leaflet.js 1.9.4 + OpenStreetMap | Open-source, lleuger (42KB), sense API key ni costos. Google Maps cobraria a partir d'un llindar d'ús. |
| **Dades** | JSON (Schema.org) | Fitxers estàtics, zero base de dades. Lleuger, versionable amb Git, llegible per humans. Schema.org aporta SEO semàntic. |
| **Routing** | Hash-based (#hash) | Funciona sense servidor (pot ser 100% estàtic). No requereix configuració de rutes al servidor. |
| **UI** | Bootstrap 5.3.3 | Grid system robust, components accessibles, responsive out-of-the-box. Classes `bauxa` personalitzades a sobre per a la identitat pròpia. |
| **Fonts** | Google Fonts (CDN) | Càrrega asíncrona (no bloqueja renderització). `preconnect` + `dns-prefetch` minimitzen el temps de connexió. |

### 5.2 Gestió de dades (JSON)

Totes les dades s'emmagatzemen en 3 fitxers JSON seguint el vocabulari **Schema.org**:

```
/frontend/data/
├── artists.json   → ItemList de MusicGroup      (14 artistes)
├── events.json    → ItemList de MusicEvent       (15 events)
└── news.json      → ItemList de NewsArticle      (6 notícies)
```

**Per què Schema.org**: els cercadors (Google, Bing) llegeixen i interpreten Schema.org nativament → els events apareixen a Google com a *Rich Results* (events cards a la SERP). Els artistes poden aparèixer al Knowledge Graph.

**Caché client-side**: el mòdul `dataLoader.js` implementa un sistema de caché a memòria. El primer accés fa `fetch()` al JSON; els accessos posteriors reutilitzen les dades → zero peticions redundants.

**Estratègia d'escriptura**: l'admin fa `POST /api/artists` → Express escriu directament al fitxer `artists.json` → persistència simple sense BBDD. Escalable a una base de dades real en fases posteriors.

### 5.3 APIs i integracions

| Integració | Endpoint / Llibreria | Justificació |
|-----------|---------------------|-------------|
| **Google OAuth** | `GET /auth/google` → callback | Seguretat delegada. Whitelist d'emails admins per variable d'entorn. |
| **Leaflet.js** | CDN (lazy-load en accés a #map) | Carregat sota demanda: no penalitza el temps de càrrega inicial si l'usuari no va al mapa. |
| **OpenStreetMap** | tiles `tile.openstreetmap.org` | Gratuït, sense límits d'ús per a projectes educatius. |
| **Spotify** | Links externs `open.spotify.com` | No requereix API key. Els links a perfils/tracks funcionen sense autenticació. |
| **ICS export** | Generació client-side (JS) | Cap servidor necessari. El fitxer es genera al navegador i es descarrega localment. |

### 5.4 Estratègia multimèdia

**Imatges**: format AVIF (primera opció) → WebP (fallback) → JPEG (fallback final). L'element `<picture>` tria automàticament el format suportat. Lazy loading natiu (`loading="lazy"`) + `fetchpriority="high"` per a la imatge hero.

**SVG placeholders**: mentre no hi ha foto real, les cards mostren un SVG generat dinàmicament amb les inicials de l'artista i un color de gradient únic derivat del nom. Evita broken images i manté el layout consistent.

**Patrons musicals**: les cards d'events destacats usen un SVG inline amb símbols musicals (♪ ♫ ♩) com a textura de fons → element visual sense pes de fitxer.

**Rendiment**:
- CSS crític inline (`main.min.css` síncron) → primer paint ràpid
- Fonts i icones carregades asíncronament (`onload`) → no bloquegen el render
- `modulepreload` per als mòduls JS crítics → paral·lelitza la càrrega

### 5.5 Seguretat

- HTTPS forçat en producció (redirect 301)
- Sessions amb `sameSite: 'lax'` + `secure: true` (HTTPS-only)
- Whitelist d'emails admins per variable d'entorn (`ADMIN_EMAILS`) → cap admin hardcoded al codi
- Validació de camps obligatoris abans del `POST` a l'API
- Variables sensibles en `.env` (mai al repositori Git)

---

## 6. Flux Principal d'Ús

### Flux usuari (descoberta)
```
Arriba a Home → escaneja destacats
     │
     ├─ Vol un artista? → #artists → cerca/filtre → modal detall → [♥ guardar]
     │
     ├─ Vol un event?  → #events  → filtre data/zona → modal → [📅 exportar] [♥ guardar]
     │
     ├─ Vol veure on? → #map → mapa Mallorca → clic marcador → popup info
     │
     └─ Vol els seus guardats? → #favorits → artistes + events guardats
```

### Flux administrador (gestió)
```
Navbar → "Inicia sessió" → Google OAuth
     │
     └─ Email verificat com admin?
           ├─ Sí → formulari Admin → omple camps → preview JSON → [Afegir]
           └─ No → missatge "No autoritzat"
```

---

## 7. Interaccions de l'Usuari

| Interacció | Resposta | Principi UX |
|------------|----------|------------|
| Escriure a la cerca | Filtre en temps real + actualitza comptador | Feedback immediat |
| Seleccionar filtre desplegable | Actualitza llista + comptador | Feedback immediat |
| Clic ♥ (favorit) | Toggle + badge navbar actualitzat | Reconeixement, feedback |
| Clic card artista/event | Obre modal (sense canviar de pàgina) | Manté context |
| Clic "Afegir al calendari" | Descarrega `.ics` | Integració amb entorn |
| Clic marcador del mapa | Popup amb info de l'event | Reconeixement geo |
| Canviar filtre al mapa | Actualitza marcadors + sidebar sincronitzat | Coherència sistema |
| Clic "Netejar filtres" | Reset complet de tots els filtres | Prevenció d'errors |
| Resize finestra | Layout responsive automàtic | Adaptació contextual |
| Scroll avall | Apareix botó "Tornar amunt" | Eficiència navegació |
| Enviament formulari admin | Validació → preview JSON → POST → confirmació | Prevenció d'errors |

---

## 8. Tipus de Continguts Gestionats

### Artistes — `Schema.org/MusicGroup` · `artists.json`

```json
{
  "@type": "MusicGroup",
  "@id": "artist-1",
  "name": "Nom del grup",
  "description": "Biografia...",
  "genre": ["Pop", "Rock"],
  "foundingDate": "2015",
  "foundingLocation": { "name": "Palma", "addressRegion": "Mallorca" },
  "image": "/assets/images/artists/nom.jpg",
  "member": [{ "@type": "Person", "name": "Membre 1" }],
  "album": [{ "@type": "MusicAlbum", "name": "Títol", "datePublished": "2023" }],
  "sameAs": ["https://open.spotify.com/...", "https://instagram.com/..."],
  "areaServed": "Palma",
  "additionalProperty": [{ "name": "featured", "value": true }]
}
```

### Esdeveniments — `Schema.org/MusicEvent` · `events.json`

```json
{
  "@type": "MusicEvent",
  "@id": "event-1",
  "name": "Nom de l'event",
  "startDate": "2026-03-15T21:00:00+01:00",
  "endDate": "2026-03-16T01:00:00+01:00",
  "location": {
    "@type": "Place",
    "name": "Sala...",
    "address": { "streetAddress": "...", "addressLocality": "Palma" },
    "geo": { "latitude": 39.5696, "longitude": 2.6502 }
  },
  "performer": { "@id": "artist-1", "name": "Nom artista" },
  "offers": { "price": "15", "priceCurrency": "EUR", "url": "https://..." },
  "genre": ["Rock"], "zone": "Palma", "category": "concert", "featured": true
}
```

### Notícies — `Schema.org/NewsArticle` · `news.json`

```json
{
  "@type": "NewsArticle",
  "headline": "Titular de la notícia",
  "description": "Resum...",
  "datePublished": "2026-03-01",
  "author": { "name": "Redacció Dona'm Bauxa" },
  "category": "Festivals"
}
```

**Estadístiques actuals**: 14 artistes · 15 events · 6 notícies · 3 categories · 6 zones · 6 gèneres

---

## 9. Integracions Previstes

| Integració | Tecnologia | Propòsit | Estat |
|-----------|-----------|---------|-------|
| **Google OAuth 2.0** | Passport.js + passport-google-oauth20 | Autenticació admin sense gestió de contrasenyes | Implementat (main) |
| **Mapes interactius** | Leaflet.js 1.9.4 | Visualització geogràfica dels events | Estructura HTML llesta |
| **OpenStreetMap** | Tile layer OSM | Mapa base gratuït i sense API key | Integrat amb Leaflet |
| **Geolocalització** | lat/lng als events (Schema.org GeoCoordinates) | Posicionament de marcadors al mapa | Dades llestes |
| **Spotify** | Links externs a perfils/tracks | Accés directe a la música des de la fitxa d'artista | Implementat (links) |
| **Export Calendari** | Format iCalendar (.ics) generat client-side | Afegir events a Google Calendar / iCal / Outlook | Mòdul pendent |
| **Google Fonts** | CDN asíncron | Inter + Playfair Display | Implementat |
| **Bootstrap** | Bootstrap 5.3.3 + Icons 1.11.3 | UI responsive + iconografia | Implementat |
| **Schema.org** | Estàndard semàntic web | SEO rich results (events a Google) | Implementat (dades) |

---

## 10. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                      NAVEGADOR                          │
│                                                         │
│  index.html (shell SPA)                                 │
│  ├── [Navbar] ← auth state                              │
│  ├── [Vista Home]    ─┐                                 │
│  ├── [Vista Artistes]  │  mostrada/ocultada             │
│  ├── [Vista Agenda]    │  per router.js                 │
│  ├── [Vista Mapa]      │  segons el #hash               │
│  ├── [Vista Favorits] ─┘                                │
│  └── [Vista Admin]                                      │
│                                                         │
│  JS Modules:                                            │
│  app.js → router.js → { renderer, filters, dataLoader, │
│            favorites, mapModule, calendar, admin, ui }  │
│                                                         │
│  Storage: localStorage (bauxa_fav_artists, _events)     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (fetch JSON / API)
┌────────────────────────▼────────────────────────────────┐
│                   EXPRESS SERVER                        │
│                                                         │
│  GET  /data/*.json      → fitxers JSON estàtics         │
│  GET  /auth/google      → inicia OAuth                  │
│  GET  /auth/google/callback → verifica + sessió         │
│  GET  /auth/me          → estat autenticació            │
│  POST /api/artists      → afegeix artista (admin)       │
│                                                         │
│  frontend/data/                                         │
│  ├── artists.json  (14 MusicGroup)                      │
│  ├── events.json   (15 MusicEvent)                      │
│  └── news.json     (6 NewsArticle)                      │
└────────────────────────┬────────────────────────────────┘
                         │ OAuth
┌────────────────────────▼────────────────────────────────┐
│               GOOGLE OAUTH 2.0                          │
│  Verifica identitat → retorna email → whitelist check   │
└─────────────────────────────────────────────────────────┘
```
