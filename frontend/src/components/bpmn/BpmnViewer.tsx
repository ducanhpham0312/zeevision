import Viewer from "bpmn-js/lib/Viewer";
import "./bpmn-js.css";
import { useEffect, useRef } from "react";

// create a modeler

function BpmnViewer({
  bpmnString,
  width,
}: {
  bpmnString: string;
  width: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modeler = new Viewer({
      container: containerRef.current as HTMLDivElement,
      width: width,
    });

    async function openDiagram(xmlString: string) {
      try {
        await modeler.importXML(xmlString);

        // access viewer components
        const canvas = modeler.get("canvas");

        // zoom to fit full viewport
        canvas.zoom("fit-viewport");
      } catch (err) {
        console.error(err);
      }
    }

    openDiagram(bpmnString);

    return () => {
      modeler.destroy();
    };
  }, [bpmnString, width]);

  return <div ref={containerRef} style={{ userSelect: "none" }} id="canvas" />;
}

export default BpmnViewer;
