import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from '../Select'

describe('Select', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ]

  it('renders correctly with default props', () => {
    render(<Select label="Select" options={options} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Select label="Select" options={options} onChange={handleChange} />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '2' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error message when provided', () => {
    render(<Select label="Select" options={options} error="This field is required" />)
    const errorMessage = screen.getByText('This field is required')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('text-red-500')
  })

  it('renders correctly when disabled', () => {
    render(<Select label="Select" options={options} disabled />)
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })
}) 