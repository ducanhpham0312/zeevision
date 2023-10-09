import type { Meta, StoryObj } from "@storybook/react";
import { Snackbar } from ".";

const meta = {
  title: "Assets/Snackbar",
  component: Snackbar,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
