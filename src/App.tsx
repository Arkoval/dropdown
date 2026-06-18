import { useEffect, useRef, useState } from 'react'
import { Dropdown, useDropdownValue } from './lib/composites/dropdown'
import { Label } from './lib/primitives/label'
import { Tip } from './lib/primitives/tip'
import { Hint } from './lib/primitives/hint'
import { Message } from './lib/primitives/message'
import './App.css'

type CountryOption = {
  value: string
  label: string
  dialCode: string
}

const peopleOptions = [
  { value: 'lana', name: 'Lana Travis' },
  { value: 'arielle', name: 'Arielle Bolton' },
  { value: 'dale', name: 'Dale Crawford' },
  { value: 'jamar', name: 'Jamar Cochran' },
  { value: 'madelyn', name: 'Madelyn Petersen' },
  { value: 'carly', name: 'Carly Velez' },
  { value: 'reina', name: 'Reina Pitts' },
  { value: 'antonio', name: 'Antonio Bullock' },
  { value: 'josue', name: 'Josue Nguyen' },
]

const countryOptions: CountryOption[] = [
  { value: 'pl', label: '🇵🇱 Poland', dialCode: '+48' },
  { value: 'de', label: '🇩🇪 Germany', dialCode: '+49' },
  { value: 'fr', label: '🇫🇷 France', dialCode: '+33' },
  { value: 'ua', label: '🇺🇦 Ukraine', dialCode: '+380' },
]

const languageOptions = [
  { value: 'ar', label: 'العربية' },
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
]

function renderCountryOption(country: CountryOption) {
  return (
    <Dropdown.Item
      key={country.value}
      value={country.value}
      textValue={country.label}
      valueContent={<span className="valuePill">{country.label}</span>}
    >
      <span className="itemTitle">{country.label}</span>
      <span className="itemMeta">{country.dialCode}</span>
    </Dropdown.Item>
  )
}

// Custom value component using the hook
function CustomDropdownValue({ placeholder }: { placeholder?: string }) {
  const { selectedItem, disabled, error } = useDropdownValue()

  const placeholderColor = disabled
    ? 'var(--color-text-disabled)'
    : error
      ? 'var(--color-error)'
      : 'var(--color-text-subtle)'

  return (
    <span style={{ flex: 1, minWidth: 0 }}>
      {selectedItem ? (
        selectedItem.valueContent ?? selectedItem.content
      ) : (
        <span
          style={{
            color: placeholderColor,
          }}
        >
          {placeholder}
        </span>
      )}
    </span>
  )
}

