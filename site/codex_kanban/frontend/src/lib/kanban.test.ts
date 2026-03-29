import {
  addCardToColumn,
  createInitialBoard,
  deleteCardFromColumn,
  moveCard,
  renameColumn,
} from "./kanban";

describe("kanban board operations", () => {
  it("renames a column", () => {
    const board = createInitialBoard();
    const next = renameColumn(board, "col-1", "Ideas");

    expect(next.columns[0].name).toBe("Ideas");
  });

  it("adds a card to a column", () => {
    const board = createInitialBoard();
    const beforeCount = board.columns[1].cards.length;
    const next = addCardToColumn(
      board,
      "col-2",
      "Ship release notes",
      "Prepare short copy for this sprint release.",
    );

    expect(next.columns[1].cards).toHaveLength(beforeCount + 1);
    expect(next.columns[1].cards.at(-1)?.title).toBe("Ship release notes");
  });

  it("deletes a card from a column", () => {
    const board = createInitialBoard();
    const next = deleteCardFromColumn(board, "col-1", "card-1");

    expect(next.columns[0].cards.some((card) => card.id === "card-1")).toBe(false);
  });

  it("moves a card between columns", () => {
    const board = createInitialBoard();
    const moved = moveCard(board, "card-1", "col-2");

    expect(moved.columns[0].cards.some((card) => card.id === "card-1")).toBe(false);
    expect(moved.columns[1].cards.some((card) => card.id === "card-1")).toBe(true);
  });
});

