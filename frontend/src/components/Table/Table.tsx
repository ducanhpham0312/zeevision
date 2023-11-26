import { ReactNode } from "react";
import { HorizontalTable } from "./HorizontalTable";
import { VerticalTable } from "./VerticalTable";

export interface TableProps {
  /**
   * Orientation of the table.
   */
  orientation: "horizontal" | "vertical";

  /**
   * List of headers
   */
  header: string[];

  /**
   * List of all content of the table. Each list member represents one row in horizontal
   * or one column in vertical orientation
   */
  content: (string | number)[][];

  expandElement?: (idx: number) => ReactNode;
  optionElement?: (idx: number) => ReactNode;

  alterRowColor?: boolean;
}

export function Table({ orientation, ...props }: TableProps) {
  if (props.header.length === 0) return null;
  return (
    <table className="w-full border-collapse rounded bg-white">
      {orientation === "horizontal" ? (
        <HorizontalTable {...props} />
      ) : (
        <VerticalTable {...props} />
      )}
    </table>
  );
}
