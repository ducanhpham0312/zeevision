import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./Navbar";
import * as NavigationPath from "./mockdata.json";

// Create a custom render function to include the router context
const customRender = (ui: React.ReactElement, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return render(ui, { wrapper: BrowserRouter });
};

describe("Navbar Component", () => {
  it("renders correctly", () => {
    const { asFragment } = customRender(<Navbar />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders all navigation items", () => {
    customRender(<Navbar />);
    NavigationPath.forEach((navItem) => {
      expect(screen.getByText(navItem.name)).toBeInTheDocument();
    });
  });

  it("navigates to correct path on button click", () => {
    customRender(<Navbar />);
    NavigationPath.forEach((navItem) => {
      fireEvent.click(screen.getByText(navItem.name));
      expect(window.location.pathname).toBe(navItem.path);
    });
  });

  it("highlights the active navigation item", () => {
    NavigationPath.forEach(async (navItem) => {
      customRender(<Navbar />, { route: navItem.path });
      const allButtons = screen.getAllByRole("button", { name: navItem.name });
      // Test the active one button
      const activeButton = allButtons[0];

      // Wait for the expected style to be applied for the active button
      await waitFor(() => {
        const activeStyleDiv = activeButton.querySelector("div");
        expect(activeStyleDiv).not.toBeNull();
        expect(activeStyleDiv).toHaveStyle("height: 4px");
      });
    });
  });
});
