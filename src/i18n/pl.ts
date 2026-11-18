/**
 * Polish dictionary. This file is the type source: `Dictionary = typeof pl`.
 * en.ts and uk.ts must `satisfies Dictionary`, so a missing key fails `npm run check`.
 * Facts come only from the client's specification (resources/renhan-oferta.pdf).
 */
export const pl = {
  site: {
    name: 'RenHan-med',
    descriptor: 'Centrum Niezależnego Życia',
    motto: 'Od dobrego wyboru zaczyna się niezależność.',
    slogan: 'Przestrzeń bez barier.',
  },

  a11y: {
    skipToContent: 'Przejdź do treści',
    homeLink: 'strona główna',
    mainNav: 'Nawigacja główna',
    footerNav: 'Nawigacja w stopce',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    darkTheme: 'Ciemny motyw',
    language: 'Język',
    languageCurrent: 'polski, zmień język',
    newTab: 'otwiera się w nowej karcie',
    offerSections: 'Działy oferty',
    logoAlt: 'Znak RenHan-med: postać na wózku w zarysie domu',
  },

  nav: {
    home: 'Strona główna',
    offer: 'Oferta',
    rental: 'Wypożyczalnia',
    advice: 'Doradztwo i dobór sprzętu',
    funding: 'Dofinansowania',
    about: 'O nas',
    contact: 'Kontakt',
  },

  cta: {
    askEquipment: 'Zapytaj o sprzęt',
    bookAdvice: 'Umów doradztwo',
    askRental: 'Zapytaj o wypożyczenie',
    askFunding: 'Zapytaj o dofinansowanie',
  },

  meta: {
    home: {
      title: 'Sprzęt rehabilitacyjny, wypożyczenie, doradztwo | RenHan-med',
      description:
        'RenHan-med, Centrum Niezależnego Życia: sprzęt rehabilitacyjny, wyposażenie domu bez barier, wypożyczalnia i indywidualne doradztwo w doborze sprzętu.',
    },
    offer: {
      title: 'Oferta: sprzęt rehabilitacyjny i dom bez barier | RenHan-med',
      description:
        'Pięć działów oferty RenHan-med: wózki, balkoniki, chodziki, łóżka rehabilitacyjne, podnośniki, ortezy, wyposażenie łazienki i wypożyczalnia sprzętu.',
    },
    rental: {
      title: 'Wypożyczalnia sprzętu rehabilitacyjnego | RenHan-med',
      description:
        'Wypożyczalnia RenHan-med: sprzęt rehabilitacyjny do czasowego użytkowania. Zapytaj o dostępność, warunki wypożyczenia i pomoc w doborze sprzętu.',
    },
    advice: {
      title: 'Doradztwo i dobór sprzętu rehabilitacyjnego | RenHan-med',
      description:
        'Pomagamy wybrać sprzęt rehabilitacyjny dopasowany do potrzeb, możliwości użytkownika i warunków w domu. Porównamy rozwiązania. Umów doradztwo w RenHan-med.',
    },
    funding: {
      title: 'Dofinansowanie sprzętu rehabilitacyjnego | RenHan-med',
      description:
        'Możliwość dofinansowania sprzętu zależy od rodzaju produktu, sytuacji klienta i aktualnych zasad programu. Wyjaśnimy szczegóły. Zapytaj w RenHan-med.',
    },
    about: {
      title: 'O nas: Centrum Niezależnego Życia | RenHan-med',
      description:
        'RenHan-med to Centrum Niezależnego Życia. Pomagamy wybierać rozwiązania, które zwiększają bezpieczeństwo, komfort i samodzielność. Poznaj nasze wartości.',
    },
    contact: {
      title: 'Kontakt | RenHan-med, Centrum Niezależnego Życia',
      description:
        'Telefon, e-mail, adres, godziny otwarcia i formularz kontaktowy RenHan-med. Zapytaj o sprzęt rehabilitacyjny, wypożyczenie, doradztwo lub dofinansowanie.',
    },
    notFound: {
      title: 'Nie znaleziono strony | RenHan-med',
      description: 'Pod tym adresem nie ma strony. Przejdź na stronę główną RenHan-med lub do oferty.',
    },
  },

  /** The five-step customer path, used on the home and advice pages. */
  path: {
    eyebrow: 'Ścieżka klienta',
    title: 'Pięć kroków od potrzeby do wyboru',
    lead: 'Tak pracujemy z każdym klientem, przy zakupie i przy wypożyczeniu.',
    stepLabel: 'Krok',
    steps: [
      {
        title: 'Poznajemy potrzeby',
        text: 'Pytamy, kto będzie korzystać ze sprzętu i w czym ma pomagać.',
      },
      {
        title: 'Analizujemy możliwości',
        text: 'Bierzemy pod uwagę możliwości osoby, sposób korzystania ze sprzętu i warunki w mieszkaniu.',
      },
      {
        title: 'Pokazujemy rozwiązania',
        text: 'Przedstawiamy dostępne rozwiązania i wyjaśniamy różnice między nimi.',
      },
      {
        title: 'Pomagamy wybrać',
        text: 'Razem wybieramy rozwiązanie dopasowane do potrzeb.',
      },
      {
        title: 'Sprzedaż lub wypożyczenie',
        text: 'Sprzęt możesz kupić albo wypożyczyć, zależnie od potrzeb.',
      },
    ],
  },

  contactInfo: {
    phone: 'Telefon',
    email: 'E-mail',
    address: 'Adres lokalu',
    hours: 'Godziny otwarcia',
    closed: 'nieczynne',
    company: 'Dane firmy',
    nip: 'NIP',
    regon: 'REGON',
    krs: 'KRS',
    callPrompt: 'Wolisz porozmawiać? Zadzwoń',
  },

  home: {
    hero: {
      photoAlt: 'Kobieta na wózku w jasnym, nowoczesnym mieszkaniu, widziana z boku.',
      eyebrow: 'Sprzęt rehabilitacyjny i pomocniczy',
      lead: 'W RenHan-med kupisz lub wypożyczysz sprzęt rehabilitacyjny i wyposażenie domu. Zaczynamy od rozmowy o potrzebach, a potem pomagamy wybrać rozwiązanie.',
    },
    strip: {
      label: 'Czym się zajmujemy',
      items: {
        sales: 'Sprzedaż sprzętu',
        rental: 'Wypożyczalnia',
        funding: 'Refundacje i formalności',
        selection: 'Dobór sprzętu',
        home: 'Dom bez barier',
      },
    },
    tiles: {
      title: 'Jak możemy pomóc',
      items: {
        equipment: {
          title: 'Sprzęt rehabilitacyjny',
          text: 'Wózki, balkoniki, łóżka rehabilitacyjne, podnośniki i sprzęt do transferu.',
          link: 'Zobacz sprzęt',
        },
        home: {
          title: 'Wyposażenie domu',
          text: 'Uchwyty, krzesełka i rozwiązania do łazienki, które zwiększają bezpieczeństwo.',
          link: 'Zobacz wyposażenie',
        },
        rental: {
          title: 'Wypożyczalnia',
          text: 'Sprzęt do czasowego użytkowania. Przy każdej pozycji możesz zapytać o dostępność.',
          link: 'Zobacz wypożyczalnię',
        },
        advice: {
          title: 'Doradztwo i dobór sprzętu',
          text: 'Porównujemy rozwiązania, wyjaśniamy różnice i dopasowujemy sprzęt do mieszkania.',
          link: 'Zobacz, jak doradzamy',
        },
      },
    },
    about: {
      eyebrow: 'O RenHan-med',
      statement: 'Nie sprzedajemy przypadkowego sprzętu. Pomagamy wybrać rozwiązanie.',
      text: 'RenHan-med to Centrum Niezależnego Życia. Zanim polecimy sprzęt, pytamy o potrzeby, możliwości i warunki w domu. Chodzi nam o rozwiązania, które zwiększają bezpieczeństwo, komfort i samodzielność.',
      valuesTitle: 'Nasze wartości',
      link: 'Poznaj RenHan-med',
    },
    offer: {
      eyebrow: 'Oferta',
      title: 'Najważniejsze działy oferty',
      lead: 'W każdym dziale pomagamy dobrać sprzęt do osoby i do mieszkania.',
      link: 'Zobacz całą ofertę',
    },
    funding: {
      eyebrow: 'Dofinansowania',
      title: 'Dofinansowanie sprzętu',
      text: 'Część produktów i usług może być objęta dofinansowaniem. Możliwość dofinansowania zależy od rodzaju produktu, sytuacji klienta i aktualnych zasad programu.',
      link: 'Przeczytaj o dofinansowaniach',
    },
    contact: {
      eyebrow: 'Kontakt',
      title: 'Kontakt i dane firmy',
      lead: 'Zadzwoń, napisz albo odwiedź nas. Odpowiemy na pytania o sprzęt, wypożyczenie i dofinansowania.',
      link: 'Napisz do nas',
    },
  },

  offer: {
    eyebrow: 'Oferta',
    title: 'Sprzęt rehabilitacyjny i wyposażenie domu bez barier',
    lead: 'Ofertę dzielimy na pięć działów. Konkretne marki i produkty będziemy dodawać stopniowo, dlatego o potrzebny sprzęt najlepiej zapytać.',
    itemsLabel: 'W tym dziale',
    askAbout: 'Zapytaj o sprzęt',
    rentalLink: 'Zobacz wypożyczalnię',
    closing: {
      title: 'Pomożemy wybrać sprzęt',
      text: 'Opowiedz, kto będzie korzystać ze sprzętu i w jakich warunkach. Porównamy rozwiązania i wyjaśnimy różnice.',
    },
  },

  rental: {
    eyebrow: 'Wypożyczalnia',
    title: 'Wypożyczalnia sprzętu rehabilitacyjnego',
    lead: 'Sprzęt do czasowego użytkowania. Okres i warunki wypożyczenia ustalamy, gdy zapytasz.',
    rules: {
      eyebrow: 'Zasady',
      title: 'Wypożyczenie w trzech krokach',
      items: [
        {
          title: 'Wybierz sprzęt i zapytaj',
          text: 'Przy każdej pozycji jest przycisk z zapytaniem. Możesz też zadzwonić.',
        },
        {
          title: 'Potwierdzamy dostępność',
          text: 'Odpowiadamy, czy sprzęt jest dostępny w terminie, którego potrzebujesz.',
        },
        {
          title: 'Ustalamy warunki',
          text: 'Warunki wypożyczenia i ceny podajemy w odpowiedzi na zapytanie. Szczegółowy regulamin opublikujemy po jego ustaleniu.',
        },
      ],
    },
    list: {
      eyebrow: 'Sprzęt',
      title: 'Sprzęt w wypożyczalni',
      lead: 'Na liście są rodzaje sprzętu. Konkretny model i dostępność potwierdzimy, gdy zapytasz.',
      availabilityLabel: 'Dostępność',
      availabilityDefault: 'Zapytaj o dostępność',
      useLabel: 'Zastosowanie',
    },
    closing: {
      title: 'Pomożemy dobrać sprzęt przed wypożyczeniem',
      text: 'Jeśli nie masz pewności, który sprzęt będzie odpowiedni, zacznij od rozmowy. Dopasujemy go do osoby i do mieszkania.',
    },
  },

  advice: {
    eyebrow: 'Doradztwo',
    title: 'Doradztwo i dobór sprzętu',
    statement: 'Nie sprzedajemy przypadkowego sprzętu. Pomagamy wybrać rozwiązanie.',
    lead: 'Przeprowadzamy klienta od rozpoznania potrzeb do świadomego wyboru produktu.',
    factors: {
      eyebrow: 'Dobór sprzętu',
      title: 'Co uwzględniamy przy doborze',
      items: {
        needs: { title: 'Potrzeby', text: 'W czym sprzęt ma pomagać na co dzień.' },
        abilities: { title: 'Możliwości', text: 'Co użytkownik robi samodzielnie, a w czym potrzebuje wsparcia.' },
        use: { title: 'Sposób użytkowania', text: 'Jak często i w jakich sytuacjach sprzęt będzie używany.' },
        setting: { title: 'Warunki', text: 'Mieszkanie i inne miejsca, w których sprzęt będzie używany.' },
      },
    },
    scope: {
      eyebrow: 'Zakres',
      title: 'W czym doradzamy',
      lead: 'Dziewięć obszarów, w których możesz liczyć na naszą pomoc.',
      items: [
        'Dobór sprzętu rehabilitacyjnego i pomocniczego',
        'Dobór rozwiązań zwiększających samodzielność i bezpieczeństwo w domu',
        'Pomoc w wyborze wózków, balkoników, chodzików, łóżek, podnośników i sprzętu do transferu',
        'Dobór wyposażenia łazienki i rozwiązań ułatwiających korzystanie z niej',
        'Dobór produktów ortopedycznych i stabilizujących',
        'Porównanie dostępnych rozwiązań i wyjaśnienie różnic',
        'Dopasowanie sprzętu do warunków mieszkaniowych',
        'Informacja o możliwości wypożyczenia sprzętu',
        'Informacja o możliwościach dofinansowania, gdy produkt lub usługa może być nim objęta',
      ],
    },
    closing: {
      title: 'Umów rozmowę o doborze sprzętu',
      text: 'Opisz krótko sytuację w formularzu albo zadzwoń. Ustalimy termin rozmowy.',
    },
  },

  funding: {
    eyebrow: 'Dofinansowania',
    title: 'Dofinansowanie sprzętu rehabilitacyjnego',
    lead: 'Część produktów i usług może być objęta dofinansowaniem. Wyjaśniamy, od czego to zależy.',
    factors: {
      eyebrow: 'Warunki',
      title: 'Od czego zależy dofinansowanie',
      items: {
        product: {
          title: 'Rodzaj produktu',
          text: 'Nie każdy produkt i nie każda usługa mogą być objęte dofinansowaniem.',
        },
        situation: {
          title: 'Sytuacja klienta',
          text: 'Znaczenie ma indywidualna sytuacja osoby, która będzie korzystać ze sprzętu.',
        },
        rules: {
          title: 'Aktualne zasady programu',
          text: 'Każdy program ma własne zasady i mogą się one zmieniać. Liczą się te obowiązujące obecnie.',
        },
      },
    },
    help: {
      eyebrow: 'Nasza rola',
      title: 'Informujemy o możliwościach',
      text: 'Podczas doradztwa mówimy o możliwościach dofinansowania, gdy wybrany produkt lub usługa może być nim objęta.',
      noteTitle: 'Bez obietnic',
      note: 'Nie obiecujemy uzyskania konkretnego świadczenia. Przekazujemy informacje o możliwościach, ale nie decydujemy o przyznaniu dofinansowania.',
    },
    closing: {
      title: 'Zapytaj o dofinansowanie konkretnego sprzętu',
      text: 'Napisz, o jaki sprzęt chodzi. Przekażemy informację o możliwościach dofinansowania.',
    },
  },

  about: {
    eyebrow: 'O nas',
    title: 'RenHan-med to Centrum Niezależnego Życia',
    lead: 'Pomagamy ludziom wybierać rozwiązania, które zwiększają bezpieczeństwo, komfort i samodzielność.',
    mission: {
      eyebrow: 'Nasz cel',
      text: 'Chcemy, żeby w jednym miejscu można było kupić lub wypożyczyć sprzęt i otrzymać pomoc w wyborze rozwiązania dopasowanego do swoich potrzeb.',
    },
    values: {
      eyebrow: 'Wartości',
      title: 'Cztery wartości w naszej pracy',
      items: [
        {
          title: 'Indywidualne podejście',
          text: 'Każdą rozmowę zaczynamy od potrzeb konkretnej osoby.',
        },
        {
          title: 'Fachowe doradztwo',
          text: 'Porównujemy rozwiązania i wyjaśniamy różnice, żeby wybór był świadomy.',
        },
        {
          title: 'Dostępność',
          text: 'Mówimy prostym językiem. Sprzęt można kupić albo wypożyczyć.',
        },
        {
          title: 'Szacunek dla klienta',
          text: 'Słuchamy i dajemy czas na decyzję.',
        },
      ],
    },
    pillars: {
      eyebrow: 'Zakres działania',
      title: 'Pięć obszarów RenHan-med',
      items: {
        sales: { title: 'Sprzedaż sprzętu', text: 'Sprzęt rehabilitacyjny, pomocniczy i ortopedyczny.' },
        rental: { title: 'Wypożyczalnia', text: 'Sprzęt do czasowego użytkowania.' },
        funding: { title: 'Refundacje i formalności', text: 'Informacja o możliwościach dofinansowania.' },
        choosing: { title: 'Dobór sprzętu', text: 'Dopasowanie do osoby i do mieszkania.' },
        home: { title: 'Dom bez barier', text: 'Wyposażenie łazienki i domu.' },
      },
    },
    closing: {
      title: 'Porozmawiajmy o potrzebnym sprzęcie',
      text: 'Zacznij od krótkiej rozmowy. Pokażemy rozwiązania i pomożemy wybrać.',
    },
  },

  contact: {
    eyebrow: 'Kontakt',
    title: 'Kontakt z RenHan-med',
    lead: 'Zadzwoń, napisz lub wypełnij formularz. Odpowiadamy na pytania o sprzęt, wypożyczenie, doradztwo i dofinansowania.',
    detailsTitle: 'Dane kontaktowe',
    formTitle: 'Formularz kontaktowy',
    formLead: 'Podaj telefon lub e-mail, a odpowiemy tą drogą.',
    map: {
      title: 'Dojazd',
      load: 'Pokaż mapę',
      loadNote: 'Mapa Google ładuje się dopiero po kliknięciu, bo pochodzi z zewnętrznego serwisu.',
      directions: 'Wyznacz trasę',
      frameTitle: 'Mapa dojazdu do RenHan-med',
    },
  },

  form: {
    name: 'Imię',
    phone: 'Telefon',
    email: 'E-mail',
    contactLegend: 'Dane do odpowiedzi',
    contactHint: 'Wystarczy jedno: telefon albo e-mail.',
    topic: 'Temat',
    topics: {
      equipment: 'Sprzęt',
      rental: 'Wypożyczenie',
      advice: 'Doradztwo',
      funding: 'Dofinansowanie',
      other: 'Inna sprawa',
    },
    message: 'Wiadomość',
    consent: 'Zgadzam się na kontakt ze strony RenHan-med w sprawie mojego zapytania.',
    required: 'pole wymagane',
    submit: 'Wyślij wiadomość',
    errors: {
      summary: 'Formularz zawiera błędy. Popraw zaznaczone pola.',
      name: 'Wpisz swoje imię.',
      contact: 'Podaj numer telefonu lub adres e-mail.',
      phone: 'Sprawdź numer telefonu. Powinien mieć co najmniej 9 cyfr.',
      email: 'Sprawdź adres e-mail. Powinien mieć postać nazwa@domena.pl.',
      message: 'Napisz, w czym możemy pomóc.',
      consent: 'Zaznacz zgodę, żebyśmy mogli odpowiedzieć.',
    },
    status: {
      sending: 'Wysyłamy wiadomość…',
      success: 'Dziękujemy. Wiadomość dotarła do RenHan-med. Odpowiemy telefonicznie lub mailowo.',
      error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie albo zadzwoń: {phone}.',
      mailto:
        'Powinien otworzyć się program pocztowy z gotową wiadomością. Wyślij ją stamtąd, żeby do nas dotarła. Jeśli program się nie otworzył, napisz na {email} lub zadzwoń: {phone}.',
    },
    /** Message templates used when the form is opened from a button elsewhere on the site. */
    prefill: {
      equipment: 'Dzień dobry, proszę o informacje o sprzęcie z działu: {item}.',
      equipmentGeneral: 'Dzień dobry, proszę o informacje o sprzęcie.',
      rental: 'Dzień dobry, proszę o informacje o wypożyczeniu: {item}.',
      rentalGeneral: 'Dzień dobry, proszę o informacje o wypożyczeniu sprzętu.',
      advice: 'Dzień dobry, proszę o kontakt w sprawie doradztwa i doboru sprzętu.',
      funding: 'Dzień dobry, proszę o informacje o możliwościach dofinansowania.',
    },
    /** Parts of the e-mail composed for the mailto: fallback. */
    mail: {
      subject: 'Zapytanie ze strony',
      consentYes: 'Zgoda na kontakt: tak',
    },
  },

  footer: {
    contactTitle: 'Kontakt',
    navTitle: 'Strony',
    languagesTitle: 'Języki',
    rights: 'Wszelkie prawa zastrzeżone.',
    photoCredits: 'Zdjęcia',
  },

  notFound: {
    eyebrow: 'Błąd 404',
    title: 'Pod tym adresem nie ma strony',
    text: 'Adres mógł się zmienić albo zawiera literówkę. Wróć na stronę główną lub przejdź do oferty.',
    home: 'Wróć na stronę główną',
    offer: 'Zobacz ofertę',
  },
};

export type Dictionary = typeof pl;
