import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

describe("kanban home page", () => {
  it("renders five columns", () => {
    render(<Home />);
    expect(screen.getAllByLabelText("Column Name")).toHaveLength(5);
  });

  it("can rename a column", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const firstColumn = screen.getByTestId("column-name-col-1");
    await user.clear(firstColumn);
    await user.type(firstColumn, "Ideas");

    expect(firstColumn).toHaveValue("Ideas");
  });

  it("can add and delete a card", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByTestId("new-card-title-col-1"), "Polish handoff notes");
    await user.type(
      screen.getByTestId("new-card-details-col-1"),
      "Write concise release notes for stakeholders.",
    );
    await user.click(screen.getByTestId("add-card-col-1"));

    expect(screen.getByText("Polish handoff notes")).toBeInTheDocument();

    const newCardHeading = screen.getByText("Polish handoff notes");
    const cardElement = newCardHeading.closest("article");
    expect(cardElement).not.toBeNull();
    const deleteButton = cardElement!.querySelector("button");
    expect(deleteButton).not.toBeNull();
    await user.click(deleteButton!);

    expect(screen.queryByText("Polish handoff notes")).not.toBeInTheDocument();
  });
});
