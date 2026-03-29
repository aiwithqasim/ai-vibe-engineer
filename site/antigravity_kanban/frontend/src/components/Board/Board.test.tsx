import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Board } from './Board';

describe('Kanban Board', () => {
  it('renders initial columns', () => {
    render(<Board />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders initial dummy cards', () => {
    render(<Board />);
    expect(screen.getByText('Setup Repository')).toBeInTheDocument();
    expect(screen.getByText('Design System')).toBeInTheDocument();
  });

  it('can add a new card', () => {
    render(<Board />);
    const addBtns = screen.getAllByRole('button', { name: /\+ Add Card/i });
    fireEvent.click(addBtns[0]); // Click Add on first column

    const titleInput = screen.getByPlaceholderText('Task title...');
    const descInput = screen.getByPlaceholderText('Details (optional)...');
    
    fireEvent.change(titleInput, { target: { value: 'New Test Card' } });
    fireEvent.change(descInput, { target: { value: 'Test description' } });
    
    const submitBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitBtn);

    expect(screen.getByText('New Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('can delete a card', () => {
    render(<Board />);
    
    expect(screen.getByText('Setup Repository')).toBeInTheDocument();
    
    const deleteBtns = screen.getAllByTitle('Delete Card');
    fireEvent.click(deleteBtns[0]);

    expect(screen.queryByText('Setup Repository')).not.toBeInTheDocument();
  });

  it('can rename a column', () => {
    render(<Board />);
    // Get the title text explicitly. The word 'Backlog' exists inside the h3 along with the count.
    // We'll click the heading itself.
    const backlogHeading = screen.getByRole('heading', { name: /Backlog/i });
    fireEvent.click(backlogHeading); // enters edit mode

    // find active input
    const input = screen.getByDisplayValue('Backlog');
    fireEvent.change(input, { target: { value: 'New Column Name' } });
    fireEvent.blur(input); // trigger rename

    expect(screen.getByText(/New Column Name/i)).toBeInTheDocument();
  });
});
