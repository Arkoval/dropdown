# Dropdown

Nowoczesny, dostępny komponent dropdown/select zbudowany w React + TypeScript.

Projekt zawiera:
- pełny komponent Dropdown (Root, Trigger, Content, Item, Chevron)
- hook do renderowania aktualnej wartości (useDropdownValue)
- obsługę klawiatury i typeahead search
- portal rendering do document.body
- pozycjonowanie z obsługą kolizji i RTL
- testy jednostkowe dla logiki i zachowania UI

## Najważniejsze cechy

- Dostępność (A11y): role listbox/option, aria-labelledby, aria-describedby, aria-activedescendant, aria-invalid.
- Klawiatura: ArrowUp/ArrowDown, Home/End, PageUp/PageDown, Enter/Space, Escape, Tab.
- Typeahead: szybkie wyszukiwanie opcji po wpisywanych znakach.
- Portal: content dropdowna renderowany poza kontekstem layoutu, bez problemów z overflow.
- Pozycjonowanie: side, align, offsety, collision handling.
- Tryby controlled i uncontrolled:
  - value / onValueChange
  - open / onOpenChange
  - defaultValue / defaultOpen
- Wsparcie dla stanu disabled i error.
- Dev warning: w trybie deweloperskim komponent ostrzega, gdy w Root brakuje Trigger lub Content.

## Stack technologiczny

- React 19
- TypeScript
- Vite
- Vitest + Testing Library
- ESLint

## Szybki start

Wymagania:
- Node.js 22+
- pnpm

Instalacja i uruchomienie:

```bash
pnpm install
pnpm run dev
```

Build produkcyjny:

```bash
pnpm run build
```

Testy:

```bash
pnpm run test
```

Lint:

```bash
pnpm run lint
```

## Struktura API

Publiczny eksport znajduje się w src/lib/composites/dropdown:

- Dropdown
- Dropdown.Root
- Dropdown.Trigger
- Dropdown.Chevron
- Dropdown.Content
- Dropdown.Item
- useDropdownValue

### Dropdown.Root

Najważniejsze propsy:
- id?: string
- disabled?: boolean
- error?: boolean
- labelledBy?: string
- describedBy?: string
- value?: string | null
- defaultValue?: string | null
- onValueChange?: (value: string | null) => void
- open?: boolean
- defaultOpen?: boolean
- onOpenChange?: (open: boolean) => void

### Dropdown.Content

Najważniejsze propsy:
- maxHeight?: number
- side?: 'top' | 'bottom'
- align?: 'start' | 'center' | 'end'
- sideOffset?: number
- alignOffset?: number
- avoidCollisions?: boolean

### Dropdown.Item

Najważniejsze propsy:
- value: string
- disabled?: boolean
- valueContent?: ReactNode
- textValue?: string

## useDropdownValue

Hook do odczytu aktualnie wybranej opcji i renderowania niestandardowej wartości w Triggerze.

Zwraca:
- value: string | null
- selectedItem: aktualnie wybrany rekord (lub null)
- items: lista wszystkich zarejestrowanych opcji
- disabled: boolean
- error: boolean

## Przykład użycia

```tsx
import { Dropdown, useDropdownValue } from './lib/composites/dropdown'

function TriggerValue({ placeholder }: { placeholder?: string }) {
  const { selectedItem } = useDropdownValue()

  return <span style={{ flex: 1 }}>{selectedItem?.content ?? placeholder}</span>
}

function Example() {
  return (
    <Dropdown.Root id="country" labelledBy="country-label" describedBy="country-hint">
      <Dropdown.Trigger>
        <TriggerValue placeholder="Select country" />
        <Dropdown.Chevron />
      </Dropdown.Trigger>

      <Dropdown.Content side="bottom" align="start" avoidCollisions>
        <Dropdown.Item value="pl" textValue="Poland">
          Poland
        </Dropdown.Item>
        <Dropdown.Item value="de" textValue="Germany">
          Germany
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  )
}
```

## Zachowanie i dostępność

- Fokus po otwarciu przechodzi na listbox.
- Klik poza komponent zamyka dropdown.
- Escape zamyka dropdown i zwraca fokus na trigger.
- Enter/Space wybiera aktywną opcję.
- Scroll strony jest blokowany przy otwartym dropdownie i przywracany po zamknięciu.
- Pozycjonowanie jest aktualizowane przy zmianach viewportu i rozmiarów elementów.

## Demo

W projekcie jest gotowy ekran demonstracyjny w src/App.tsx, pokazujący:
- podstawowy dropdown z listą osób
- walidację i stany (disabled/clean/error)
- przykład disabled i RTL