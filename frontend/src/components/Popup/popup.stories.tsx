import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Popup, PopupAction, PopupContent } from "./Popup";
import { useState } from "react";

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
            <>
              <div>{[...Array(50)].map(() => text.join("\n"))}</div>
            </>
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
    open: true,
    title: "Deploy a Process",
    children: [],
  },
  render: () => <ButtonWithHooks />,
};

export const Scrollable: Story = {
  args: {
    open: true,
    title: "Deploy a Process",
    children: [],
  },
  render: () => (
    <ButtonWithHooks
      text={[
        "Cras mattis consectetur purus sit amet fermentum.",
        "Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
        "Morbi leo risus, porta ac consectetur ac, vestibulum at eros.",
        "Praesent commodo cursus magna, vel scelerisque nisl consectetur et.",
      ]}
    />
  ),
};
// export const Scrollable: Story = {
//   args: {
//     open: true,
//     title: "Deploy a Process",
//     children: [],
//   },
//   render: (args) => (
//     <Popup {...args}>
//       <PopupContent>
//         <div>
//           {[...new Array(50)]
//             .map(
//               () => `Cras mattis consectetur purus sit amet fermentum.
// Cras justo odio, dapibus ac facilisis in, egestas eget quam.
// Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
// Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
//             )
//             .join("\n")}
//         </div>
//       </PopupContent>
//       <PopupAction>
//         <Button>Cancel</Button>
//         <Button variant="contained">Deploy process</Button>
//       </PopupAction>
//     </Popup>
//   ),
// };
