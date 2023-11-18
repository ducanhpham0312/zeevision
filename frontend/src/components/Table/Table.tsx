import { HorizontalTable } from "./HorizontalTable";
import { VerticalTable } from "./VerticalTable";
import "./table.css";

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
}

export function Table({ orientation, header, content }: TableProps) {
  if (header.length === 0) return null;
  return (
    <table>
      {orientation === "horizontal" ? (
        <HorizontalTable header={header} content={content} />
      ) : (
        <VerticalTable header={header} content={content} />
      )}
    </table>
  );
}
