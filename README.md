# Dart Score Tracker

Aplikacja frontendowa do prowadzenia rozgrywek w darta w trybach **301** i **501**. Projekt umożliwia grę lokalną oraz obsługę pokoi multiplayer z lobby, gotowością graczy i rozgrywką online.

Aplikacja została przygotowana jako projekt zaliczeniowy z naciskiem na komponentowy interfejs, routing, formularze z walidacją, responsywność, dostępność, integrację z API oraz mikrointerakcje.

---

## Deployment

Aplikacja jest wdrożona publicznie na platformie **Render**.

Link do wdrożonej aplikacji:

```txt
https://dart-app-3c5i.onrender.com
```

---

## Repozytorium

Link do repozytorium GitHub:

```txt
https://github.com/iDollat/dartboard-architect
```

---

## Funkcje aplikacji

- wybór trybu gry: **301** lub **501**,
- konfiguracja liczby graczy,
- lokalna rozgrywka z interaktywną tarczą,
- historia rzutów,
- cofanie ostatniej akcji,
- zakończenie tury,
- wykrywanie zwycięzcy,
- ekran zwycięstwa,
- potwierdzenia akcji, np. restart lub zakończenie gry,
- rejestracja i logowanie użytkownika,
- walidacja formularzy po stronie klienta,
- zapisywanie preferencji użytkownika,
- tworzenie pokoi online,
- dołączanie do pokoju po kodzie,
- lobby multiplayer,
- wybór graczy do pokoju,
- obsługa statusów gotowości,
- start rozgrywki online,
- obsługa stanów ładowania i błędów,
- responsywny layout dla urządzeń mobilnych i desktopowych,
- animacje przejść między widokami z użyciem Framer Motion.

---

## Technologie

Projekt został wykonany z użyciem:

- **React**
- **TypeScript**
- **Vite**
- **React Router DOM**
- **TanStack React Query**
- **React Hook Form**
- **Zod**
- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **Framer Motion**
- **Lucide React**
- **Vitest**
- **ESLint**

---

## Wymagania systemowe

Do uruchomienia projektu potrzebujesz:

- Node.js w wersji 18 lub nowszej,
- npm.

Sprawdzenie wersji:

```bash
node -v
npm -v
```

---

## Instalacja

Sklonuj repozytorium:

```bash
git https://github.com/iDollat/dartboard-architect.git
```

Przejdź do folderu projektu:

```bash
cd dartboard-architect
```

Zainstaluj zależności:

```bash
npm install
```

---

## Konfiguracja środowiska

Projekt korzysta z pliku `.env`.

Przykładowy plik `.env`:

```env
VITE_API_URL=http://localhost:8080
```

Jeżeli backend działa pod innym adresem, zmień wartość `VITE_API_URL`.

---

## Uruchomienie aplikacji lokalnie

```bash
npm run dev
```

Po uruchomieniu aplikacja będzie dostępna domyślnie pod adresem:

```txt
http://localhost:3000
```

---

## Budowanie wersji produkcyjnej

```bash
npm run build
```

Wynik budowania zostanie zapisany w folderze:

```txt
dist
```

---

## Podgląd wersji produkcyjnej lokalnie

```bash
npm run preview
```

---

## Struktura projektu

```txt
src/
├── components/          # Komponenty UI i komponenty funkcjonalne aplikacji
│   ├── auth/            # Komponenty logowania, rejestracji i użytkownika
│   ├── multiplayer/     # Komponenty trybu multiplayer
│   └── ui/              # Komponenty shadcn/ui
├── hooks/               # Hooki aplikacji
├── lib/                 # Logika gry, typy, funkcje pomocnicze
├── pages/               # Widoki aplikacji używane przez routing
├── test/                # Testy
├── App.tsx              # Główna konfiguracja routingu
├── main.tsx             # Punkt wejścia aplikacji
└── index.css            # Style globalne i design system
```

---

## Routing

Aplikacja korzysta z `react-router-dom`.

Główne ścieżki:

```txt
/                     # ekran główny
/login                # logowanie
/register             # rejestracja
/local                # lokalna rozgrywka
/rooms/create         # tworzenie pokoju online
/rooms/join           # dołączanie do pokoju
/rooms/:code/lobby    # lobby pokoju
/rooms/:code/game     # gra online
```

---

## Formularze i walidacja

Formularze w projekcie wykorzystują:

- `react-hook-form`,
- `zod`,
- `@hookform/resolvers`.

