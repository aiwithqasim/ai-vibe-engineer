export type KanbanCard = {
  id: string;
  title: string;
  details: string;
};

export type KanbanColumn = {
  id: string;
  name: string;
  cards: KanbanCard[];
};

export type KanbanBoard = {
  columns: KanbanColumn[];
};

const initialColumns: KanbanColumn[] = [
  {
    id: "col-1",
    name: "Backlog",
    cards: [
      {
        id: "card-1",
        title: "Craft onboarding tour",
        details: "Create a short first-run walkthrough for new teammates.",
      },
      {
        id: "card-2",
        title: "Gather launch screenshots",
        details: "Collect polished board views for product announcements.",
      },
    ],
  },
  {
    id: "col-2",
    name: "Ready",
    cards: [
      {
        id: "card-3",
        title: "Finalize color tokens",
        details: "Align yellow, blue, purple, navy, and gray usage in UI.",
      },
    ],
  },
  {
    id: "col-3",
    name: "In Progress",
    cards: [
      {
        id: "card-4",
        title: "Implement card drag-and-drop",
        details: "Support smooth movement across all five columns.",
      },
    ],
  },
  {
    id: "col-4",
    name: "Review",
    cards: [
      {
        id: "card-5",
        title: "Run visual QA pass",
        details: "Validate spacing and contrast across desktop and mobile.",
      },
    ],
  },
  {
    id: "col-5",
    name: "Done",
    cards: [
      {
        id: "card-6",
        title: "Set up project scaffold",
        details: "Create client-rendered Next.js foundation in frontend folder.",
      },
    ],
  },
];

let cardCounter = 7;

export const createInitialBoard = (): KanbanBoard => ({
  columns: initialColumns.map((column) => ({
    ...column,
    cards: [...column.cards],
  })),
});

export const renameColumn = (
  board: KanbanBoard,
  columnId: string,
  nextName: string,
): KanbanBoard => ({
  columns: board.columns.map((column) =>
    column.id === columnId ? { ...column, name: nextName } : column,
  ),
});

export const addCardToColumn = (
  board: KanbanBoard,
  columnId: string,
  title: string,
  details: string,
): KanbanBoard => {
  const trimmedTitle = title.trim();
  const trimmedDetails = details.trim();

  if (!trimmedTitle || !trimmedDetails) {
    return board;
  }

  const newCard: KanbanCard = {
    id: `card-${cardCounter++}`,
    title: trimmedTitle,
    details: trimmedDetails,
  };

  return {
    columns: board.columns.map((column) =>
      column.id === columnId
        ? { ...column, cards: [...column.cards, newCard] }
        : column,
    ),
  };
};

export const deleteCardFromColumn = (
  board: KanbanBoard,
  columnId: string,
  cardId: string,
): KanbanBoard => ({
  columns: board.columns.map((column) =>
    column.id === columnId
      ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
      : column,
  ),
});

const findColumnByCard = (board: KanbanBoard, cardId: string) =>
  board.columns.find((column) =>
    column.cards.some((card) => card.id === cardId),
  );

const removeCard = (column: KanbanColumn, cardId: string): [KanbanCard | null, KanbanColumn] => {
  const nextCards: KanbanCard[] = [];
  let removedCard: KanbanCard | null = null;

  for (const card of column.cards) {
    if (card.id === cardId) {
      removedCard = card;
      continue;
    }

    nextCards.push(card);
  }

  return [removedCard, { ...column, cards: nextCards }];
};

const insertCardAt = (
  cards: KanbanCard[],
  card: KanbanCard,
  targetCardId?: string,
): KanbanCard[] => {
  if (!targetCardId) {
    return [...cards, card];
  }

  const targetIndex = cards.findIndex((item) => item.id === targetCardId);
  if (targetIndex < 0) {
    return [...cards, card];
  }

  const nextCards = [...cards];
  nextCards.splice(targetIndex, 0, card);
  return nextCards;
};

export const moveCard = (
  board: KanbanBoard,
  cardId: string,
  destinationColumnId: string,
  beforeCardId?: string,
): KanbanBoard => {
  const sourceColumn = findColumnByCard(board, cardId);
  const destinationColumn = board.columns.find(
    (column) => column.id === destinationColumnId,
  );

  if (!sourceColumn || !destinationColumn) {
    return board;
  }

  if (
    sourceColumn.id === destinationColumnId &&
    (beforeCardId === cardId || !beforeCardId)
  ) {
    return board;
  }

  const [movedCard, cleanedSource] = removeCard(sourceColumn, cardId);
  if (!movedCard) {
    return board;
  }

  const destinationBase =
    sourceColumn.id === destinationColumn.id ? cleanedSource : destinationColumn;

  const nextDestination: KanbanColumn = {
    ...destinationBase,
    cards: insertCardAt(destinationBase.cards, movedCard, beforeCardId),
  };

  return {
    columns: board.columns.map((column) => {
      if (column.id === sourceColumn.id) {
        return cleanedSource;
      }

      if (column.id === destinationColumn.id) {
        return nextDestination;
      }

      return column;
    }),
  };
};

