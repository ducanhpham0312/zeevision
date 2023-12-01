import { ReactNode, useEffect, useState } from "react";
import { ResizableBox, ResizableBoxProps } from "react-resizable";
import "./resizable.css";

interface ResizableProps {
  children: ReactNode;
  direction: "horizontal" | "vertical";
}

export function ResizableContainer({ direction, children }: ResizableProps) {
  let resizableProps: ResizableBoxProps;
  const [innerHeight, setInnerHeight] = useState(window.innerWidth);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [width, setWidth] = useState(Math.max(window.innerWidth * 0.3, 300));

  useEffect(() => {
    let timer: number;

    const resizeWindow = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        setInnerHeight(window.innerHeight);
        setInnerWidth(window.innerWidth);
        if (window.innerWidth * 0.75 < width) {
          setWidth(window.innerWidth * 0.75);
        }
      }, 100) as unknown as number;
    };
    window.addEventListener("resize", resizeWindow);

    return () => {
      window.removeEventListener("resize", resizeWindow);
    };
  }, [width]);

  if (direction === "horizontal") {
    resizableProps = {
      className: "resize-horizontal",
      minConstraints: [10, Infinity],
      maxConstraints: [innerWidth * 0.75, Infinity],
      width,
      height: Infinity,
      resizeHandles: ["e"],
      onResizeStop: (_event, data) => {
        setWidth(data.size.width);
      },
    };
  } else {
    resizableProps = {
      className: "resize-vertical",
      minConstraints: [Infinity, 0],
      maxConstraints: [Infinity, innerHeight * 0.9],
      width: Infinity,
      height: window.innerHeight * 0.5,
      resizeHandles: ["s"],
    };
  }

  console.log(resizableProps);

  return <ResizableBox {...resizableProps}>{children}</ResizableBox>;
}
