import React, { useState } from "react";

import { Input } from "../Input";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { twMerge } from "tailwind-merge";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import CloseIcon from "@mui/icons-material/Close";

export type FilterType = "string" | "time" | "value";

interface DataFilterProps {
  filterConfig: Record<string, FilterType>;
}

type FilterOptionType = {
  name: string;
  queryInputNameList: Array<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterFunc: (...args: any[]) => boolean;
};

type FilterState = {
  column: string;
  active: boolean;
  filterName: string;
  filterValue: Record<string, string>;
};

const columnFilterOptions: Record<FilterType, Array<FilterOptionType>> = {
  string: [
    {
      name: "is",
      queryInputNameList: ["is"],
      filterFunc: (input: string, queryString: string) => {
        return queryString === input;
      },
    },
    {
      name: "is not",
      queryInputNameList: ["is-not"],
      filterFunc: (input: string, queryString: string) => {
        return queryString !== input;
      },
    },
    {
      name: "contains",
      queryInputNameList: ["contains"],
      filterFunc: (input: string, queryString: string) => {
        return queryString !== input;
      },
    },
  ],
  time: [
    {
      name: "before",
      queryInputNameList: ["before"],
      filterFunc: (input: string, queryString: string) => {
        return queryString === input;
      },
    },
    {
      name: "after",
      queryInputNameList: ["after"],
      filterFunc: (input: string, queryString: string) => {
        return queryString !== input;
      },
    },
    {
      name: "is between",
      queryInputNameList: ["is-between-first", "is-between-second"],
      filterFunc: (input: string, queryString: string) => {
        return queryString !== input;
      },
    },
  ],
  value: [
    {
      name: "is",
      queryInputNameList: ["is"],
      filterFunc: (input: string, queryString: string) => {
        return queryString === input;
      },
    },
    {
      name: "is not",
      queryInputNameList: ["is-not"],
      filterFunc: (input: string, queryString: string) => {
        return queryString !== input;
      },
    },
    {
      name: "is between",
      queryInputNameList: ["is-between-first", "is-between-second"],
      filterFunc: (input: string, queryString: string) => {
        return queryString !== input;
      },
    },
  ],
};

const getInitFilterState = (
  filterConfig: DataFilterProps["filterConfig"],
): Record<string, Record<string, FilterState>> =>
  Object.entries(filterConfig).reduce(
    (a, [column, type]) => {
      a[column] = columnFilterOptions[type].reduce(
        (a, filterOption) => {
          a[filterOption.name] = {
            active: false,
            column: column,
            filterName: filterOption.name,
            filterValue: filterOption.queryInputNameList.reduce(
              (a, queryInputName) => {
                a[queryInputName] = "";
                return a;
              },
              {} as Record<string, string>,
            ),
          };
          return a;
        },
        {} as Record<string, FilterState>,
      );
      return a;
    },
    {} as Record<string, Record<string, FilterState>>,
  );

