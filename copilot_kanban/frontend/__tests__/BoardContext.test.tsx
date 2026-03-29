import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BoardProvider, useBoard } from '@/context/BoardContext'

// Test component that uses the context
const TestComponent = () => {
  const { board, updateColumnTitle, addCard, deleteCard } = useBoard()
  return (
    <div>
      <div data-testid="column-title">{board.columns.col1.title}</div>
      <div data-testid="card-count">{board.columns.col1.cardIds.length}</div>
      <button onClick={() => updateColumnTitle('col1', 'Updated')}>Update Title</button>
      <button onClick={() => addCard('col1', 'New Card', 'Details')}>Add Card</button>
      <button onClick={() => deleteCard('card1')}>Delete Card</button>
    </div>
  )
}

describe('BoardContext', () => {
  it('renders with initial board state', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    )
    expect(screen.getByTestId('column-title')).toHaveTextContent('To Do')
    expect(screen.getByTestId('card-count')).toHaveTextContent('2')
  })

  it('updates column title', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: /update title/i }))
    expect(screen.getByTestId('column-title')).toHaveTextContent('Updated')
  })

  it('adds a card to a column', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    )
    const initialCount = screen.getByTestId('card-count').textContent
    fireEvent.click(screen.getByRole('button', { name: /add card/i }))
    const updatedCount = screen.getByTestId('card-count').textContent
    expect(parseInt(updatedCount || '0')).toBe(parseInt(initialCount || '0') + 1)
  })

  it('deletes a card from the board', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    )
    const initialCount = screen.getByTestId('card-count').textContent
    fireEvent.click(screen.getByRole('button', { name: /delete card/i }))
    const updatedCount = screen.getByTestId('card-count').textContent
    expect(parseInt(updatedCount || '0')).toBe(parseInt(initialCount || '0') - 1)
  })
})
