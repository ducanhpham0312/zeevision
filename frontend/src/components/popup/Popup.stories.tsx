import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { Popup, PopupAction, PopupContent } from "./Popup";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: "Assets/Popup",
  component: Popup,
  parameters: {
    layout: "centered",
  },
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} satisfies Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    open: true,
    title: "Deploy a Process",
    children: [],
  },
  render: (args) => (
    <Popup {...args}>
      <PopupContent>
        <div>
          <Button>Deploy a file (.bpmn)</Button>
          <p>Or drag the files to the box below</p>
        </div>
        <div>
          {[...new Array(50)]
            .map(
              () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
            )
            .join("\n")}
        </div>
      </PopupContent>
      <PopupAction>
        <Button>Cancel</Button>
        <Button variant="contained">Deploy process</Button>
      </PopupAction>
    </Popup>
  ),
};
