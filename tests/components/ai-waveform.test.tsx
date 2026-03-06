import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AIWaveform } from '@/components/ui/ai-waveform'

describe('AIWaveform', () => {
  it('renders 5 bars', () => {
    const { container } = render(<AIWaveform active={false} />)
    const bars = container.querySelectorAll('span > span')
    expect(bars.length).toBe(5)
  })

  it('has correct aria-label when active', () => {
    render(<AIWaveform active={true} />)
    expect(screen.getByLabelText('AI processing')).toBeInTheDocument()
  })

  it('has correct aria-label when inactive', () => {
    render(<AIWaveform active={false} />)
    expect(screen.getByLabelText('AI idle')).toBeInTheDocument()
  })

  it('accepts custom color prop without throwing', () => {
    expect(() =>
      render(<AIWaveform active={true} color="#FF0000" />)
    ).not.toThrow()
  })
})