Walidacja działa po stronie klienta. Użytkownik widzi czytelne komunikaty błędów przy niepoprawnie wypełnionych polach.

Przykładowe walidowane formularze:

- logowanie,
- rejestracja,
- konfiguracja profilu,
- dołączanie do pokoju,
- tworzenie graczy.

---

## State Management

Projekt wykorzystuje kilka mechanizmów zarządzania stanem:

- lokalny stan komponentów przez `useState`,
- stan gry przez własny hook `useGameState`,
- kontekst autoryzacji użytkownika,
- `TanStack React Query` do obsługi danych asynchronicznych.

Aplikacja obsługuje stany:

- `loading`,
- `success`,
- `error`.

---

## Integracja z API

Aplikacja komunikuje się z API przez zapytania HTTP.

Obsługiwane są między innymi operacje:

- pobieranie danych,
- logowanie użytkownika,
- rejestracja użytkownika,
- tworzenie pokoju,
- dołączanie do pokoju,
- aktualizacja statusu gracza,
- start gry,
- wysyłanie rzutów,
- zamykanie pokoju.

Projekt obsługuje błędy sieciowe i pokazuje je użytkownikowi w interfejsie.

---

## Responsive Design

Aplikacja jest responsywna i wykorzystuje breakpointy Tailwind CSS, między innymi:

- `sm`,
- `md`,
- `lg`.

Layout dostosowuje się do urządzeń mobilnych i desktopowych. Na mniejszych ekranach elementy są układane pionowo, a na większych ekranach pojawia się układ kolumnowy, np. plansza gry oraz panel graczy/historii.

---

## Dostępność

W projekcie zastosowano elementy wspierające dostępność:

- semantyczne znaczniki HTML,
- poprawione `label` i `htmlFor`,
- `aria-label`,
- `aria-describedby`,
- `aria-invalid`,
- `aria-pressed`,
- `role="alert"`,
- widoczny fokus klawiatury,
- poprawione kontrasty wybranych kolorów,
- obsługę komunikatów błędów widocznych dla użytkownika.

---

## Animacje i mikrointerakcje

Projekt wykorzystuje:

- `Framer Motion`,
- animowane przejścia między widokami,
- animację przejścia między konfiguracją gry a ekranem rozgrywki,
- animowane komunikaty,
- loading spinnery,
- komunikaty sukcesu i błędu,
- efekty hover i focus,
- toast notifications.

---

## Notatka UX

### Grupa docelowa

Aplikacja **Dart Score Tracker** jest przeznaczona dla osób grających w darta rekreacyjnie lub półamatorsko, które chcą szybko i wygodnie prowadzić punktację w trybach **301** i **501**. Głównymi użytkownikami są gracze korzystający z aplikacji podczas spotkań towarzyskich, domowych rozgrywek, treningów lub małych turniejów.

Przykładowa persona użytkownika:

**Michał, 27 lat** — gra w darta ze znajomymi kilka razy w miesiącu. Nie chce ręcznie liczyć punktów ani zapisywać wyników na kartce. Zależy mu na szybkim rozpoczęciu gry, czytelnym widoku aktualnego wyniku oraz prostym cofaniu błędnie wpisanego rzutu. Najczęściej korzysta z telefonu, który leży obok tarczy lub na stole.

---

### Kluczowe wybory UI/UX

Interfejs aplikacji został zaprojektowany tak, aby wspierać szybkie prowadzenie rozgrywki bez rozpraszania użytkownika. Zastosowano ciemny, sportowy motyw wizualny, duże kontrastowe elementy oraz wyraźne przyciski akcji. Najważniejsze informacje, takie jak aktualny gracz, wynik, historia rzutów i kontrolki tury, są widoczne bez konieczności przechodzenia przez wiele ekranów.

W aplikacji zastosowano podział na osobne widoki: ekran główny, konfigurację gry lokalnej, logowanie, rejestrację, tworzenie pokoju, dołączanie do pokoju, lobby oraz ekran gry. Dzięki temu użytkownik przechodzi przez proces krok po kroku i nie jest przeciążony zbyt dużą liczbą opcji naraz.

W widoku gry lokalnej najważniejsze akcje, takie jak zakończenie tury, cofnięcie rzutu, restart gry czy rozpoczęcie nowej rozgrywki, są dostępne bezpośrednio z poziomu ekranu gry. Dodatkowo zastosowano komunikaty potwierdzające dla akcji destrukcyjnych, takich jak restart lub zakończenie gry, aby ograniczyć ryzyko przypadkowej utraty postępu.

