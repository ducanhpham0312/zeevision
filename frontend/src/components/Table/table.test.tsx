import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Table } from ".";
import * as mockdata from "./mockdata.json";

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
    fireEvent.click(getByText("Time created"));
    expect(getByText("Time created")).toBeInTheDocument();
    expect(getByText("▲")).toBeInTheDocument();

    const html = document.body.innerHTML;
    const later = html.search("1696667333");
    const earlier = html.search("1696667542");
    expect(later).toBeLessThan(earlier);
  });

  it("table should sort by column descending when clicking the column name twice", () => {
    const { getByText } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />,
    );
    fireEvent.click(getByText("Time created"));
    fireEvent.click(getByText("Time created"));
    expect(getByText("Time created")).toBeInTheDocument();
    expect(getByText("▼")).toBeInTheDocument();

    const html = document.body.innerHTML;
    const later = html.search("1696667333");
    const earlier = html.search("1696667542");
    expect(earlier).toBeLessThan(later);
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
              Time: "string",
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
