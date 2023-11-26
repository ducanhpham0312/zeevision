import { ReactNode } from "react";
import { useTransition, animated } from "@react-spring/web";
interface ExpandRowProps {
  children: ReactNode;
  isIn: boolean;
  colSpan: number;
}

export function ExpandRow({ children, isIn, colSpan }: ExpandRowProps) {
  const transition = useTransition(isIn, {
    from: { opacity: 0, maxHeight: "0px" },
    enter: { opacity: 1, maxHeight: "1000px" },
    leave: { opacity: 0, maxHeight: "0px" },
  });
  return (
    <>
      {transition((style, isIn) => (
        <>
          {isIn ? (
            <tr className="border border-t-0 border-black/10">
              <td colSpan={colSpan}>
                <animated.div style={style}>{children}</animated.div>
              </td>
            </tr>
          ) : null}
        </>
      ))}
    </>
  );
}
