import { useState } from "react";
import { BpmnViewer } from "../components/BpmnViewer";
import ws from "../config/socketConfig";

export default function ProcessesPage() {
  const [bpmnList, setBpmnList] = useState<string[]>([]);
  const [bpmnString, setBpmnString] = useState("");
  ws.addEventListener("message", (ev) => {
    console.log(`received message: ${ev.data}`);
    setBpmnString(window.atob(JSON.parse(ev.data).value.resources[0].resource));
    setBpmnList([...bpmnList, bpmnString]);
  });

  return (
    <>
      {bpmnList.map((bpmnXml) => {
        console.log(bpmnXml);
        return <BpmnViewer key={bpmnXml} bpmnString={bpmnXml} width={400} />;
      })}
    </>
  );
}
