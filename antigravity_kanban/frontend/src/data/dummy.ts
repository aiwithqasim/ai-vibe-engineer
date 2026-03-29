import { CardType, ColumnType } from '@/types/kanban';

export const initialColumns: ColumnType[] = [
  { id: 'col-1', title: 'Backlog' },
  { id: 'col-2', title: 'To Do' },
  { id: 'col-3', title: 'In Progress' },
  { id: 'col-4', title: 'Review' },
  { id: 'col-5', title: 'Done' },
];

export const initialCards: CardType[] = [
  { id: 'card-1', columnId: 'col-1', title: 'Setup Repository', description: 'Initialize the base repository with Next.js.' },
  { id: 'card-2', columnId: 'col-2', title: 'Design System', description: 'Implement the premium color scheme and typography.' },
  { id: 'card-3', columnId: 'col-2', title: 'Build Components', description: 'Create Board, Column, and Card components.' },
  { id: 'card-4', columnId: 'col-3', title: 'Research DnD', description: 'Evaluate @dnd-kit vs react-beautiful-dnd.' },
  { id: 'card-5', columnId: 'col-4', title: 'Code Review', description: 'Review the initial Kanban project code.' },
];
