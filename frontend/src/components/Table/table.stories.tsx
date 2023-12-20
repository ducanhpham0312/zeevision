import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./Table";
import mockdata from "./mockdata.json";

const meta = {
  title: "Assets/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    header: mockdata.horizontal.headers,
    content: mockdata.horizontal.content,
    filterConfig: {
      mainFilter: {
        column: "Variable Name",
      },
      filterOptions: {
        "Variable Name": "string",
        "Time created": "time",
      },
    },
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    header: mockdata.vertical.headers,
    content: mockdata.vertical.content,
  },
};
