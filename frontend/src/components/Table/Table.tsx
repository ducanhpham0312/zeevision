import { styled } from "@mui/system";
import { HorizontalTable } from "./HorizontalTable";
import { VerticalTable } from "./VerticalTable";

export interface TableProps {
  /**
   * Orientation of the table.
   */
  orientation: string;

  /**
   * List of headers
   */
  header: string[];

  /**
   * List of all content of the table. Each list member represents one row in horizontal
   * or one column in vertical orientation
   */
  content?: (string | number)[][];
}

export function Table({ orientation, header, content }: TableProps) {
  if (header.length === 0 || orientation === "") return null;
  return (
    <StyledTable>
      {orientation === "horizontal" ? (
        <HorizontalTable header={header} content={content!} />
      ) : (
        <VerticalTable header={header} content={content!} />
      )}
    </StyledTable>
  );
}

const StyledTable = styled("table")`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
    transition: background-color 0.3s ease;
  }

  tr:nth-of-type(even) {
    background-color: #f5f5f5;
  }
  tr:hover {
    background-color: #e0e0e0;
  }
`;