function App() {
  const [person, setPerson] = useState<string | null>('carly')
  const [country, setCountry] = useState<string | null>('pl')
  const [countryDisabled, setCountryDisabled] = useState(false)
  const [countryClean, setCountryClean] = useState(false)
  const [countryError, setCountryError] = useState(false)
  const [rtlEnabled, setRtlEnabled] = useState(document.documentElement.dir === 'rtl')
  const initialDocumentDirRef = useRef(document.documentElement.dir)

  const handleCountryValueChange = (nextValue: string | null) => {
    setCountry(nextValue)
    if (nextValue !== null && countryClean) {
      setCountryClean(false)
    }
  }

  const handleCountryCleanChange = (isChecked: boolean) => {
    setCountryClean(isChecked)
    if (isChecked) {
      setCountry(null)
    }
  }

  useEffect(() => {
    const initialDocumentDir = initialDocumentDirRef.current
    document.documentElement.dir = rtlEnabled ? 'rtl' : 'ltr'

    return () => {
      document.documentElement.dir = initialDocumentDir
    }
  }, [rtlEnabled])

  return (
    <main className="demoLayout">
      <header className="demoHeader">
        <h1>Dropdown</h1>
        <fieldset className="stateControls">
          <legend>Global settings</legend>
          <label className="stateControl">
            <input
              type="checkbox"
              checked={rtlEnabled}
              onChange={(event) => setRtlEnabled(event.target.checked)}
            />
            Enable RTL (Right-to-Left)
          </label>
        </fieldset>
      </header>

      <section className="demoContainer" aria-label="Dropdown examples">
        <article className="demoCard">
          <h2>People selector</h2>
          <div className="stateControlsPlaceholder" aria-hidden="true" />
          <div className="fieldLabelRow">
            <Label id="people-label" htmlFor="people-trigger">Label text example</Label>
            <Tip text="Search by typing the first letter of a name" />
          </div>
          <Dropdown.Root
            className="demoDropdownRoot"
            id="people"
            value={person}
            onValueChange={setPerson}
            labelledBy="people-label"
            describedBy="people-hint"
          >
            <Dropdown.Trigger>
              <CustomDropdownValue placeholder="Select person" />
              <Dropdown.Chevron />
            </Dropdown.Trigger>
            <Dropdown.Content maxHeight={300}>
              {peopleOptions.map((personOption) => (
                <Dropdown.Item
                  key={personOption.value}
                  value={personOption.value}
                  textValue={personOption.name}
                >
                  {personOption.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown.Root>
          <Hint id="people-hint">Type first letter to jump to item.</Hint>
        </article>

        <article className="demoCard">
          <h2>With hints and validation</h2>
          <fieldset className="stateControls">
            <legend>Preview states</legend>
            <label className="stateControl">
              <input
                type="checkbox"
                checked={countryDisabled}
                onChange={(event) => setCountryDisabled(event.target.checked)}
              />
              disabled
            </label>
            <label className="stateControl">
              <input
                type="checkbox"
                checked={countryClean}
                onChange={(event) => handleCountryCleanChange(event.target.checked)}
              />
              clean
            </label>
            <label className="stateControl">
              <input
                type="checkbox"
                checked={countryError}
                onChange={(event) => setCountryError(event.target.checked)}
              />
              error
            </label>
          </fieldset>
          <div className="fieldLabelRow">
            <Label id="country-label" htmlFor="country-trigger" required>
              Billing country
            </Label>
            <Tip text="Used in legal and payment forms" />
          </div>
          <Dropdown.Root
            className="demoDropdownRoot"
            id="country"
            value={country}
            onValueChange={handleCountryValueChange}
            disabled={countryDisabled}
            error={countryError}
            labelledBy="country-label"
            describedBy="country-message country-hint"
          >
            <Dropdown.Trigger>
              <CustomDropdownValue placeholder="Choose a country" />
              <Dropdown.Chevron />
            </Dropdown.Trigger>
            <Dropdown.Content side="bottom" align="start" avoidCollisions>
              {countryOptions.map(renderCountryOption)}
            </Dropdown.Content>
          </Dropdown.Root>
          <Message id="country-message" markdown tone={countryError ? 'error' : 'info'}>
            {countryError
              ? 'Please select a valid country before continuing.'
              : 'Country selection affects tax calculation and available payment methods.'}
          </Message>
          <Hint id="country-hint" markdown>
            {countryClean
              ? 'Clean clears only the selected value. Options remain available.'
              : 'Type **first letter** to jump to item. Use **ArrowDown/Up**, **PageDown/Up**, **Home/End**.'}
          </Hint>
        </article>

        <article className="demoCard">
          <h2>Disabled state</h2>
          <div className="stateControlsPlaceholder" aria-hidden="true" />
          <div className="fieldLabelRow">
            <Label id="language-label" htmlFor="language-trigger">Interface language</Label>
            <Tip text="Language selection affects text direction" />
          </div>
          <Dropdown.Root
            className="demoDropdownRoot"
            id="language"
            disabled
            defaultValue="en"
            labelledBy="language-label"
            describedBy="language-hint"
          >
            <Dropdown.Trigger>
              <CustomDropdownValue placeholder="Select language" />
              <Dropdown.Chevron />
            </Dropdown.Trigger>
            <Dropdown.Content>
              {languageOptions.map((languageOption) => (
                <Dropdown.Item
                  key={languageOption.value}
                  value={languageOption.value}
                  textValue={languageOption.label}
                >
                  {languageOption.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown.Root>
          <Hint id="language-hint">
            Component preserves semantic structure even when disabled. Enable RTL above to see right-to-left layout.
          </Hint>
        </article>
      </section>
    </main>
  )
}

export default App
