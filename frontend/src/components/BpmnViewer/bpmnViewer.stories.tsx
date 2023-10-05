import type { Meta, StoryObj } from "@storybook/react";

import { BpmnViewer } from ".";
import { useEffect, useState } from "react";
import bpmnUrl from "../../bpmn/money-loan.bpmn";

const meta: Meta<typeof BpmnViewer> = {
  title: "Assets/BpmnViewer",
  component: BpmnViewer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

const LoadedBpmnViewer = () => {
  const [bpmnXml, setBpmnXml] = useState("");

  useEffect(() => {
    fetch(bpmnUrl)
      .then((res) => res.text())
      .then((bpmn) => setBpmnXml(bpmn));
  }, []);

  return (
    <div
      style={{
        border: "1px solid black",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BpmnViewer width={500} bpmnString={bpmnXml} />
    </div>
  );
};

export const Primary: Story = {
  render: () => <LoadedBpmnViewer />,
};
