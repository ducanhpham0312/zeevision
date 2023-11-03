import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DeployProcessPopup } from ".";
import { Button } from "../Button";

const meta = {
  title: "Assets/DeployProcessPopup",
  component: DeployProcessPopup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof DeployProcessPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

const DeployProcess = () => {
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpen = () => setIsPopUpOpen(true);
  const handleClose = () => setIsPopUpOpen(false);
  return (
    <>
      <Button onClick={handleOpen}>Open Modal</Button>
      <DeployProcessPopup
        isPopUpOpen={isPopUpOpen}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />
    </>
  );
};

export const Primary: Story = {
  args: {
    isPopUpOpen: false,
    onOpenPopUp: () => {},
    onClosePopUp: () => {},
  },
  render: () => <DeployProcess />,
};
