import { BpmnVisualization, FitType, ZoomType } from "bpmn-visualization";
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

export function BpmnViewer({
  bpmnString,
  width,
  height,
  navigated,
}: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<BpmnVisualization>();

  useEffect(() => {
    if (!bpmnString || bpmnString.length === 0) {
      return;
    }
    const modeler = new BpmnVisualization({
      container: containerRef.current as HTMLDivElement,
      navigation: { enabled: !!navigated },
    });
    modeler.load(bpmnString, { fit: { type: FitType.Center, margin: 10 } });
    setModeler(modeler);
  }, [bpmnString, navigated]);

  useEffect(() => {
    if (!modeler) {
      return;
    }
    modeler.navigation.fit({ type: FitType.Center, margin: 10 });
    modeler.navigation.zoom();
  }, [width]);

  return <div ref={containerRef} style={{ overflow: "hidden" }} id="canvas" />;
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
