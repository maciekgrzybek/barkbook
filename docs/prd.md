# Dokument wymagań produktu (PRD) - BarkBook

## 1. Przegląd produktu

BarkBook to aplikacja przeznaczona dla groomerów (osób strzygących psy), mająca na celu zastąpienie tradycyjnych, papierowych notatników centralnym systemem do zarządzania informacjami. W wersji MVP (Minimum Viable Product) aplikacja umożliwi gromadzenie danych o klientach i ich psach, a także zarządzanie harmonogramem wizyt poprzez integrację z zewnętrznym kalendarzem. Głównym celem jest usprawnienie i cyfryzacja podstawowych procesów administracyjnych w salonie groomerskim.

## 2. Problem użytkownika

Obecnie groomerzy często polegają na papierowych kalendarzach i kartotekach klientów, co prowadzi do kilku problemów:

- Brak centralnego, łatwo dostępnego źródła informacji o klientach i historii ich psów.
- Ryzyko utraty lub zniszczenia danych.
- Nieefektywne zarządzanie harmonogramem wizyt i brak automatycznych przypomnień, co zwiększa ryzyko nieobecności klientów.
- Trudności w szybkim wyszukiwaniu informacji o konkretnym kliencie lub psie.

Aplikacja BarkBook ma za zadanie rozwiązać te problemy, oferując proste i intuicyjne narzędzie cyfrowe.

## 3. Wymagania funkcjonalne

| ID    | Wymaganie                         | Opis                                                                                                                                                                                                              |
| :---- | :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Zarządzanie bazą klientów         | Użytkownik (groomer) może dodawać, przeglądać, edytować i usuwać dane klientów. Wymagane pola: imię, nazwisko, numer telefonu. Opcjonalne: e-mail, adres.                                                         |
| FR-02 | Zarządzanie profilami psów        | Użytkownik może dodawać, przeglądać, edytować i usuwać profile psów. Każdy pies może być przypisany do jednego lub więcej klientów. Wymagane pola: imię, rasa, wiek, stan zdrowia, alergie, preferencje, notatki. |
| FR-03 | Historia wizyt psa                | Każdy profil psa zawiera ustrukturyzowaną listę poprzednich wizyt, zawierającą datę i pole na notatki z wizyty.                                                                                                   |
| FR-04 | Integracja kalendarza (`cal.com`) | Aplikacja osadza kalendarz `cal.com` za pomocą `iframe`. Groomer może ręcznie dodawać i przeglądać wizyty oraz blokować swoją dostępność.                                                                         |
| FR-05 | Automatyczne powiadomienia SMS    | System automatycznie wysyła przypomnienia SMS do klientów przed wizytą. Czas wysłania (np. 24h przed) jest konfigurowalny przez groomera.                                                                         |
| FR-06 | Wyszukiwanie                      | Aplikacja posiada prostą funkcję wyszukiwania, pozwalającą na znalezienie klienta lub psa po imieniu.                                                                                                             |
| FR-07 | Dashboard (Ekran główny)          | Po uruchomieniu aplikacji wyświetlany jest dashboard z listą wizyt zaplanowanych na bieżący dzień.                                                                                                                |
| FR-08 | Ustawienia salonu                 | Groomer może zapisać nazwę i dane swojego salonu, które mogą być wykorzystywane np. w treści powiadomień SMS.                                                                                                     |
| FR-09 | Zgodność z RODO                   | Aplikacja umożliwia trwałe usunięcie danych klienta i jego psów oraz odnotowanie daty uzyskania zgody na przetwarzanie danych i komunikację.                                                                      |
| FR-10 | Dostęp do aplikacji               | Aplikacja jest zabezpieczona przed nieautoryzowanym dostępem. Groomer musi się zalogować, aby uzyskać dostęp do danych.                                                                                           |

## 4. Granice produktu

Następujące funkcjonalności celowo NIE wchodzą w zakres wersji MVP:

- Logowanie dla klientów końcowych.
- Możliwość samodzielnej rezerwacji wizyt przez klientów.
- Wykorzystanie modeli językowych (LLM) do jakichkolwiek celów.
- Przechowywanie zdjęć psów lub zdjęć z wizyt.
- Możliwość definiowania cennika i listy usług.
- Integracja z systemami płatności.
- Zaawansowane raportowanie i analityka.

## 5. Historyjki użytkowników

---

### Dostęp i Uwierzytelnianie

