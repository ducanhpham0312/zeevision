import type { Meta, StoryObj } from "@storybook/react";
import { DragDropFile, StyledBox, StyledModal } from "./DragDropFile";

const meta = {
  title: "Assets/DragDropFile",
  component: DragDropFile,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof DragDropFile>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalDragDropFile = () => {
  return (
    <>
      <StyledModal
        open
        sx={{ pointerEvents: "none" }}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <StyledBox>
          <p id="simple-modal-description">Drop files here to upload!</p>
          <em>(Only *.bmpn files will be accepted)</em>
        </StyledBox>
      </StyledModal>
    </>
  );
};
export const Primary: Story = {
  render: () => <ModalDragDropFile />,
};
