import * as React from "react";
import { styled } from "@mui/system";
import {
  TablePagination,
  tablePaginationClasses as classes,
} from "@mui/base/TablePagination";
import { Button } from "../Button";
import { Minus, Plus } from "lucide-react";
import { ExpandRow } from "./ExpandRow";

export interface HorizontalTableProps {
  header: string[];
  content: (string | number | React.ReactNode)[][];
  alterRowColor?: boolean;
  expandElement?: (idx: number) => React.ReactNode;
  optionElement?: (idx: number) => React.ReactNode;
}

export function HorizontalTable({
  header,
  content,
  alterRowColor,
  expandElement,
  optionElement,
}: HorizontalTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("desc");
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null);
  const [sortedContent, setSortedContent] =
    React.useState<(string | number | React.ReactNode)[][]>(content);

  const sortContent = React.useCallback(
    (
      content: (string | number | React.ReactNode)[][],
      column: string,
      order: string,
    ): (string | number | React.ReactNode)[][] => {
      return content.slice().sort((a, b) => {
        const comparison =
          a[header.indexOf(column)]! > b[header.indexOf(column)]! ? 1 : -1;
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

  const colSpan =
    expandElement || optionElement ? header.length + 1 : header.length;

  return (
    <>
      <thead className="border-b-2 border-accent font-bold text-text">
        <tr>
          {header.map((item) => (
            <th key={item} className="cursor-pointer py-1 text-left">
              <Button
                fullWidth
                className="text-left"
                onClick={() => handleSort(item)}
              >
                <div className="relative flex justify-between pr-5">
                  <p>{item}</p>
                  <div className="absolute right-0">
                    {sortBy === item ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
                  </div>
                </div>
              </Button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody aria-label="custom pagination table">
        {sortedContent
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row, rowIdx) => {
            return (
              <>
                <tr
                  className={
                    "border-b border-black/10 " +
                    (alterRowColor && rowIdx % 2 === 0
                      ? "bg-second-accent hover:bg-second-accent/20"
                      : "hover:bg-second-accent/10")
                  }
                  key={rowIdx}
                >
                  {row.map((cell, index) => (
                    <td className="p-3" key={index}>
                      {cell}
                    </td>
                  ))}
                  {expandElement ? (
                    <td className="flex h-[55px] items-center justify-center p-0">
                      <Button
                        onClick={() =>
                          setExpandedRow((prev) =>
                            prev === rowIdx ? null : rowIdx,
                          )
                        }
                      >
                        {expandedRow === rowIdx ? <Minus /> : <Plus />}
                      </Button>
                    </td>
                  ) : null}

                  {optionElement ? (
                    <td className="mt-1 flex justify-center">
                      {optionElement(rowIdx)}
                    </td>
                  ) : null}
                </tr>
                {expandElement ? (
                  <ExpandRow isIn={expandedRow === rowIdx} colSpan={colSpan}>
                    {expandElement(rowIdx)}
                  </ExpandRow>
                ) : null}
              </>
            );
          })}
        {content.length === 0 ? (
          <tr>
            <td colSpan={colSpan}>
              <div className="flex h-20 w-full items-center justify-center border border-black/10">
                <p>No data to display.</p>
              </div>
            </td>
          </tr>
        ) : null}
        {emptyRows > 0 && (
          <tr style={{ height: 41 * emptyRows }}>
            <td colSpan={colSpan} />
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
            colSpan={colSpan}
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
