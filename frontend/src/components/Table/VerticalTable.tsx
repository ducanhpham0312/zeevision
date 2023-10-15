import { styled } from "@mui/system";

export interface VerticalTableProps {
  header: string[];
  content: (string | number)[][];
}

export function VerticalTable({ header, content }: VerticalTableProps) {
  if (!content || content.length === 0) return null
  return (
    <StyledVerticalTable>
      {header.map((title, idx) => (
        <tr key={title}>
          <th>{title}</th>
          <td>{content[0][idx]}</td>
        </tr>
      ))}
    </StyledVerticalTable>
  );
}

const StyledVerticalTable = styled("tbody")`
  th {
    border-right: none;
  }
  td {
    border-left: none;
  }
`;
