import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Dropdown, useDropdownValue } from './index'

function TriggerValue() {
  const { selectedItem } = useDropdownValue()
  return <span data-testid="trigger-value">{selectedItem?.content ?? 'EMPTY'}</span>
}

function DropdownFixture(props?: { defaultValue?: string | null; open?: boolean }) {
  return (
    <Dropdown.Root id="test" defaultValue={props?.defaultValue ?? null} open={props?.open}>
      <Dropdown.Trigger aria-label="Select option">
        <TriggerValue />
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item value="alpha">Alpha</Dropdown.Item>
        <Dropdown.Item value="beta">Beta</Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  )
}

describe('Dropdown', () => {
  it('keeps selected value visible when dropdown is closed', async () => {
    render(<DropdownFixture defaultValue="beta" />)

    const trigger = screen.getByRole('button', { name: 'Select option' })

    await waitFor(() => {
      expect(within(trigger).getByTestId('trigger-value').textContent).toBe('Beta')
    })

    fireEvent.click(trigger)
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(within(trigger).getByTestId('trigger-value').textContent).toBe('Beta')
    })
  })

  it('updates selected value after choosing another option', async () => {
    render(<DropdownFixture defaultValue="alpha" />)

    const trigger = screen.getByRole('button', { name: 'Select option' })

    await waitFor(() => {
      expect(within(trigger).getByTestId('trigger-value').textContent).toBe('Alpha')
    })

    fireEvent.click(trigger)

    const option = await screen.findByRole('option', { name: 'Beta' })
    fireEvent.click(option)

    await waitFor(() => {
      expect(within(trigger).getByTestId('trigger-value').textContent).toBe('Beta')
    })
  })

  it('locks and restores body scroll correctly across multiple open dropdowns', async () => {
    document.body.style.overflow = 'auto'

    const { rerender } = render(
      <>
        <DropdownFixture open />
        <DropdownFixture open />
      </>,
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    rerender(
      <>
        <DropdownFixture open={false} />
        <DropdownFixture open />
      </>,
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    rerender(
      <>
        <DropdownFixture open={false} />
        <DropdownFixture open={false} />
      </>,
    )

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('auto')
    })
  })

  it('sets and maintains core a11y attributes for trigger and listbox', async () => {
    render(
      <>
        <label id="dropdown-label" htmlFor="a11y-trigger">Country</label>
        <p id="dropdown-hint">Choose one option</p>
        <Dropdown.Root
          id="a11y"
          labelledBy="dropdown-label"
          describedBy="dropdown-hint"
          error
        >
          <Dropdown.Trigger>
            <TriggerValue />
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item value="alpha">Alpha</Dropdown.Item>
            <Dropdown.Item value="beta">Beta</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      </>,
    )

    const trigger = screen.getByRole('button', { name: 'Country' })

    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-labelledby')).toBe('dropdown-label')
    expect(trigger.getAttribute('aria-describedby')).toBe('dropdown-hint')
    expect(trigger.getAttribute('aria-invalid')).toBe('true')

    fireEvent.click(trigger)

    const listbox = await screen.findByRole('listbox')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(listbox.getAttribute('aria-labelledby')).toBe('dropdown-label')

    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    await waitFor(() => {
      expect(listbox.getAttribute('aria-activedescendant')).toBeTruthy()
    })

    const betaOption = await screen.findByRole('option', { name: 'Beta' })
    fireEvent.click(betaOption)

    fireEvent.click(trigger)

    const selectedBetaOption = await screen.findByRole('option', { name: 'Beta' })
    expect(selectedBetaOption.getAttribute('aria-selected')).toBe('true')
  })

  it('respects RTL direction from the document and propagates it to root', async () => {
    document.documentElement.dir = 'rtl'

    render(<DropdownFixture />)

    const trigger = screen.getByRole('button', { name: 'Select option' })
    const root = trigger.closest('[dir]')

    expect(root?.getAttribute('dir')).toBe('rtl')

    fireEvent.click(trigger)

    const listbox = await screen.findByRole('listbox')
    const portalWrapper = listbox.parentElement?.parentElement as HTMLDivElement | null

    await waitFor(() => {
      expect(portalWrapper).not.toBeNull()
      expect(portalWrapper?.style.right).not.toBe('')
    })
  })

  it('warns in development when Dropdown.Trigger is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <Dropdown.Root id="missing-trigger">
        <Dropdown.Content>
          <Dropdown.Item value="alpha">Alpha</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>,
    )

    expect(warnSpy).toHaveBeenCalledWith(
      'Dropdown.Root should contain a <Dropdown.Trigger> child to provide an interactive trigger element.',
    )

    warnSpy.mockRestore()
  })

  it('warns in development when Dropdown.Content is missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <Dropdown.Root id="missing-content">
        <Dropdown.Trigger aria-label="Select option">
          <TriggerValue />
        </Dropdown.Trigger>
      </Dropdown.Root>,
    )

    expect(warnSpy).toHaveBeenCalledWith(
      'Dropdown.Root should contain a <Dropdown.Content> child to provide the listbox content.',
    )

    warnSpy.mockRestore()
  })
})
