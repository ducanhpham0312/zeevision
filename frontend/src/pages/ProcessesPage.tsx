import { useEffect, useState } from "react";
import { BpmnViewer } from "../components/BpmnViewer";
import { StyledButton } from "../components/StyledButton/StyledButton";
import { useUIStore } from "../contexts/useUIStore";

const bpmnImportFunctionList = [
  () => import("../bpmn/money-loan.bpmn"),
  () => import("../bpmn/order-main.bpmn"),
  () => import("../bpmn/multi-instance-process.bpmn"),
  () => import("../bpmn/order-subprocess.bpmn"),
];

export default function ProcessesPage() {
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

  const { setSnackMessage } = useUIStore();

  const handleClick = (type: "success" | "error") => {
    setSnackMessage({
      title: "This is a test",
      message:
        "Everything was sent to the desired address. Everything was sent to the desired address.",
      type,
    });
  };

  return (
    <>
      <h1>ProcessesPage</h1>

      <StyledButton onClick={() => handleClick("success")}>
        Test success snackbar
      </StyledButton>
      <StyledButton onClick={() => handleClick("error")}>
        Test error snackbar
      </StyledButton>

      <div style={{ gap: "20px" }}>
        {bpmnStringList.map((bpmn, i) => (
          <BpmnViewer key={i} width={400} bpmnString={bpmn} />
        ))}
      </div>
    </>
  );
}