export function DataFilter({ filterConfig }: DataFilterProps) {
  const [filterState, setFilterState] = useState(
    getInitFilterState(filterConfig),
  );

  const handleToggleFilter =
    (column: string, filterName: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setFilterState((prev) => {
        // toggle active state of a filter
        prev[column][filterName].active = !prev[column][filterName].active;
        // clear the query string of a filter
        if (!prev[column][filterName].active) {
          Object.keys(prev[column][filterName].filterValue).forEach(
            (key) => (prev[column][filterName].filterValue[key] = ""),
          );
        }
        return { ...prev };
      });
    };

  const handleChangeQueryString =
    (column: string, filterName: string) =>
    (e: React.FormEvent<HTMLInputElement>) => {
      setFilterState((prev) => {
        prev[column][filterName].filterValue[e.currentTarget.name] =
          e.currentTarget.value;
        return { ...prev };
      });
    };

  const deactivateEmptyFilter = () => {
    setFilterState((prev) => {
      Object.entries(prev).forEach(([column, filters]) =>
        Object.keys(filters).forEach((filterName) => {
          if (prev[column][filterName].active) {
            if (
              Object.values(prev[column][filterName].filterValue).some(
                (value) => !value,
              )
            ) {
              prev[column][filterName].active = false;
              Object.keys(prev[column][filterName].filterValue).forEach(
                (key) => (prev[column][filterName].filterValue[key] = ""),
              );
            }
          }
        }),
      );
      return { ...prev };
    });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-1 flex w-full gap-2">
        <Input className="flex-grow" placeholder="Search by name" />
        <div>
          <DropdownMenu
            onOpenChange={(open) => {
              if (!open) {
                deactivateEmptyFilter();
              }
            }}
          >
            <DropdownMenuTrigger>
              <Button variant="secondary">Filter {<FilterAltIcon />}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" className="mr-4 mt-1 w-[250px]">
              <DropdownMenuLabel>Choose a column</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(filterConfig).map((column) => {
                const filterType = filterConfig[column];
                return (
                  <DropdownMenuSub key={column}>
                    <DropdownMenuSubTrigger>
                      <span>{column}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="mr-[13px] w-[300px]">
                        {columnFilterOptions[filterType].map(
                          ({ name, queryInputNameList }) => {
                            const thisFilterState = filterState[column][name];
                            return (
                              <DropdownMenuItem
                                onPointerLeave={(e) => e.preventDefault()}
                                onPointerMove={(e) => e.preventDefault()}
                                onClick={handleToggleFilter(column, name)}
                                key={name}
                                className="flex flex-col gap-3"
                              >
                                <div className="group flex w-full items-center gap-2">
                                  <div className="h-4 w-4 rounded-full border-2 border-black/50 p-[1px]">
                                    <div
                                      className={twMerge(
                                        "h-full w-full rounded-full transition group-hover:bg-gray-300",
                                        thisFilterState.active
                                          ? "bg-accent group-hover:bg-accent"
                                          : "",
                                      )}
                                    />
                                  </div>
                                  <p>{name}</p>
                                </div>
                                {thisFilterState.active ? (
                                  <div
                                    className="flex w-full flex-col gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {queryInputNameList.map((name) => (
                                      <Input
                                        key={name}
                                        name={name}
                                        value={
                                          thisFilterState.filterValue[name]
                                        }
                                        onChange={handleChangeQueryString(
                                          column,
                                          thisFilterState.filterName,
                                        )}
                                        placeholder="Enter query value here"
                                        className="w-full"
                                      />
                                    ))}
                                  </div>
                                ) : null}
                              </DropdownMenuItem>
                            );
                          },
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-error">
                          <ClearAllIcon sx={{ fontSize: "20px", mr: 1 }} />
                          <span>Clear column filters</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-error"
                onClick={() => setFilterState(getInitFilterState(filterConfig))}
              >
                <ClearAllIcon sx={{ fontSize: "20px", mr: 1 }} />
                <span>Clear all filters</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="my-2 w-full">
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterState).map(([column, type]) =>
            Object.values(type).map((filter) => (
              <>
                {filter.active &&
                !Object.values(filter.filterValue).some((value) => !value) ? (
                  <Popover key={`${column}-${filter.filterName}`}>
                    <PopoverTrigger>
                      <div className="flex items-center gap-3 rounded bg-hover p-2 px-3">
                        <div className="flex gap-1.5">
                          <p>{`${column}`}</p>
                          <p className="text-black/60">{`${filter.filterName}`}</p>
                          <p>
                            {`${Object.values(filter.filterValue).join(
                              " and ",
                            )}`}
                          </p>
                        </div>
                        <div
                          onClick={handleToggleFilter(
                            column,
                            filter.filterName,
                          )}
                          className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-500/20"
                        >
                          <CloseIcon fontSize={"small"} />
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex">
                        <p>Edit</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : null}
              </>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
