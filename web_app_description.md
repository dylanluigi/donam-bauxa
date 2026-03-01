

## 1. Identificació del grup

Els integrants d'aquest projecte són Josep Ferriol Font  i Dylan Luigi Canning Garcia .

## 2. Temàtica de la pràctica

L'àmbit escollit per a aquest projecte és el de la música, la cultura i els esdeveniments locals. L'escena musical mallorquina és vibrant i diversa, però sovint la informació sobre concerts i grups locals es troba dispersa entre xarxes socials i webs poc optimitzades. "Dona'm Bauxa" neix precisament per centralitzar aquesta informació, promovent la cultura de proximitat i facilitant que el públic descobreixi el talent de l'illa.

El públic objectiu de la plataforma engloba residents a Mallorca i visitants interessats en la cultura local, principalment d'edats compreses entre els 16 i els 60 anys, que cerquen oci musical en directe. Paral·lelament, la plataforma exerceix de finestra de visibilitat per a músics i grups emergents que volen donar-se a conèixer.

El valor diferencial de la proposta rau en el seu enfocament exclusivament local: a diferència de les grans ticketeres o agendes culturals genèriques, "Dona'm Bauxa" se centra en l'ecosistema mallorquí, combinant una interfície moderna amb geolocalització d'esdeveniments i una base de dades dedicada a la biografia i discografia dels artistes de la terra.

## 3. Anàlisi funcional

Pel que fa a les funcionalitats principals, el sistema oferirà un cercador d'artistes i grups mallorquins amb fitxes detallades, una agenda d'esdeveniments —concerts, festes populars i festivals— actualitzada contínuament, i un sistema de filtres per gènere musical, zona geogràfica i dates. Com a funcionalitats secundàries, s'inclouran una secció de "Favorits" per desar grups o esdeveniments d'interès, enllaços directes a la compra d'entrades o a les xarxes socials dels artistes, i una secció de notícies d'actualitat sobre l'escena musical balear.

Les interaccions de l'usuari estan dissenyades perquè siguin naturals i immediates: l'usuari podrà explorar el mapa de Mallorca per trobar concerts propers, puntuar esdeveniments, compartir-los mitjançant enllaços i subscriure's a alertes de nous concerts dels seus grups preferits.

El flux principal d'ús segueix una lògica senzilla: l'usuari accedeix a la pàgina d'inici, consulta els esdeveniments destacats del cap de setmana, clica en un concert concret, en revisa els detalls i la ubicació de l'artista, i finalment decideix assistir-hi o continuar explorant grups similars.

Quant al tipus de contingut gestionat, la plataforma treballarà amb dades estructurades en format JSON per a artistes, horaris i coordenades; contingut multimèdia com ara imatges de cartells, fotografies d'artistes i fragments de vídeo o àudio provinents de YouTube i Spotify; i mapes per a la representació visual de les sales i places on es fa la bauxa. Les integracions previstes inclouen l'API de Google Maps o Leaflet per a la geolocalització dels concerts, l'API de Spotify per permetre escoltar la música dels artistes directament des de la seva fitxa, i la integració amb aplicacions de calendari per afegir esdeveniments a l'agenda personal del dispositiu mòbil.

## 4. Anàlisi no funcional

La plataforma estarà totalment optimitzada per a dispositius mòbils, atès que el perfil d'usuari sol consultar aquesta informació mentre és fora de casa o de camí a un esdeveniment. En matèria d'accessibilitat, s'implementaran els estàndards WCAG, garantint un contrast de colors adequat, etiquetes alt en totes les imatges i navegació per teclat, de manera que tothom pugui gaudir de la cultura sense barreres.

El disseny seguirà principis d'usabilitat que minimitzen la corba d'aprenentatge: la informació clau —quan i on— ha de ser accessible en menys de tres clics. L'arquitectura estarà pensada per escalar en nombre d'usuaris i volum de dades, preveient una possible ampliació futura a la resta de les Illes Balears.

En termes de seguretat, la connexió es realitzarà mitjançant HTTPS i es garantirà la protecció de les dades d'usuari en cas que es creïn perfils de "fan" o "artista". La compatibilitat multiplataforma assegurarà un funcionament correcte als principals navegadors —Chrome, Safari, Firefox i Edge— tant en Android i iOS com en escriptori.

Finalment, l'experiència d'usuari perseguirà temps de càrrega ràpids, animacions suaus i una estètica que reflecteixi l'esperit festiu i cultural de Mallorca, amb un llenguatge proper i visualment atractiu que connecti amb la identitat de l'illa.