- ID: US-001
- Tytuł: Dostęp do aplikacji przez groomera
- Opis: Jako groomer, chcę mieć bezpieczny dostęp do mojej aplikacji, aby nikt niepowołany nie miał wglądu w dane moich klientów.
- Kryteria akceptacji:
  1.  Przy pierwszym uruchomieniu aplikacja wymaga utworzenia konta (login/hasło).
  2.  Aplikacja posiada ekran logowania.
  3.  Użytkownik może się zalogować przy użyciu poprawnych danych.
  4.  Użytkownik nie może się zalogować przy użyciu niepoprawnych danych.
  5.  Sesja użytkownika jest utrzymywana po zamknięciu i ponownym otwarciu aplikacji (bez konieczności każdorazowego logowania).

---

### Zarządzanie Klientami

- ID: US-002
- Tytuł: Dodawanie nowego klienta
- Opis: Jako groomer, chcę móc szybko dodać nowego klienta do systemu, podając jego podstawowe dane kontaktowe.
- Kryteria akceptacji:

  1.  Istnieje formularz dodawania nowego klienta.
  2.  Formularz zawiera pola: imię, nazwisko, numer telefonu (wymagane) oraz e-mail, adres (opcjonalne).
  3.  System waliduje poprawność formatu numeru telefonu.
  4.  Po zapisaniu, nowy klient jest widoczny na liście klientów.

- ID: US-003
- Tytuł: Przeglądanie i edycja danych klienta
- Opis: Jako groomer, chcę mieć możliwość przeglądania i aktualizowania danych istniejącego klienta.
- Kryteria akceptacji:

  1.  Mogę otworzyć profil klienta z listy klientów.
  2.  Widzę wszystkie zapisane dane klienta.
  3.  Mogę edytować wszystkie pola danych klienta.
  4.  Zmienione dane są poprawnie zapisywane.

- ID: US-004
- Tytuł: Usuwanie klienta (zgodność z RODO)
- Opis: Jako groomer, na prośbę klienta, chcę mieć możliwość trwałego usunięcia jego danych z systemu.
- Kryteria akceptacji:
  1.  Na profilu klienta dostępna jest opcja "Usuń".
  2.  System wyświetla okno z prośbą o potwierdzenie operacji.
  3.  Po potwierdzeniu, dane klienta oraz wszystkich przypisanych do niego psów są trwale usuwane z bazy danych.
  4.  Usunięty klient nie jest już widoczny na liście klientów ani w wynikach wyszukiwania.

---

### Zarządzanie Psami

- ID: US-005
- Tytuł: Dodawanie i przypisywanie psa do klienta
- Opis: Jako groomer, chcę dodać profil nowego psa i przypisać go do klienta. Chcę mieć też możliwość przypisania istniejącego już w systemie psa do innego klienta.
- Kryteria akceptacji:

  1.  Z poziomu profilu klienta mogę zainicjować proces dodawania lub przypisywania psa.
  2.  System pozwala wyszukać psa po imieniu, aby przypisać go do klienta.
  3.  Jeśli pies nie istnieje w bazie, mogę utworzyć jego nowy profil.
  4.  Formularz dodawania psa zawiera pola: imię, rasa, wiek, stan zdrowia, alergie, preferencje, ogólne notatki.
  5.  Po przypisaniu, pies jest widoczny na profilu klienta.

- ID: US-006
- Tytuł: Przeglądanie i edycja profilu psa
- Opis: Jako groomer, chcę przeglądać i edytować informacje na temat psa, aby mieć aktualne dane.
- Kryteria akceptacji:

  1.  Mogę otworzyć profil psa z poziomu profilu dowolnego z jego właścicieli.
  2.  Widzę wszystkie zapisane dane psa.
  3.  Mogę edytować wszystkie pola w profilu psa.
  4.  Zmienione dane są poprawnie zapisywane.

- ID: US-007
- Tytuł: Przeglądanie historii wizyt psa
- Opis: Jako groomer, chcę widzieć listę przeszłych wizyt psa, aby przypomnieć sobie, co było robione ostatnio.
- Kryteria akceptacji:
  1.  Na profilu psa znajduje się sekcja "Historia wizyt".
  2.  Wizyty są wyświetlane w porządku chronologicznym (od najnowszej).
  3.  Każdy wpis na liście zawiera datę wizyty i zapisane notatki.

---

### Zarządzanie Wizytami i Kalendarzem

- ID: US-008
- Tytuł: Dodawanie nowej wizyty w kalendarzu
- Opis: Jako groomer, chcę dodać nową wizytę do kalendarza dla konkretnego klienta/psa.
- Kryteria akceptacji:

  1.  Aplikacja wyświetla osadzony kalendarz z `cal.com`.
  2.  Mogę ręcznie utworzyć nowe wydarzenie w kalendarzu.
  3.  W opisie wydarzenia w kalendarzu mogę wpisać imię klienta i psa, aby powiązać wizytę z danymi w BarkBook.
  4.  Po dodaniu wizyty w `cal.com` jest ona podstawą do wysłania powiadomienia SMS.

