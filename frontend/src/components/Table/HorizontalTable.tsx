import {
  useState,
  useCallback,
  useEffect,
  MouseEvent,
  ChangeEvent,
} from "react";
import { styled } from "@mui/system";
import {
  TablePagination,
  tablePaginationClasses as classes,
} from "@mui/base/TablePagination";
import { Button } from "../Button";
import { Minus, Plus } from "lucide-react";
import { ExpandRow } from "./ExpandRow";
import { DataFilter, FilterType } from "./DataFilter";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { NavLink } from "react-router-dom";

export interface HorizontalTableProps {
  header: string[];
  content: (string | number)[][];
  navLinkColumn?: Record<string, (value: string | number) => string>;
  alterRowColor?: boolean;
  filterConfig?: Record<string, FilterType>;
  expandElement?: (idx: number) => React.ReactNode;
  optionElement?: (idx: number) => React.ReactNode;
}

export function HorizontalTable({
  header,
  content,
  alterRowColor,
  navLinkColumn,
  filterConfig,
  expandElement,
  optionElement,
}: HorizontalTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortedContent, setSortedContent] =
    useState<(string | number)[][]>(content);

  const [copyHelperText, setCopyHelperText] = useState("Copy");

  const sortContent = useCallback(
    (
      content: (string | number)[][],
      column: string,
      order: string,
    ): (string | number)[][] => {
      return [...content].sort((a, b) => {
        const columnIndex = header.indexOf(column);
        const comparison = a[columnIndex] > b[columnIndex] ? 1 : -1;
        return order === "desc" ? comparison * -1 : comparison;
      });
    },
    [header],
  );

  useEffect(() => {
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
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const colSpan =
    expandElement || optionElement ? header.length + 1 : header.length;

  return (
    <div>
      {filterConfig ? <DataFilter filterConfig={filterConfig} /> : null}
      <table className="relative w-full border-collapse rounded bg-white">
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
                      {sortBy === item
                        ? sortOrder === "asc"
                          ? " ▲"
                          : " ▼"
                        : ""}
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
                    {row.map((value, index) => (
                      <td
                        className="group p-3"
                        key={index}
                        onMouseLeave={() => setCopyHelperText("Copy")}
                      >
                        <div className="flex items-center gap-2">
                          {navLinkColumn && navLinkColumn[header[index]] ? (
                            <NavLink to={navLinkColumn[header[index]](value)}>
                              <Button variant="secondary">{value}</Button>
                            </NavLink>
                          ) : (
                            <p>
                              {typeof value === "string"
                                ? prettifyJson(value)
                                : value}
                            </p>
                          )}
                          <Button
                            helperTextPos="n"
                            helperText={copyHelperText}
                            onClick={() => {
                              setCopyHelperText("Copied");
                              navigator.clipboard.writeText(value.toString());
                            }}
                            className="opacity-0 transition group-hover:opacity-100"
                          >
                            <ContentCopyIcon fontSize="small" />
                          </Button>
                        </div>
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
                    <ExpandRow
                      isIn={expandedRow === rowIdx}
                      colSpan={header.length + 1}
                    >
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
      </table>
    </div>
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
