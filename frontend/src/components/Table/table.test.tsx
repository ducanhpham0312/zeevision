import { render, fireEvent, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Table } from ".";
import * as mockdata from "./mockdata.json";
import userEvent from "@testing-library/user-event";

const { headers: verticalHeaders, content: verticalContent } =
  mockdata.vertical;

const { headers: horizontalHeaders, content: horizontalContent } =
  mockdata.horizontal;
const horizontalOrientation = "horizontal";
const verticalOrientation = "vertical";

describe("VerticalTable Component", () => {
  it("renders correctly", () => {
    const { asFragment } = render(
      <Table
        orientation={verticalOrientation}
        header={verticalHeaders}
        content={verticalContent}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not throw error when content is empty", () => {
    const { container } = render(
      <Table
        orientation={verticalOrientation}
        header={verticalHeaders}
        content={[]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("HorizontalTable Component", () => {
  it("renders correctly", () => {
    const { asFragment } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("header and content included in table when both props are passed", () => {
    const { getByText, getAllByText } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );
    expect(getByText("Variable Value")).toBeInTheDocument();
    expect(getAllByText("multi-instance-process")[0]).toBeInTheDocument();
    expect(getAllByText("multi-instance-process").length).toEqual(6);
  });

  it("renders header and empty row when the content is empty", () => {
    const component = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={[]}
      />,
    );
    expect(component.getByRole("table")).toBeInTheDocument();
    expect(component.getAllByRole("row").length).toEqual(2);
    expect(component.getAllByRole("button")[0]).toBeInTheDocument();
  });

  it("does not throw error when all props are empty", () => {
    const { container } = render(
      <Table orientation={horizontalOrientation} header={[]} content={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("table should sort by column ascending when clicking the column name", () => {
    const { getByText } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );
    fireEvent.click(getByText("Variable Name"));
    expect(getByText("Variable Name")).toBeInTheDocument();
    expect(getByText("▲")).toBeInTheDocument();

    const html = document.body.innerHTML;
    const higher = html.search("kmean");
    const lower = html.search("isValid");
    expect(higher).toBeGreaterThan(lower);
  });

  it("table should sort by column descending when clicking the column name twice", () => {
    const { getByText } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );
    fireEvent.click(getByText("Variable Name"));
    fireEvent.click(getByText("Variable Name"));
    expect(getByText("Variable Name")).toBeInTheDocument();
    expect(getByText("▼")).toBeInTheDocument();

    const html = document.body.innerHTML;
    const higher = html.search("kmean");
    const lower = html.search("isValid");
    expect(higher).toBeLessThan(lower);
  });

  it("should set page correctly", () => {
    const { getByText, getByRole } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );

    expect(getByText("1-10 of 12")).toBeInTheDocument();
    fireEvent.click(
      getByRole("button", {
        name: "2",
      }),
    );
    expect(getByText("11-12 of 12")).toBeInTheDocument();
  });

  it("should set rows per page correctly", () => {
    const { getByTestId, container } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );
    fireEvent.change(getByTestId("select"), { target: { value: 10 } });
    expect(container.querySelector("tbody")?.childElementCount).toEqual(10);

    fireEvent.change(getByTestId("select"), { target: { value: 25 } });
    expect(container.querySelector("tbody")?.childElementCount).toEqual(12);
  });

  it("filters data correctly with the main filter", () => {
    const { asFragment, getByPlaceholderText, getByRole, getAllByRole } =
      render(
        <Table
          orientation={horizontalOrientation}
          header={horizontalHeaders}
          content={horizontalContent}
          filterConfig={{
            mainFilter: {
              column: "Variable Name",
            },
            filterOptions: {
              "Variable Name": "string",
              "Variable Value": "string",
              "Time created": "string",
            },
          }}
        />,
      );
    expect(asFragment()).toMatchSnapshot();
    expect(getByPlaceholderText("Search by Variable Name")).toBeInTheDocument();
    fireEvent.change(getByRole("textbox"), { target: { value: "isValid" } });
    expect(getAllByRole("row").length).toEqual(2);
  });
});

describe("Using Filtering", () => {
  beforeEach(() => {
    render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
        filterConfig={{
          mainFilter: {
            column: "Variable Name",
          },
          filterOptions: {
            "Variable Name": "string",
            "Time created": "time",
          },
        }}
      />,
    );
  });

  it("filters correctly with dropdown using single filer", async () => {
    const user = userEvent.setup();
    const tableBody = document.getElementsByTagName("tbody")[0];
    const filterButton = screen.getByText("Filter");
    await user.click(filterButton);

    const menu = screen.getByRole("menu");
    const menuItems = screen.getAllByRole("menuitem");
    const variableNameElement = menuItems[0];
    const timeElement = menuItems[1];

    fireEvent.click(variableNameElement);

    // Verify that the first dropdown renders correctly
    expect(menu).toBeInTheDocument();
    expect(variableNameElement.textContent).toBe("Variable Name ");
    expect(timeElement.textContent).toBe("Time created ");
    expect(menuItems.length).toEqual(3);

    await user.hover(variableNameElement);
    const isFilterElement = screen.getAllByRole("menuitem")[3];
    const isnotFilterElement = screen.getByText("is not");
    const containsFilterElement = screen.getByText("contains");

    // Apply values to `is` filter
    fireEvent.click(isFilterElement);
    const isFilterTextbox = screen.getAllByRole("textbox")[0];
    expect(isFilterTextbox).toBeInTheDocument();
    fireEvent.change(isFilterTextbox, { target: { value: 12 } });
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(
      screen.getByText("No data satisfying selection."),
    ).toBeInTheDocument();

    fireEvent.change(isFilterTextbox, { target: { value: "isValid" } });
    expect(within(tableBody).getAllByText("isValid").length).toBe(2);
    fireEvent.click(isFilterElement);

    // Apply values to `is not` filter
    fireEvent.click(isnotFilterElement);
    const isnotFilterTextbox = screen.getAllByRole("textbox")[0];
    fireEvent.change(isnotFilterTextbox, {
      target: { value: 12 },
    });
    expect(screen.getByText(12)).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(10);
    fireEvent.change(isnotFilterTextbox, { target: { value: "total" } });
    expect(tableBody.childElementCount).toBe(horizontalContent.length - 3);
    expect(within(tableBody).queryAllByText("total").length).toBe(0);
    fireEvent.click(isnotFilterElement);

    // Apply values to `contains` filter
    fireEvent.click(containsFilterElement);
    const containsFilterTextbox = screen.getAllByRole("textbox")[0];
    fireEvent.change(containsFilterTextbox, {
      target: { value: "search phrase" },
    });
    expect(screen.getByText("search phrase")).toBeInTheDocument();
    expect(
      screen.queryByText("No data satisfying selection."),
    ).toBeInTheDocument();
    fireEvent.change(containsFilterTextbox, { target: { value: "kmea" } });
    expect(tableBody.childElementCount).toBe(1);

    // Test clear column filter
    fireEvent.click(screen.getByText("Clear column filters"));
    expect(screen.queryByText("kmea")).not.toBeInTheDocument();
  });

  it("using Popover", async () => {
    const user = userEvent.setup();
    const tableBody = document.getElementsByTagName("tbody")[0];
    const filterButton = screen.getByText("Filter");
    await user.click(filterButton);
    const variableNameElement = screen.getAllByRole("menuitem")[0];

    fireEvent.click(variableNameElement);

    await user.hover(variableNameElement);
    const isFilterElement = screen.getAllByRole("menuitem")[3];

    // Apply values to `is` filter
    fireEvent.click(isFilterElement);
    const isFilterTextbox = screen.getAllByRole("textbox")[0];
    fireEvent.change(isFilterTextbox, { target: { value: "search phrase" } });
    fireEvent.click(screen.getByText("search phrase"));
    const filterPopup = screen.getByTestId("filter-popup");
    expect(within(filterPopup).findByText("Edit filter")).toBeDefined();
    fireEvent.change(screen.getByPlaceholderText("Enter value..."), {
      target: { value: "kmean" },
    });

    expect(tableBody.childElementCount).toBe(1);
    fireEvent.click(screen.getAllByText("kmean")[0]);
  });

  it("using Date filter", async () => {
    const user = userEvent.setup();
    const tableBody = document.getElementsByTagName("tbody")[0];
    const filterButton = screen.getByText("Filter");
    await user.click(filterButton);
    fireEvent.click(screen.getAllByRole("menuitem")[1]);

    const futureDateTimeArr = ["2025", "01", "01", "00", "00", "00"];
    const middleDateTimeArr = ["2023", "12", "31", "00", "00", "00"];
    const pastDateTimeArr = [2020, 1, 1, 0, 0, 0];
    const isBeforeElement = screen.getByText("is before");
    const isAfterElement = screen.getByText("is after");
    const isBetweenElement = screen.getByText("is between");

    // Using isBefore
    fireEvent.click(isBeforeElement);
    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: futureDateTimeArr[i] } });
    });
    expect(screen.getByText("2025-01-01T00:00:00.999Z")).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(10); // pagination
    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: middleDateTimeArr[i] } });
    });
    expect(screen.getByText("2023-12-31T00:00:00.999Z")).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(5);

    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: pastDateTimeArr[i] } });
    });
    expect(screen.getByText("2020-01-01T00:00:00.999Z")).toBeInTheDocument();
    expect(
      screen.getByText("No data satisfying selection."),
    ).toBeInTheDocument();
    fireEvent.click(isBeforeElement);

    // Using isAfter
    fireEvent.click(isAfterElement);
    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: futureDateTimeArr[i] } });
    });
    expect(screen.getByText("2025-01-01T00:00:00.999Z")).toBeInTheDocument();
    expect(
      screen.getByText("No data satisfying selection."),
    ).toBeInTheDocument();
    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: middleDateTimeArr[i] } });
    });
    expect(screen.getByText("2023-12-31T00:00:00.999Z")).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(7);

    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: pastDateTimeArr[i] } });
    });
    expect(screen.getByText("2020-01-01T00:00:00.999Z")).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(10); // pagination
    fireEvent.click(isAfterElement);

    // Using isBetween
    fireEvent.click(isBetweenElement);
    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: pastDateTimeArr[i] } });
    });
    screen.getAllByRole("textbox").forEach((textbox, i = 6) => {
      fireEvent.change(textbox, {
        target: { value: middleDateTimeArr[i - 6] },
      });
    });
    expect(
      screen.getByText("2020-01-01T00:00:00.000Z and 2023-12-31T00:00:00.000Z"),
    ).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(5);

    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: pastDateTimeArr[i] } });
    });
    screen.getAllByRole("textbox").forEach((textbox, i = 6) => {
      fireEvent.change(textbox, {
        target: { value: futureDateTimeArr[i - 6] },
      });
    });
    expect(
      screen.getByText("2020-01-01T00:00:00.000Z and 2025-01-01T00:00:00.000Z"),
    ).toBeInTheDocument();
    expect(tableBody.childElementCount).toBe(10); // pagination

    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: futureDateTimeArr[i] } });
    });
    screen.getAllByRole("textbox").forEach((textbox, i = 6) => {
      fireEvent.change(textbox, { target: { value: pastDateTimeArr[i - 6] } });
    });
    expect(
      screen.getByText("2025-01-01T00:00:00.000Z and 2020-01-01T00:00:00.000Z"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No data satisfying selection."),
    ).toBeInTheDocument();
    fireEvent.click(isBetweenElement);
  });

  it("using multiple filters in one column", async () => {
    const user = userEvent.setup();
    const tableBody = document.getElementsByTagName("tbody")[0];
    const filterButton = screen.getByText("Filter");
    await user.click(filterButton);

    const menuItems = screen.getAllByRole("menuitem");
    const menu = screen.getByRole("menu");
    const variableNameElement = menuItems[0];
    fireEvent.click(variableNameElement);
    expect(menu).toBeInTheDocument();

    await userEvent.hover(variableNameElement);
    const isnotFilterElement = screen.getByText("is not");
    const containsFilterElement = screen.getByText("contains");

    fireEvent.click(isnotFilterElement);
    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "search phrase" },
    });
    fireEvent.click(containsFilterElement);
    fireEvent.change(screen.getAllByRole("textbox")[1], {
      target: { value: "isVali" },
    });
    expect(tableBody.childElementCount).toBe(2);
    expect(screen.getByText("Variable Name [2]")).toBeInTheDocument();
    expect(screen.getByText("search phrase")).toBeInTheDocument();
    expect(screen.getByText("isVali")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Clear column filters"));
    expect(tableBody.childElementCount).toBe(10);
  });

  it("use multiple filters", async () => {
    const user = userEvent.setup();
    const tableBody = document.getElementsByTagName("tbody")[0];
    const filterButton = screen.getByText("Filter");
    await user.click(filterButton);

    const menuItems = screen.getAllByRole("menuitem");
    const variableNameElement = menuItems[0];
    const timeElement = menuItems[1];
    fireEvent.click(variableNameElement);

    await userEvent.hover(variableNameElement);
    const isnotFilterElement = screen.getByText("is not");
    const containsFilterElement = screen.getByText("contains");

    fireEvent.click(isnotFilterElement);
    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "search phrase" },
    });
    fireEvent.click(containsFilterElement);
    fireEvent.change(screen.getAllByRole("textbox")[1], {
      target: { value: "isVali" },
    });

    fireEvent.click(timeElement);

    await userEvent.hover(timeElement);
    const isBeforeElement = screen.getByText("is before");
    const isAfterElement = screen.getByText("is after");
    const futureDateTimeArr = ["2025", "01", "01", "00", "00", "00"];
    const middleDateTimeArr = [2023, 12, 31, 0, 0, 0];
    fireEvent.click(isBeforeElement);
    screen.getAllByRole("textbox").forEach((textbox, i) => {
      fireEvent.change(textbox, { target: { value: futureDateTimeArr[i] } });
    });
    fireEvent.click(isAfterElement);
    screen.getAllByRole("textbox").forEach((textbox, i = 6) => {
      fireEvent.change(textbox, {
        target: { value: middleDateTimeArr[i - 6] },
      });
    });
    expect(tableBody.childElementCount).toBe(1);
    expect(screen.getByText("Variable Name [2]")).toBeInTheDocument();
    expect(screen.getByText("search phrase")).toBeInTheDocument();
    expect(screen.getByText("isVali")).toBeInTheDocument();
    expect(screen.getByText("2023-12-31T00:00:00.999Z")).toBeInTheDocument();
    expect(screen.getByText("2025-01-01T00:00:00.999Z")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Clear all filters"));
    expect(tableBody.childElementCount).toBe(10);
  });
});
