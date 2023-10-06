import type { Meta, StoryObj } from "@storybook/react";
import "./global.css";

import { StyledButton as Button } from "../components/styled-component/StyledButton";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: "Assets/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Contained: Story = {
  args: {
    variant: "contained",
    label: "Contained",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    label: "Outlined",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    label: "Text",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    label: "Button",
  },
};

export const Small: Story = {
  args: {
    variant: "text",
    size: "small",
    label: "Small",
  },
};

export const Toggle: Story = {
  args: {
    variant: "text",
    size: "large",
    active: true,
    label: "Toggled",
  },
};
