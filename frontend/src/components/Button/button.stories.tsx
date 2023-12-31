import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonProps } from "./Button";
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
}: ButtonProps & {
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

export const Primary: Story = {
  args: {
    variant: "primary",
    label: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "secondary",
  },
};

export const Toggle: Story = (args: ButtonProps) => {
  const [active, setActive] = useState(false);

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <ToggleableButton
        {...args}
        active={active}
        setActive={setActive}
        variant="secondary"
      />
      <ToggleableButton {...args} active={active} setActive={setActive} />
    </div>
  );
};
Toggle.args = {
  size: "large",
  label: "Toggleable",
  active: false,
};

export const Text: Story = {
  args: {
    label: "Text",
  },
};

const widths = [100, 200, 400];
export const VariesWidth: Story = {
  render: () => {
    return (
      <div style={{ display: "flex", gap: "10px" }}>
        {widths.map((width) => (
          <Button
            variant="primary"
            width={width}
            key={width}
            label={`${width}px`}
          />
        ))}
      </div>
    );
  },
};

export const FullWidth: Story = {
  render: () => {
    return (
      <>
        <p>Container</p>
        <div
          style={{ width: "500px", padding: "10px", border: "1px solid black" }}
        >
          <Button variant="primary" fullWidth label="Full Width" />
        </div>
      </>
    );
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
    size: "compact",
    label: "Small",
  },
};
