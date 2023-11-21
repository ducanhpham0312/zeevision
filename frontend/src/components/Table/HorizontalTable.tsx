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
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("asc");
  const [sortedContent, setSortedContent] =
    React.useState<(string | number)[][]>(content);

  const sortContent = React.useCallback(
    (
      content: (string | number)[][],
      column: string,
      order: string,
    ): (string | number)[][] => {
      return content.slice().sort((a, b) => {
        const comparison =
          a[header.indexOf(column)] > b[header.indexOf(column)] ? 1 : -1;
        return order === "desc" ? comparison * -1 : comparison;
      });
    },
    [header],
  );
  React.useEffect(() => {
    // Sort the content when sortBy or sortOrder changes
    const sortedData = sortContent(content, sortBy, sortOrder);
    setSortedContent(sortedData);
  }, [content, sortBy, sortContent, sortOrder]);

  const handleSort = (column: string): void => {
    const newSortOrder =
      column === sortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - content.length) : 0;

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <>
      <thead className="border-b border-black/10 bg-second-accent font-bold text-text">
        <tr>
          {header.map((item) => (
            <th
              key={item}
              onClick={() => handleSort(item)}
              className="cursor-pointer p-3 text-left"
            >
              <div className="flex justify-between">
                <p>{item}</p>
                <span className="w-10 text-right">
                  {sortBy === item ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
                </span>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody aria-label="custom pagination table">
        {(rowsPerPage > 0
          ? sortedContent.slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage,
            )
          : sortedContent
        ).map((row, rowIdx) => (
          <tr
            className={
              "border-b border-black/10 " +
              (rowIdx % 2 === 0
                ? "hover:bg-second-accent/10"
                : "bg-second-accent hover:bg-second-accent/20")
            }
            key={rowIdx}
          >
            {row.map((cell, index) => (
              <td className="p-3" key={index}>
                <pre>
                  {typeof cell === "string" ? prettifyJson(cell) : cell}
                </pre>
              </td>
            ))}
          </tr>
        ))}
        {emptyRows > 0 && (
          <tr style={{ height: 41 * emptyRows }}>
            <td colSpan={header.length} />
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr>
          <StyledTablePagination
            rowsPerPageOptions={[
              ...Array.from({ length: 6 }, (_, index) => (index + 1) * 5),
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

const StyledTablePagination = styled(TablePagination)`
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
