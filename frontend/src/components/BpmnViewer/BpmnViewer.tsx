/* eslint-disable @typescript-eslint/no-explicit-any */
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import Viewer from "bpmn-js/lib/Viewer";
import { useCallback, useEffect, useRef, useState } from "react";
import { useElementSize } from "usehooks-ts";
import { Button } from "../Button";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";

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

  control?: boolean;

  /**
   * List of bpmn element's intent for coloring BPMN diagram
   */
  colorOptions?: { elementId: string; intent: string; }[]
}

type ViewBoxInner = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ViewBoxOuter = {
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
  control,
  colorOptions,
}: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<Viewer>();
  const [currentZoom, setCurrentZoom] = useState(1);

  const zoomStrength = 0.3;

  useEffect(() => {
    if (!bpmnString || bpmnString.length === 0) {
      return;
    }

    const modeler = navigated
      ? new NavigatedViewer({
          container: containerRef.current as HTMLDivElement,
          width: width,
          height: height,
        })
      : new Viewer({
          container: containerRef.current as HTMLDivElement,
          width: width,
          height: height,
        });

    async function openDiagram(xmlString: string) {
      try {
        await modeler.importXML(xmlString);

        colorOptions?.forEach(({ elementId, intent }) => {
          setBpmnMarker(modeler, elementId, intent)
          console.log(elementId, intent)
        })
      } catch (err) {
        console.error(err);
      }
    }
    setModeler(modeler);
    openDiagram(bpmnString);

    return () => {
      modeler.destroy();
    };
  }, [bpmnString, colorOptions, height, navigated, width]);

  const handleResetView = useCallback(() => {
    if (!modeler) {
      return;
    }
    setCurrentZoom(1);
    const canvas = modeler.get("canvas") as {
      viewbox(): { inner: ViewBoxInner; outer: ViewBoxOuter };
      zoom: (mode: string, center: { x: number; y: number }) => void;
    };

    const { inner } = canvas.viewbox();

    const center = {
      x: inner.x + inner.width / 2,
      y: inner.y + inner.height / 2,
    };
    // zoom to fit full viewport
    canvas.zoom("fit-viewport", center);
  }, [modeler]);

  const handleZoom = (zoom: number) => () => {
    if (!modeler) {
      return;
    }
    setCurrentZoom(zoom);
    (modeler.get("canvas") as any).zoom(zoom);
  };

  const setBpmnMarker = (modeler: Viewer, elementId: string, intent: string ) => {
    const canvas = modeler.get("canvas") as any;
    switch (intent) {
      case "ELEMENT_ACTIVATING":
        canvas.addMarker(elementId, "activating");
        break
      case "ELEMENT_ACTIVATED":
        canvas.addMarker(elementId, "activated");
        break
      case "ELEMENT_COMPLETED":
        canvas.addMarker(elementId, "completed")
    }
  }

  useEffect(() => {
    if (width && width < 400) {
      return;
    }
    handleResetView();
  }, [width, height, handleResetView]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none"
      id="canvas"
      data-testid="canvas"
    >
      {control ? (
        <div className="absolute right-2 top-2 z-50 flex w-10 flex-col gap-2">
          <Button
            variant="secondary"
            helperText="Zoom In"
            onClick={handleZoom(currentZoom * (1 + zoomStrength))}
          >
            <ZoomInIcon sx={{ fontSize: "20px" }} />
          </Button>
          <Button
            variant="secondary"
            helperText="Zoom Out"
            onClick={handleZoom(currentZoom * (1 - zoomStrength))}
          >
            <ZoomOutIcon sx={{ fontSize: "20px" }} />
          </Button>
          <Button
            variant="secondary"
            helperText="Reset View"
            onClick={handleResetView}
          >
            <CenterFocusWeakIcon sx={{ fontSize: "20px" }} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ResponsiveBpmnViewer({
  className,
  ...props
}: BpmnViewerProps & { className?: string }) {
  const [squareRef, { width, height }] = useElementSize();

  return (
    <div ref={squareRef} className={className}>
      <BpmnViewer width={width} height={height} {...props} />
    </div>
  );
}
