import { useState, useCallback, useEffect, ChangeEvent, Fragment } from "react";
import { Button } from "../Button";
import { Minus, Plus } from "lucide-react";
import { ExpandRow } from "./ExpandRow";
import { DataFilter, DataFilterProps } from "./DataFilter";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { NavLink } from "react-router-dom";
import { useTableStore } from "../../contexts/useTableStore";
import React from "react";

export interface HorizontalTableProps {
  header: string[];
  content: (string | number)[][];
  navLinkColumn?: Record<string, (value: string | number) => string>;
  noStyleColumn?: Record<string, (value: string | number) => string>;
  alterRowColor?: boolean;
  filterConfig?: DataFilterProps["filterConfig"];
  expandElement?: (id: string | number) => React.ReactNode;
  useApiPagination?: {
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
  };
  apiTotalCount?: number;
}

export function HorizontalTable({
  header,
  content = [],
  alterRowColor,
  navLinkColumn,
  filterConfig,
  noStyleColumn,
  expandElement,
  useApiPagination,
  apiTotalCount,
}: HorizontalTableProps) {
  const [contentLength, setContentLength] = useState(
    apiTotalCount || content.length,
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [processedContent, setProcessedContent] =
    useState<(string | number)[][]>(content);

  const [copyHelperText, setCopyHelperText] = useState("Copy");
  const [filters, setFilters] = useState<
    ((input: Record<string, string | number>) => boolean)[]
  >([]);
  const { loading, setShouldUseClientPagination } = useTableStore();

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
    // Sort and filter the content when sortBy or sortOrder or filters changes
    const sortedData = sortContent(content, sortBy, sortOrder);
    setProcessedContent(
      sortedData.filter(
        (data) =>
          !filters.some(
            (filter) =>
              !filter(Object.fromEntries(header.map((k, i) => [k, data[i]]))),
          ),
      ),
    );
  }, [content, sortBy, sortOrder, filters, sortContent, header]);

  // Sync with global pagination state
  useEffect(() => {
    if (useApiPagination && !filters.length) {
      useApiPagination.setLimit(rowsPerPage);
      useApiPagination.setPage(page);
    }
  }, [filters, page, rowsPerPage, useApiPagination]);

  // Collapse expandable row on page / row per page changes
  useEffect(() => {
    setExpandedRow(null);
  }, [page, rowsPerPage]);

  // Sync content length
  useEffect(() => {
    setContentLength((prev) => {
      if (useApiPagination) {
        if (filters.length) {
          return processedContent.length;
        }
        if (apiTotalCount) {
          return apiTotalCount;
        }
        return prev;
      }
      return processedContent.length;
    });
  }, [processedContent, apiTotalCount, useApiPagination, filters.length]);

  useEffect(() => {
    setPage(0);
    if (useApiPagination) {
      setShouldUseClientPagination(!!filters.length);
    }
  }, [filters, setShouldUseClientPagination, useApiPagination]);

  const handleSort = (column: string): void => {
    const newSortOrder =
      column === sortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const newRowPerPage = parseInt(event.target.value, 10);
    setPage(0);
    setRowsPerPage(newRowPerPage);
  };

  const colSpan = expandElement ? header.length + 1 : header.length;

  const paginatedSortedContent =
    (useApiPagination && !filters.length) || rowsPerPage === -1
      ? processedContent
      : processedContent.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage,
        );

  return (
    <div className="flex h-full flex-col">
      {filterConfig ? (
        <DataFilter setFilter={setFilters} filterConfig={filterConfig} />
      ) : null}
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
          className="border-l border-r border-black/10"
        >
          {(loading ? [] : paginatedSortedContent).map((row, rowIdx) => {
            return (
              <Fragment key={rowIdx}>
                <tr
                  className={
                    "border-b border-black/10 " +
                    (alterRowColor && rowIdx % 2 === 0
                      ? "bg-second-accent hover:bg-second-accent/20"
                      : "hover:bg-second-accent/10")
                  }
                >
                  {row.map((value, index) => (
                    <td
                      className="group p-3"
                      key={`${rowIdx}-${index}`}
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
                    <td className="flex justify-center p-3">
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
                </tr>
                {expandElement ? (
                  <ExpandRow
                    isIn={expandedRow === rowIdx}
                    colSpan={header.length + 1}
                  >
                    {expandElement(row[0])}
                  </ExpandRow>
                ) : null}
              </Fragment>
            );
          })}
          {content.length === 0 && !loading ? (
            <tr className="border-b border-black/10">
              <td colSpan={colSpan}>
                <div className="flex h-20 w-full items-center justify-center">
                  <p>No data to display.</p>
                </div>
              </td>
            </tr>
          ) : null}
          {content.length > 0 && contentLength === 0 && !loading ? (
            <tr className="border-b border-black/10">
              <td colSpan={colSpan}>
                <div className="flex h-20 w-full items-center justify-center">
                  <p>No data satisfying selection.</p>
                </div>
              </td>
            </tr>
          ) : null}
          {loading ? (
            <tr className="border-b border-black/10">
              <td colSpan={colSpan}>
                <div className="flex h-20 w-full items-center justify-center">
                  <p>Loading...</p>
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <div className="sticky bottom-0 mt-auto h-12 bg-white">
        <div className="flex h-12 w-full items-center justify-end gap-8 px-3 pt-1">
          <div className="flex gap-4">
            <p className="text-sm">Rows per page:</p>
            <select
              className="text-sm"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
            >
              <option value={1}>1</option>
              {[10, 25, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              <option value={-1}>All</option>
            </select>
          </div>
          <p className="text-sm text-black/60">
            {`${rowsPerPage * page + 1}-${
              rowsPerPage !== -1
                ? Math.min(rowsPerPage * (page + 1), contentLength)
                : contentLength
            } of ${contentLength}`}
          </p>
          {/* have at least 2 page button to render */}
          {Math.ceil(contentLength / rowsPerPage) > 1 ? (
            <div className="flex gap-1.5">
              {Array.from({
                length: Math.ceil(contentLength / rowsPerPage),
              }).map((_, index) => (
                <Button
                  key={index}
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
