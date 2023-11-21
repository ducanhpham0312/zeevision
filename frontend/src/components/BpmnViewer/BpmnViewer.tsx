import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import Viewer from "bpmn-js/lib/Viewer";
import { useEffect, useRef, useState } from "react";
import { useElementSize } from "usehooks-ts";

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
   * The height (in pixels) that the Viewer should take.
   */
  height?: number;
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

export function BpmnViewer({
  bpmnString,
  width,
  height,
  navigated,
}: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<Viewer>();

  useEffect(() => {
    const modeler = navigated
      ? new NavigatedViewer({
          container: containerRef.current as HTMLDivElement,
        })
      : new Viewer({
          container: containerRef.current as HTMLDivElement,
        });

    async function openDiagram(xmlString: string) {
      try {
        await modeler.importXML(xmlString);
      } catch (err) {
        console.error(err);
      }
    }
    setModeler(modeler);
    openDiagram(bpmnString);

    return () => {
      modeler.destroy();
    };
  }, [bpmnString, navigated]);

  useEffect(() => {
    if (!modeler || (width && width < 400)) {
      return;
    }
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
  }, [width, height, modeler]);

  return (
    <div
      ref={containerRef}
      style={{ userSelect: "none", width: "100%", height: "100%" }}
      id="canvas"
    />
  );
}

export function ResponsiveBpmnViewer({
  classname,
  ...props
}: BpmnViewerProps & { classname?: string }) {
  const [squareRef, { width, height }] = useElementSize();

  return (
    <div ref={squareRef} className={classname}>
      <BpmnViewer width={width} height={height} {...props} />
    </div>
  );
}
