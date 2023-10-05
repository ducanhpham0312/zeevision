  import Viewer from "bpmn-js/lib/Viewer";
  import { useEffect, useRef } from "react";

  // create a modeler

  interface BpmnViewerProps {
    bpmnString: string;
    width: number;
  }

  export function BpmnViewer({ bpmnString, width }: BpmnViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const modeler = new Viewer({
        container: containerRef.current as HTMLDivElement,
        width: width,
        height: 300,
      });

      async function openDiagram(xmlString: string) {
        try {
          await modeler.importXML(xmlString);

          // access viewer components
          const canvas = modeler.get("canvas") as {
            zoom: (mode: string) => void;
          };

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
