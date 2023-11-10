import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import Viewer from "bpmn-js/lib/Viewer";
import { useEffect, useRef } from "react";

// create a modeler

interface BpmnViewerProps {
  /**
   * The bpmn file content as string.
   */
  bpmnString: string;
  /**
   * The width (in pixels) that the Viewer should take.
   */
  width?: number;
  /**
   * Set this to true for NavigatedViewer which is interactable i.e. drag, zoom in out.
   */
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
    const modeler = navigated
      ? new NavigatedViewer({
          container: containerRef.current as HTMLDivElement,
          width: width,
        })
      : new Viewer({
          container: containerRef.current as HTMLDivElement,
          width: width,
        });

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
  }, [bpmnString, width, navigated]);

  return <div ref={containerRef} style={{ userSelect: "none", minWidth:"70%" }} id="canvas" />;
}
