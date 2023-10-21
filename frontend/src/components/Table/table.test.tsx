import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Table } from ".";
import * as mockdata from "./mockdata.json";
const { headers: verticalHeader, content: verticalContent } = mockdata.vertical;

const { headers: horizontalHeaders, content: horizontalContent } =
  mockdata.horizontal;
const horizontalOrientation = "horizontal";
const verticalOrientation = "vertical";
describe("Table Component", () => {
  it("renders vertical table correctly", () => {
    const { asFragment } = render(
      <Table
        orientation={verticalOrientation}
        header={verticalHeader}
        content={verticalContent}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders horizontal table correctly", () => {
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
    expect(screen.getAllByText("multi-instance-process").length).toEqual(3);
  });

  it("renders header and pagination in horizontal table when the content is empty", () => {
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
});
