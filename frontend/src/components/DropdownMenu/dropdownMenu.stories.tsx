import type { Meta, StoryObj } from "@storybook/react";
import { DropdownMenu } from ".";
import { DropdownMenuDemo } from "./demo";

const meta = {
  title: "Assets/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => <DropdownMenuDemo />,
};
