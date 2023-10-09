import { useEffect, useState } from "react";
import { BpmnViewer } from "../components/BpmnViewer";
import { Button } from "../components/Button";
import { Popup, PopupAction, PopupContent } from "../components/Popup/Popup";

const bpmnImportFunctionList = [
  () => import("../bpmn/money-loan.bpmn"),
  () => import("../bpmn/order-main.bpmn"),
  () => import("../bpmn/multi-instance-process.bpmn"),
  () => import("../bpmn/order-subprocess.bpmn"),
];

export default function ProcessesPage() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [bpmnStringList, setBpmnStringList] = useState<string[]>(
    new Array(bpmnImportFunctionList.length).fill("")
  );

  useEffect(() => {
    bpmnImportFunctionList.forEach((importFunction, i) =>
      importFunction()
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

      <Button onClick={handleOpen}>Open Modal</Button>
      <Popup open={open} onClose={handleClose} title={"Deploy a process"}>
        <PopupContent>
          <div>
            <Button>Deploy a file (.bpmn) </Button>
            <p>Or drag the files to the box belows</p>
          </div>
        </PopupContent>
        <PopupAction>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained">Deploy process</Button>
        </PopupAction>
      </Popup>

      <div style={{ gap: "20px" }}>
        {bpmnStringList.map((bpmn, i) => (
          <BpmnViewer key={i} width={400} bpmnString={bpmn} />
        ))}
      </div>
    </>
  );
}
