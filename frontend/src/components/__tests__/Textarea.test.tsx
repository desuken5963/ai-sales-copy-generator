import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from '../Textarea'

describe('Textarea', () => {
  it('renders correctly with default props', () => {
    render(<Textarea label="Description" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Textarea label="Description" onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello World' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error message when provided', () => {
    render(<Textarea label="Description" error="This field is required" />)
    const errorMessage = screen.getByText('This field is required')
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('text-red-500')
  })

  it('renders correctly when disabled', () => {
    render(<Textarea label="Description" disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })
}) 