import type { Meta, StoryObj } from "@storybook/react";
import { SnackbarContent } from ".";

const meta = {
  title: "Assets/Snackbar",
  component: SnackbarContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof SnackbarContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    status: "entering",
    title: "Stoybook success snackbar",
    message: "Everything was sent to the desired address.",
    type: "success",
    handleClose: () => console.log("Snackbar handle close called"),
  },
};

export const Error: Story = {
  args: {
    status: "entering",
    title: "Stoybook error snackbar",
    message: "Everything was not sent to the desired address.",
    type: "error",
    handleClose: () => console.log("Snackbar handle close called"),
  },
};
