import React, { useEffect, useState } from "react";

import { Input } from "../Input";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
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
import { useDebounce } from "../../hooks/useDebounce";
import { useTableStore } from "../../contexts/useTableStore";

export type FilterType = "string" | "time" | "value";

export interface DataFilterProps {
  filterConfig: {
    mainFilter: {
      column: string;
    };
    filterOptions: Record<string, FilterType>;
  };
  setFilter: React.Dispatch<
    React.SetStateAction<
      ((input: Record<string, string | number>) => boolean)[]
    >
  >;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterFunc: (...args: any[]) => boolean;
};

const columnFilterOptions: Record<FilterType, Array<FilterOptionType>> = {
  string: [
    {
      name: "is",
      queryInputNameList: ["is"],
      filterFunc: (input: string, queryString: string) => {
        return queryString.toString() === input.toString();
      },
    },
    {
      name: "is not",
      queryInputNameList: ["is-not"],
      filterFunc: (input: string, queryString: string) => {
        return queryString.toString() !== input.toString();
      },
    },
    {
      name: "contains",
      queryInputNameList: ["contains"],
      filterFunc: (input: string, queryString: string) => {
        return input.toString().includes(queryString);
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
        return queryString.toString() === input.toString();
      },
    },
    {
      name: "is not",
      queryInputNameList: ["is-not"],
      filterFunc: (input: string, queryString: string) => {
        return queryString.toString() !== input.toString();
      },
    },
    {
      name: "is between",
      queryInputNameList: ["is-between-first", "is-between-second"],
      filterFunc: (input: string, queryString: string) => {
        return queryString.toString() !== input.toString();
      },
    },
  ],
};

const getInitFilterState = (
  filterConfig: DataFilterProps["filterConfig"],
): Record<string, Record<string, FilterState>> =>
  Object.entries(filterConfig.filterOptions).reduce(
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
            filterFunc: filterOption.filterFunc,
          };
          return a;
        },
        {} as Record<string, FilterState>,
      );
      return a;
    },
    {} as Record<string, Record<string, FilterState>>,
  );

export function DataFilter({ filterConfig, setFilter }: DataFilterProps) {
  const [mainFilterQueryString, setMainFilterQueryString] = useState("");
  const [filterState, setFilterState] = useState(
    getInitFilterState(filterConfig),
  );
  const [filterCount, setFilterCount] = useState(
    Object.fromEntries(
      Object.keys(filterConfig.filterOptions).map((column) => [column, 0]),
    ),
  );
  const { setLoading } = useTableStore();
  const [debouncedHandleMainFilterChange, isDebouncing] = useDebounce(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setMainFilterQueryString(e.target.value),
    200,
  );

  useEffect(() => {
    if (!isDebouncing) {
      // avoid race condition that result in flash of un-filtered content.
      setTimeout(() => setLoading(isDebouncing as boolean), 100);
    } else {
      setLoading(isDebouncing as boolean);
    }
  }, [isDebouncing, setLoading]);

  useEffect(() => {
    const newFilterCount = Object.fromEntries(
      Object.keys(filterConfig.filterOptions).map((column) => [column, 0]),
    );
    const newFilters = Object.entries(filterState).flatMap(
      ([column, filterByColumn]) =>
        Object.values(filterByColumn).reduce(
          (a, filter) => {
            if (
              filter.active &&
              !Object.values(filter.filterValue).some(
                (value) => value.length === 0,
              )
            ) {
              newFilterCount[column] += 1;
              a.push((input: Record<string, string | number>): boolean =>
                filter.filterFunc(
                  input[filter.column],
                  ...Object.values(filter.filterValue),
                ),
              );
            }
            return a;
          },
          [] as ((input: Record<string, string | number>) => boolean)[],
        ),
    );

    if (mainFilterQueryString) {
      newFilters.push((input: Record<string, string | number>): boolean => {
        return input[filterConfig.mainFilter.column]
          .toString()
          .includes(mainFilterQueryString);
      });
    }

    setFilter(newFilters);
    setFilterCount(newFilterCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState, setFilter, mainFilterQueryString]);

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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterState((prev) => {
        prev[column][filterName].filterValue[e.target.name] = e.target.value;
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
        <Input
          onChange={(e) => {
            debouncedHandleMainFilterChange(e);
          }}
          className="flex-grow"
          placeholder={`Search by ${filterConfig.mainFilter.column}`}
        />
        <div>
          <DropdownMenu
            onOpenChange={(open) => {
              if (!open) {
                deactivateEmptyFilter();
              }
            }}
          >
            <DropdownMenuTrigger className="relative box-border h-full w-full rounded bg-second-accent p-2 px-4 text-accent transition hover:bg-hover hover:shadow-lg active:bg-active">
              <p>Filter {<FilterAltIcon />}</p>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" className="mr-4 mt-1 w-[250px]">
              <DropdownMenuLabel>Choose a column</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(filterConfig.filterOptions).map((column) => {
                const filterType = filterConfig.filterOptions[column];
                return (
                  <DropdownMenuSub key={column}>
                    <DropdownMenuSubTrigger>
                      <span>{`${column} ${
                        filterCount[column] > 0
                          ? `[${filterCount[column]}]`
                          : ""
                      }`}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="mr-[13px] w-[300px]">
                        {columnFilterOptions[filterType].map((filterOption) => {
                          const { name } = filterOption;
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
                                <InputFields
                                  filterState={thisFilterState}
                                  onChange={handleChangeQueryString(
                                    column,
                                    thisFilterState.filterName,
                                  )}
                                />
                              ) : null}
                            </DropdownMenuItem>
                          );
                        })}
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
      <div className="w-full">
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterState).map(([column, type]) =>
            Object.values(type).map((filter) => (
              <React.Fragment key={filter.filterName}>
                {filter.active ? (
                  <Popover
                    onOpenChange={(open) => {
                      if (!open) {
                        deactivateEmptyFilter();
                      }
                    }}
                    key={`${column}-${filter.filterName}`}
                  >
                    <PopoverTrigger>
                      <div className="my-2 flex items-center gap-3 rounded bg-hover p-2 px-3">
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
                      <div className="flex flex-col gap-2">
                        <p>Edit filter</p>
                        <InputFields
                          filterState={filter}
                          onChange={handleChangeQueryString(
                            column,
                            filter.filterName,
                          )}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : null}
              </React.Fragment>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

const InputFields = ({
  filterState,
  onChange,
}: {
  filterState: FilterState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div
      className="flex w-full flex-col gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {Object.keys(filterState.filterValue).map((name, index) => (
        <div onKeyDown={(e) => e.stopPropagation()} key={name}>
          <Input
            autoFocus={index === 0}
            name={name}
            value={filterState.filterValue[name]}
            onChange={onChange}
            placeholder="Enter query value here"
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};
