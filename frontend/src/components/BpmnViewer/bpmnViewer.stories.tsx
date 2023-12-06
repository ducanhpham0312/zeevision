import type { Meta, StoryObj } from "@storybook/react";

import { ResponsiveBpmnViewer } from ".";
import { useEffect, useState } from "react";
import bpmnUrl from "./bpmn/money-loan.bpmn";

const meta: Meta<typeof ResponsiveBpmnViewer> = {
  title: "Assets/ResponsiveBpmnViewer",
  component: ResponsiveBpmnViewer,
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
      .then((bpmn) => {
        setBpmnXml(bpmn);
      });
  }, []);

  return (
    <div style={{width: "200%", justifyContent: "center"}}>
      <ResponsiveBpmnViewer
        width={3000}
        bpmnString={bpmnXml}
        control
        navigated
        className="h-full flex-grow overflow-hidden"
        />
    </div>
  );
};

export const Primary: Story = {
  render: () => <LoadedBpmnViewer />,
};