- ID: US-009
- Tytuł: Dodawanie notatki do historii po wizycie
- Opis: Jako groomer, po zakończeniu wizyty, chcę dodać notatkę do historii wizyt psa.
- Kryteria akceptacji:
  1.  Na profilu psa mogę dodać nowy wpis do jego historii wizyt.
  2.  Formularz wpisu pozwala na ustawienie daty wizyty i dodanie wieloliniowego opisu (notatek).
  3.  Nowa notatka jest widoczna w historii wizyt psa.

---

### Dashboard i Wyszukiwanie

- ID: US-010
- Tytuł: Przeglądanie wizyt na dany dzień
- Opis: Jako groomer, chcę po otwarciu aplikacji od razu widzieć, jakie wizyty mam zaplanowane na dzisiaj.
- Kryteria akceptacji:

  1.  Ekran główny (dashboard) aplikacji wyświetla listę wizyt na bieżący dzień.
  2.  Lista jest pobierana z kalendarza `cal.com`.
  3.  Każdy element listy pokazuje godzinę wizyty i jej tytuł (np. "Strzyżenie - Fafik, Jan Kowalski").

- ID: US-011
- Tytuł: Wyszukiwanie klienta lub psa
- Opis: Jako groomer, chcę szybko znaleźć klienta lub psa w mojej bazie danych.
- Kryteria akceptacji:
  1.  W aplikacji znajduje się pole wyszukiwania.
  2.  Po wpisaniu co najmniej 3 znaków imienia klienta lub psa, system wyświetla pasujące wyniki.
  3.  Kliknięcie na wynik wyszukiwania przenosi mnie do profilu klienta lub psa.

---

### Ustawienia i RODO

- ID: US-012
- Tytuł: Konfiguracja powiadomień SMS
- Opis: Jako groomer, chcę móc ustawić, ile godzin przed wizytą ma być wysyłane automatyczne przypomnienie SMS.
- Kryteria akceptacji:

  1.  W ustawieniach aplikacji znajduje się pole do wpisania liczby godzin (np. 24, 48).
  2.  System wykorzystuje tę wartość do planowania wysyłki powiadomień.
  3.  Domyślna wartość jest ustawiona na 24 godziny.

- ID: US-013
- Tytuł: Konfiguracja danych salonu
- Opis: Jako groomer, chcę móc wpisać nazwę mojego salonu, aby była ona używana w komunikacji z klientem.
- Kryteria akceptacji:

  1.  W ustawieniach aplikacji znajduje się pole do wpisania nazwy salonu.
  2.  Zapisana nazwa jest automatycznie dołączana do treści wysyłanych wiadomości SMS (np. "Przypomnienie o wizycie w salonie [Nazwa Salonu]").

- ID: US-014
- Tytuł: Odnotowanie zgody na przetwarzanie danych (RODO)
- Opis: Jako groomer, dodając nowego klienta, chcę odnotować fakt i datę uzyskania od niego zgody na przetwarzanie danych osobowych i kontakt SMS.
- Kryteria akceptacji:
  1.  W formularzu dodawania/edycji klienta znajduje się pole typu checkbox "Wyrażono zgodę na przetwarzanie danych i kontakt SMS".
  2.  Obok checkboxa system automatycznie zapisuje datę zaznaczenia tej opcji.
  3.  Informacja o zgodzie i dacie jest widoczna na profilu klienta.
  4.  System wysyła powiadomienia SMS tylko do klientów z zaznaczoną zgodą.

## 6. Metryki sukcesu

Kryteria sukcesu dla wersji MVP mają charakter jakościowy i opierają się na ocenie, czy aplikacja skutecznie rozwiązuje główny problem użytkownika. Sukces będzie mierzony poprzez:

- Adopcja: Czy groomerzy, którzy testują aplikację, kontynuują jej używanie po okresie wdrożenia, rezygnując z papierowego notatnika.
- Feedback użytkownika: Zbieranie regularnych opinii na temat intuicyjności, stabilności i ogólnej użyteczności aplikacji w codziennej pracy.
- Redukcja nieobecności: Subiektywna ocena groomera, czy automatyczne powiadomienia SMS przyczyniły się do zmniejszenia liczby klientów, którzy nie pojawili się na umówionej wizycie.
