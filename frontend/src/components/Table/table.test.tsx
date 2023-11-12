import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Table } from ".";
import * as mockdata from "./mockdata.json";
const { headers: verticalHeader, content: verticalContent } = mockdata.vertical;

const { headers: horizontalHeaders, content: horizontalContent } =
  mockdata.horizontal;
const horizontalOrientation = "horizontal";
const verticalOrientation = "vertical";

describe("VerticalTable Component", () => {
  it("renders correctly", () => {
    const { asFragment } = render(
      <Table
        orientation={verticalOrientation}
        header={verticalHeader}
        content={verticalContent}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not throw error when content is empty", () => {
    const { container } = render(
      <Table
        orientation={verticalOrientation}
        header={verticalHeader}
        content={[]}
      />
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});

describe("HorizontalTable Component", () => {
  it("renders correctly", () => {
    const { asFragment } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("header and content included in table when both props are passed", () => {
    render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />
    );
    expect(screen.getByText("Variable value")).toBeInTheDocument();
    expect(
      screen.getAllByText("multi-instance-process")[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText("multi-instance-process").length).toEqual(4);
  });

  it("renders header and pagination when the content is empty", () => {
    const component = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={[]}
      />
    );
    expect(component.getByRole("table")).toBeInTheDocument();
    expect(component.getAllByRole("row").length).toEqual(2);
    expect(component.getAllByRole("button")[0]).toBeInTheDocument();
  });

  it("does not throw error when all props are empty", () => {
    const { container } = render(
      <Table orientation={horizontalOrientation} header={[]} content={[]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("table should sort by column ascending when clicking the column name", () => {
    render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />
    );
    fireEvent.click(screen.getByText("Time created"));
    expect(screen.getByText("Time created ▲")).toBeInTheDocument();

    const html = document.body.innerHTML;
    const later = html.search("1696667333");
    const earlier = html.search("1696667542");
    expect(later).toBeLessThan(earlier);
  });

  it("table should sort by column descending when clicking the column name twice", () => {
    render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />
    );
    fireEvent.click(screen.getByText("Time created"));
    fireEvent.click(screen.getByText("Time created ▲"));
    expect(screen.getByText("Time created ▼")).toBeInTheDocument();

    const html = document.body.innerHTML;
    const later = html.search("1696667333");
    const earlier = html.search("1696667542");
    expect(earlier).toBeLessThan(later);
  });

  it("should set page correctly", () => {
    const { getByText, getByLabelText } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />
    );

    expect(getByText("1–10 of 12")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Go to next page"));
    expect(getByText("11–12 of 12")).toBeInTheDocument();
  });

  it("should set rows per page correctly", () => {
    const { getByLabelText, container } = render(
      <Table
        orientation={horizontalOrientation}
        header={horizontalHeaders}
        content={horizontalContent}
      />
    );

    expect(getByLabelText("rows per page")).toHaveValue("10");
    expect(container.querySelector("tbody")?.childElementCount).toEqual(10);

    fireEvent.change(getByLabelText("rows per page"), {
      target: { value: "20" },
    });
    expect(getByLabelText("rows per page")).toHaveValue("20");
    expect(container.querySelector("tbody")?.childElementCount).toEqual(12);
  });
});
