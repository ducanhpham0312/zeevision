import Modeler from "bpmn-js/lib/Viewer";
import "./bpmn-js.css"
import { useEffect, useRef } from "react";

// create a modeler

function BpmnViewer({ bpmn, width }: { bpmn: string; width: number }) {
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const modeler = new Modeler({
      container: containerRef.current,
      width: width,
    });

    async function openDiagram(xml: any) {
      try {
        await modeler.importXML(xml);

        // access viewer components
        var canvas = modeler.get("canvas");

        // zoom to fit full viewport
        canvas.zoom("fit-viewport");

        containerRef.current?.classList.add("with-error");
        containerRef.current?.classList.remove("with-diagram");
      } catch (err) {
        containerRef.current?.classList.remove("with-error");
        containerRef.current?.classList.add("with-diagram");

        console.error(err);
      }
    }

    openDiagram(bpmn);

    return () => {
      modeler.destroy();
    };
  }, []);

  return <div ref={containerRef} style={{ userSelect: "none" }} id="canvas" />;
}

export default BpmnViewer;
