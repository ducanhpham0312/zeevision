import { ReactNode } from "react";
import { HorizontalTable } from "./HorizontalTable";
import { VerticalTable } from "./VerticalTable";
import { DataFilterProps } from "./DataFilter";

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
  filterConfig?: DataFilterProps["filterConfig"];
  navLinkColumn?: Record<string, (value: string | number) => string>;
  noStyleColumn?: Record<string, (value: string | number) => string>;
}

export function Table({
  orientation,
  alterRowColor = true,
  ...props
}: TableProps) {
  if (props.header.length === 0) return null;
  return (
    <>
      {orientation === "horizontal" ? (
        <HorizontalTable alterRowColor={alterRowColor} {...props} />
      ) : (
        <VerticalTable {...props} />
      )}
    </>
  );
}
