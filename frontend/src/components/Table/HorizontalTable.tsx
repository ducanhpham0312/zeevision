import * as React from "react";
import { styled } from "@mui/system";
import {
  TablePagination,
  tablePaginationClasses as classes,
} from "@mui/base/TablePagination";

export interface HorizontalTableProps {
  header: string[];
  content: (string | number)[][];
}

export function HorizontalTable({ header, content }: HorizontalTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(3);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - content.length) : 0;

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <>
      <StyledHeader>
        <tr>
          {header.map((item) => (
            <th key={item}>{item}</th>
          ))}
        </tr>
      </StyledHeader>
      <tbody aria-label="custom pagination table">
        {(rowsPerPage > 0
          ? content.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          : content
        ).map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, index) => (
              <td key={index} style={{ width: 160 }} align="left">
                <pre>
                  {typeof cell === "string" ? prettifyJson(cell) : cell}
                </pre>
              </td>
            ))}
          </tr>
        ))}
        {emptyRows > 0 && (
          <tr style={{ height: 41 * emptyRows }}>
            <td colSpan={header.length} aria-hidden />
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <CustomTablePagination
            rowsPerPageOptions={[
              ...Array(10).keys(),
              { label: "All", value: -1 },
            ]}
            colSpan={header.length}
            count={content.length}
            rowsPerPage={rowsPerPage}
            page={page}
            slotProps={{
              select: {
                "aria-label": "rows per page",
              },
              actions: {
                showFirstButton: true,
                showLastButton: true,
              },
            }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </tr>
      </tfoot>
    </>
  );
}

function prettifyJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return str;
  }
  return JSON.stringify(JSON.parse(str), null, 2);
}

const StyledHeader = styled("thead")`
  background-color: #d9d9d9;
  font-weight: bold;
`;

const CustomTablePagination = styled(TablePagination)`
  & .${classes.toolbar} {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  & .${classes.selectLabel} {
    margin: 0;
  }

  & .${classes.displayedRows} {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }

  & .${classes.spacer} {
    display: none;
  }

  & .${classes.actions} {
    display: flex;
    gap: 0.25rem;
  }
`;
