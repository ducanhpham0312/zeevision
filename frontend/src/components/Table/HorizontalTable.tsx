import { useState, useCallback, useEffect, ChangeEvent } from "react";
import { Button } from "../Button";
import { Minus, Plus } from "lucide-react";
import { ExpandRow } from "./ExpandRow";
import { DataFilter, DataFilterProps } from "./DataFilter";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { NavLink } from "react-router-dom";
import { useTableStore } from "../../contexts/useTableStore";

export interface HorizontalTableProps {
  header: string[];
  content: (string | number)[][];
  navLinkColumn?: Record<string, (value: string | number) => string>;
  noStyleColumn?: Record<string, (value: string | number) => string>;
  alterRowColor?: boolean;
  filterConfig?: DataFilterProps["filterConfig"];
  expandElement?: (idx: number) => React.ReactNode;
  optionElement?: (idx: number) => React.ReactNode;
}

export function HorizontalTable({
  header,
  content,
  alterRowColor,
  navLinkColumn,
  filterConfig,
  noStyleColumn,
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
  const { loading } = useTableStore();

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

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const colSpan =
    expandElement || optionElement ? header.length + 1 : header.length;

  return (
    <div className="flex h-full flex-col">
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
        <tbody
          aria-label="custom pagination table"
          className="border-l-2 border-r-2 border-accent"
        >
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
                          ) : noStyleColumn && noStyleColumn[header[index]] ? (
                            <pre>{value}</pre>
                          ) : (
                            <p>{value}</p>
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
                      <td className="p-3">
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
          {content.length === 0 && !loading ? (
            <tr>
              <td colSpan={colSpan}>
                <div className="flex h-20 w-full items-center justify-center border border-black/10">
                  <p>No data to display.</p>
                </div>
              </td>
            </tr>
          ) : null}
          {loading ? (
            <tr>
              <td colSpan={colSpan}>
                <div className="flex h-20 w-full items-center justify-center border border-black/10">
                  <p>Loading</p>
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="sticky bottom-12 w-full border-t-2 border-accent" />
      <div className="sticky bottom-0 mt-auto h-12 bg-white">
        <div className="flex h-12 w-full items-center justify-end gap-8 px-3 pt-1">
          <div className="flex gap-4">
            <p className="text-sm">Rows per page:</p>
            <select
              className="text-sm"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
            >
              {Array.from({ length: 6 }, (_, index) => (index + 1) * 5).map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </div>
          <p className="text-sm text-black/60">
            {rowsPerPage * page + 1}-
            {Math.min(rowsPerPage * (page + 1), content.length)} of{" "}
            {content.length}
          </p>
          {/* have at least 2 page button to render */}
          {Math.ceil(content.length / rowsPerPage) > 1 ? (
            <div className="flex gap-1.5">
              {Array.from({
                length: Math.ceil(content.length / rowsPerPage),
              }).map((_, index) => (
                <Button
                  active={index === page}
                  onClick={() => setPage(index)}
                  width={40}
                  variant="secondary"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
