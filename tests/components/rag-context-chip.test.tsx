import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RAGContextChip } from '@/components/ui/rag-context-chip'

describe('RAGContextChip', () => {
  it('renders nothing when chunks is empty', () => {
    const { container } = render(<RAGContextChip chunks={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows chunk count in button', () => {
    const chunks = [
      { filePath: 'src/a.ts', content: 'const x = 1', score: 0.9 },
      { filePath: 'src/b.ts', content: 'const y = 2', score: 0.7 },
    ]
    render(<RAGContextChip chunks={chunks} />)
    expect(screen.getByText(/2 chunks loaded/i)).toBeInTheDocument()
  })

  it('opens popover on click', () => {
    const chunks = [
      { filePath: 'src/a.ts', content: 'const x = 1', score: 0.85 },
    ]
    render(<RAGContextChip chunks={chunks} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('src/a.ts')).toBeInTheDocument()
  })

  it('shows score as percentage', () => {
    const chunks = [
      { filePath: 'src/a.ts', content: 'hello', score: 0.92 },
    ]
    render(<RAGContextChip chunks={chunks} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('92%')).toBeInTheDocument()
  })

  it('closes popover on second click', () => {
    const chunks = [
      { filePath: 'src/a.ts', content: 'hello', score: 0.5 },
    ]
    render(<RAGContextChip chunks={chunks} />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText('src/a.ts')).not.toBeInTheDocument()
  })
})
