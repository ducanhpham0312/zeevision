import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import Viewer from "bpmn-js/lib/Viewer";
import { useEffect, useRef } from "react";

// create a modeler

interface BpmnViewerProps {
  bpmnString: string;
  width: number;
  navigated?: boolean;
}

type ViewBoxInner = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function BpmnViewer({ bpmnString, width, navigated }: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let modeler: NavigatedViewer | Viewer;
    if (navigated) {
      modeler = new NavigatedViewer({
        container: containerRef.current as HTMLDivElement,
        width: width,
        height: 300,
      });
    } else {
      modeler = new Viewer({
        container: containerRef.current as HTMLDivElement,
        width: width,
        height: 300,
      });
    }

    async function openDiagram(xmlString: string) {
      try {
        await modeler.importXML(xmlString);

        // access viewer components
        const canvas = modeler.get("canvas") as {
          viewbox(): { inner: ViewBoxInner };
          zoom: (mode: string, center: { x: number; y: number }) => void;
        };
        const { inner } = canvas.viewbox();

        const center = {
          x: inner.x + inner.width / 2,
          y: inner.y + inner.height / 2,
        };
        // zoom to fit full viewport
        canvas.zoom("fit-viewport", center);
      } catch (err) {
        console.error(err);
      }
    }

    openDiagram(bpmnString);

    return () => {
      modeler.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpmnString, width]);

  return <div ref={containerRef} style={{ userSelect: "none" }} id="canvas" />;
}
