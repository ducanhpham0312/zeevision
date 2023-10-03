import { useEffect, useState } from "react";
import { BpmnViewer } from "../components/BpmnViewer";

const bpmnPathList = [
  "../bpmn/money-loan.bpmn",
  "../bpmn/order-main.bpmn",
  "../bpmn/multi-instance-process.bpmn",
  "../bpmn/order-subprocess.bpmn",
];

export default function ProcessesPage() {
  const [bpmnStringList, setBpmnStringList] = useState<string[]>(
    new Array(bpmnPathList.length).fill("")
  );

  useEffect(() => {
    bpmnPathList.forEach((path, i) =>
      import(path)
        .then((module) => module.default)
        .then((bpmnUrl) =>
          fetch(bpmnUrl)
            .then((response) => response.text())
            .then((bpmn) => {
              setBpmnStringList((prev) =>
                prev.map((val, index) => (index !== i ? val : bpmn))
              );
            })
            .catch(console.error)
        )
    );
  }, []);

  return (
    <>
      <h1>ProcessesPage</h1>
      <div style={{ gap: "20px" }}>
        {bpmnStringList.map((bpmn, i) => (
          <BpmnViewer key={i} width={400} bpmnString={bpmn} />
        ))}
      </div>
    </>
  );
}