Aplikacja została zaprojektowana responsywnie. Na urządzeniach mobilnych elementy układają się pionowo, a na większych ekranach pojawia się podział na część główną oraz panel boczny z graczami i historią. Takie rozwiązanie pozwala wygodnie korzystać z aplikacji zarówno na telefonie, jak i na laptopie lub monitorze.

---

### Odniesienie do heurystyk Nielsena

Projekt odnosi się do wybranych heurystyk użyteczności Jakoba Nielsena:

**1. Widoczność statusu systemu**

Aplikacja informuje użytkownika o aktualnym stanie gry, aktywnym graczu, wykonanych rzutach, historii tur oraz zwycięzcy. W trybie online widoczne są również statusy ładowania, błędy sieciowe, gotowość graczy i informacje o lobby.

**2. Dopasowanie systemu do świata rzeczywistego**

Aplikacja korzysta z pojęć znanych graczom w darta, takich jak tryby **301** i **501**, rzut, tura, gracz, wynik, historia oraz zwycięzca. Dzięki temu użytkownik nie musi uczyć się abstrakcyjnej terminologii.

**3. Kontrola i wolność użytkownika**

Użytkownik może cofnąć ostatnią akcję, zakończyć turę, zrestartować grę lub wrócić do konfiguracji. Akcje, które mogą spowodować utratę postępu, są zabezpieczone modalem potwierdzającym.

**4. Spójność i standardy**

W projekcie zastosowano powtarzalne komponenty UI, spójne style przycisków, kart, formularzy i komunikatów. Routing prowadzi użytkownika przez logiczne etapy korzystania z aplikacji.

**5. Zapobieganie błędom**

Formularze wykorzystują walidację po stronie klienta. Użytkownik otrzymuje czytelne komunikaty błędów, np. przy niepoprawnym logowaniu, rejestracji lub wpisywaniu kodu pokoju. Przyciski są blokowane w sytuacjach, gdy dana akcja nie powinna być jeszcze dostępna.

**6. Rozpoznawanie zamiast przypominania**

Najważniejsze opcje są widoczne w interfejsie, np. wybór trybu gry, lista graczy, aktualna punktacja i historia. Użytkownik nie musi pamiętać poprzednich działań, ponieważ aplikacja pokazuje je w kontekście.

**7. Estetyka i minimalizm**

Interfejs skupia się na elementach potrzebnych do prowadzenia rozgrywki. Ekrany są podzielone na sekcje, a mniej istotne informacje nie dominują nad aktualnym wynikiem i akcjami gracza.

---

### Zasady UCD

Projekt uwzględnia podejście **User-Centered Design**, ponieważ decyzje interfejsowe wynikają z potrzeb użytkownika grającego w czasie rzeczywistym. Aplikacja ma umożliwiać szybkie rozpoczęcie gry, minimalizować liczbę kliknięć, ograniczać ryzyko pomyłek oraz zapewniać czytelną informację zwrotną.

Najważniejsze potrzeby użytkownika to:

- szybkie rozpoczęcie rozgrywki,
- wygodne wpisywanie lub wybieranie trafień,
- jasna informacja, kto aktualnie rzuca,
- możliwość cofnięcia błędnej akcji,
- czytelny wynik na telefonie i desktopie,
- proste dołączanie do pokoju online,
- widoczna informacja o błędach i stanie ładowania.

Z tego powodu aplikacja wykorzystuje duże elementy interaktywne, responsywny układ, komunikaty błędów, loading spinnery, animacje przejść oraz potwierdzenia dla ważnych akcji.

---

### Obserwacje własne

Podczas projektowania założono, że użytkownik często korzysta z aplikacji w dynamicznym kontekście — podczas gry, rozmowy ze znajomymi lub stojąc przy tarczy. Dlatego interfejs powinien być prosty, odporny na pomyłki i możliwy do obsługi na małym ekranie.

Z tego względu szczególny nacisk położono na:

- duże przyciski,
- widoczne aktualne wyniki,
- prostą konfigurację gry,
- ograniczenie liczby kroków przed rozpoczęciem rozgrywki,
- czytelne komunikaty błędów,
- możliwość cofnięcia akcji,
- potwierdzanie działań destrukcyjnych,
- responsywny układ dla telefonu i desktopu.

Dzięki tym decyzjom aplikacja lepiej odpowiada na realne warunki użycia i może być wygodnie wykorzystywana podczas szybkich rozgrywek lokalnych oraz online.

## Autor

**`Kamil Szczebak`**