import { render, screen } from '@testing-library/react'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('renders correctly', () => {
    render(<Footer />)
    expect(screen.getByText('© 2025 AI Sales Copy Generator')).toBeInTheDocument()
  })

  it('renders navigation links correctly', () => {
    render(<Footer />)
    expect(screen.getByText('ホーム')).toHaveAttribute('href', '/')
    expect(screen.getByText('新規作成')).toHaveAttribute('href', '/copies/new')
    expect(screen.getByText('販促コピー一覧')).toHaveAttribute('href', '/copies')
  })
}) 