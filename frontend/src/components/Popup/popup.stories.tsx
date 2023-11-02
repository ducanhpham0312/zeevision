import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Popup } from "./Popup";
import { useState } from "react";
import mockdata from "./mockdata.json";
import { styled } from "@mui/system";

const meta = {
  title: "Assets/Popup",
  component: Popup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

const ButtonWithHooks = ({ text }: { text?: Array<string> }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <Button onClick={handleOpen}>Open Modal</Button>
      <Popup open={open} onClose={handleClose} title={"Deploy a process"}>
        <PopupContent>
          <div>
            <Button>Deploy a file (.bpmn) </Button>
            <p>Or drag the files to the box belows</p>
          </div>
          {text && (
            <div>{[...Array(50)].map(() => text.join("\n"))}</div>
          )}
        </PopupContent>
        <PopupAction>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained">Deploy process</Button>
        </PopupAction>
      </Popup>
    </>
  );
};

export const Primary: Story = {
  args: {
    open: mockdata.primary.open,
    title: mockdata.primary.title,
    children: mockdata.primary.children,
  },
  render: () => <ButtonWithHooks />,
};

export const Scrollable: Story = {
  args: {
    open: mockdata.scrollable.open,
    title: mockdata.scrollable.title,
    children: mockdata.scrollable.children,
  },
  render: () => <ButtonWithHooks text={mockdata.scrollable.children} />,
};

const PopupContent = styled("div")`
  margin-top: 10px;
  flex-grow: 1;
  padding-left: 20px;
  overflow-y: scroll;
  max-height: 500px;
  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 20px;
  }
`;

const PopupAction = styled("div")`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px;
`;