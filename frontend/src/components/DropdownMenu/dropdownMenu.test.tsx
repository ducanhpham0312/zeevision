import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";

function renderDropdownMenu() {
  return render(
    <div style={{ pointerEvents: "auto" }}>
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>,
  );
}

describe("DropdownMenu Component", () => {
  let triggerButton: HTMLElement;

  beforeEach(() => {
    renderDropdownMenu();
    triggerButton = screen.getByText("Options");
  });

  it("render snapshot correctly", async () => {
    const { baseElement } = renderDropdownMenu();
    // Initial snapshot before interaction
    expect(baseElement).toMatchSnapshot();

    // Wait for the menu items to be in the document
    await userEvent.click(triggerButton);
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
    // Add a debug statement here
    screen.debug();
    // Take a snapshot after the menu items are confirmed to be present
    expect(baseElement).toMatchSnapshot();
  });

  it("renders DropdownMenu and its items", async () => {
    // Check if the trigger is rendered
    expect(screen.getByText("Options")).toBeInTheDocument();

    // Check if the menu items are rendered - Initially not visible
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();

    // Wait for the menu items to be in the document
    await userEvent.click(triggerButton);
    await waitFor(() => expect(screen.getByText("Item 1")).toBeInTheDocument());
  });

  it("opens and closes the dropdown on trigger click", async () => {
    // Initially, the menu is closed
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();

    // Open the menu
    await userEvent.click(triggerButton);
    await waitFor(() => expect(screen.getByText("Item 1")).toBeInTheDocument());

    // Close the menu
    await userEvent.click(triggerButton);
    await waitFor(() =>
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument(),
    );
  });
});
