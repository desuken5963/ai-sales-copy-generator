import { render, screen } from '@testing-library/react'
import { Header } from '../Header'

describe('Header', () => {
  it('renders correctly', () => {
    render(<Header />)
    expect(screen.getByText('AI Copy Generator')).toBeInTheDocument()
    expect(screen.getByText('新規作成')).toBeInTheDocument()
    expect(screen.getByText('販促コピー一覧')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    render(<Header />)
    const newLink = screen.getByText('新規作成').closest('a')
    const copiesLink = screen.getByText('販促コピー一覧').closest('a')

    expect(newLink).toHaveAttribute('href', '/copy/new')
    expect(copiesLink).toHaveAttribute('href', '/copies')
  })
}) 