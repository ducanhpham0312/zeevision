import type { Meta, StoryObj } from "@storybook/react";
import { StyledButton as Button, StyledButtonProps } from "./StyledButton";
import { useState } from "react";

const meta = {
  title: "Assets/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const ToggleableButton = ({
  active,
  setActive,
  ...props
}: StyledButtonProps & {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <Button
      {...props}
      active={active}
      onClick={() => setActive((prev) => !prev)}
    />
  );
};

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

export const Toggle: Story = (args: StyledButtonProps) => {
  const [active, setActive] = useState(false);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <ToggleableButton
        {...args}
        active={active}
        setActive={setActive}
        variant="outlined"
      />
      <ToggleableButton {...args} active={active} setActive={setActive} />
    </div>
  );
};
Toggle.args = {
  variant: "text",
  size: "large",
  label: "Toggleable",
  active: false,
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
