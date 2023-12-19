import React, { Fragment, useEffect, useState } from "react";

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

export type FilterType = "string" | "time" | "number";

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
  queryInputList: Array<{ name: string; placeholder: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterFunc: (...args: any[]) => boolean;
};

type FilterState = {
  column: string;
  type: FilterType;
  active: boolean;
  filterName: string;
  filterValue: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterFunc: (...args: any[]) => boolean;
};

const DEFAULT_PLACEHOLDER = "Enter value...";

type TimeFilterValueNameType = [string, string, string, string, string, string];

const columnFilterOptions: Record<
  FilterType,
  Record<string, FilterOptionType>
> = {
  string: {
    is: {
      name: "is",
      queryInputList: [{ name: "is", placeholder: DEFAULT_PLACEHOLDER }],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        return (
          queryValue["is"].toString().toLowerCase() ===
          input.toString().toLowerCase()
        );
      },
    },
    "is not": {
      name: "is not",
      queryInputList: [{ name: "is-not", placeholder: DEFAULT_PLACEHOLDER }],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        return (
          queryValue["is-not"].toString().toLowerCase() !==
          input.toString().toLowerCase()
        );
      },
    },
    contains: {
      name: "contains",
      queryInputList: [{ name: "contains", placeholder: DEFAULT_PLACEHOLDER }],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        return input
          .toString()
          .toLowerCase()
          .includes(queryValue["contains"].toString().toLowerCase());
      },
    },
  },
  time: {
    "is before": {
      name: "is before",
      queryInputList: [
        { name: "before-year", placeholder: "YYYY" },
        { name: "before-month", placeholder: "MM" },
        { name: "before-day", placeholder: "DD" },
        { name: "before-hour", placeholder: "HH" },
        { name: "before-minute", placeholder: "MM" },
        { name: "before-second", placeholder: "SS" },
      ],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        try {
          const inputDate = new Date(input);
          const queryDate = filterValueToDate(
            queryValue,
            [
              "before-year",
              "before-month",
              "before-day",
              "before-hour",
              "before-minute",
              "before-second",
            ],
            999,
          );
          return inputDate.getTime() <= queryDate.getTime();
        } catch (error) {
          return false;
        }
      },
    },
    "is after": {
      name: "is after",
      queryInputList: [
        { name: "after-year", placeholder: "YYYY" },
        { name: "after-month", placeholder: "MM" },
        { name: "after-day", placeholder: "DD" },
        { name: "after-hour", placeholder: "HH" },
        { name: "after-minute", placeholder: "MM" },
        { name: "after-second", placeholder: "SS" },
      ],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        try {
          const inputDate = new Date(input);
          const queryDate = filterValueToDate(
            queryValue,
            [
              "after-year",
              "after-month",
              "after-day",
              "after-hour",
              "after-minute",
              "after-second",
            ],
            0,
          );
          return inputDate.getTime() >= queryDate.getTime();
        } catch (error) {
          return false;
        }
      },
    },
    "is between": {
      name: "is between",
      queryInputList: [
        { name: "is-between-year-first", placeholder: "YYYY" },
        { name: "is-between-month-first", placeholder: "MM" },
        { name: "is-between-day-first", placeholder: "DD" },
        { name: "is-between-hour-first", placeholder: "HH" },
        { name: "is-between-minute-first", placeholder: "MM" },
        { name: "is-between-second-first", placeholder: "SS" },
        { name: "is-between-year-second", placeholder: "YYYY" },
        { name: "is-between-month-second", placeholder: "MM" },
        { name: "is-between-day-second", placeholder: "DD" },
        { name: "is-between-hour-second", placeholder: "HH" },
        { name: "is-between-minute-second", placeholder: "MM" },
        { name: "is-between-second-second", placeholder: "SS" },
      ],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        try {
          const inputDate = new Date(input);
          // 0 ms
          const queryDateFirst = filterValueToDate(
            queryValue,
            [
              "is-between-year-first",
              "is-between-month-first",
              "is-between-day-first",
              "is-between-hour-first",
              "is-between-minute-first",
              "is-between-second-first",
            ],
            0,
          );
          // 999 ms
          const queryDateSecond = filterValueToDate(
            queryValue,
            [
              "is-between-year-second",
              "is-between-month-second",
              "is-between-day-second",
              "is-between-hour-second",
              "is-between-minute-second",
              "is-between-second-second",
            ],
            999,
          );
          return (
            queryDateFirst.getTime() <= inputDate.getTime() &&
            inputDate.getTime() <= queryDateSecond.getTime()
          );
        } catch (error) {
          return false;
        }
      },
    },
  },
  number: {
    is: {
      name: "is",
      queryInputList: [{ name: "is", placeholder: DEFAULT_PLACEHOLDER }],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        try {
          return parseInt(queryValue["is"]) === parseInt(input);
        } catch (error) {
          return false;
        }
      },
    },
    "is not": {
      name: "is not",
      queryInputList: [{ name: "is-not", placeholder: DEFAULT_PLACEHOLDER }],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        try {
          return parseInt(queryValue["is-not"]) !== parseInt(input);
        } catch (error) {
          return false;
        }
      },
    },
    "is between": {
      name: "is between",
      queryInputList: [
        { name: "is-between-first", placeholder: DEFAULT_PLACEHOLDER },
        { name: "is-between-second", placeholder: DEFAULT_PLACEHOLDER },
      ],
      filterFunc: (input: string, queryValue: Record<string, string>) => {
        try {
          return (
            parseInt(queryValue["is-between-first"]) <= parseInt(input) &&
            parseInt(input) <= parseInt(queryValue["is-between-second"])
          );
        } catch (error) {
          return false;
        }
      },
    },
  },
};

const getInitFilterState = (
  filterConfig: DataFilterProps["filterConfig"],
): Record<string, Record<string, FilterState>> =>
  Object.entries(filterConfig.filterOptions).reduce(
    (a, [column, type]) => {
      a[column] = Object.values(columnFilterOptions[type]).reduce(
        (a, filterOption) => {
          a[filterOption.name] = {
            active: false,
            type,
            column: column,
            filterName: filterOption.name,
            filterValue: filterOption.queryInputList.reduce(
              (a, { name }) => {
                a[name] = "";
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
                filter.filterFunc(input[filter.column], filter.filterValue),
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
    (e: React.ChangeEvent<HTMLInputElement> | string, name?: string) => {
      if (typeof e === "string" || e instanceof String) {
        if (name) {
          setFilterState((prev) => {
            prev[column][filterName].filterValue[name] = e as string;
            return { ...prev };
          });
        }
      } else {
        setFilterState((prev) => {
          prev[column][filterName].filterValue[e.target.name] = e.target.value;
          return { ...prev };
        });
      }
    };

  /**
   * Should set filter active state to false for filters with all empty values
   */
  const deactivateEmptyFilter = () => {
    setFilterState((prev) => {
      Object.entries(prev).forEach(([column, filters]) =>
        Object.keys(filters).forEach((filterName) => {
          if (prev[column][filterName].active) {
            if (
              !Object.values(prev[column][filterName].filterValue).some(
                (value) => value,
              )
            ) {
              prev[column][filterName].active = false;
            }
          }
        }),
      );
      return { ...prev };
    });
  };

  const clearAllFilterInColumn = (col: string) => {
    setFilterState((prev) => {
      Object.entries(prev).forEach(([column, filters]) =>
        Object.keys(filters).forEach((filterName) => {
          if (column === col && prev[column][filterName].active) {
            Object.keys(prev[column][filterName].filterValue).forEach(
              (key) => (prev[column][filterName].filterValue[key] = ""),
            );
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
              <DropdownMenuLabel>Choose any columns</DropdownMenuLabel>
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
                        <DropdownMenuLabel className="pt-1">
                          {column}
                        </DropdownMenuLabel>
                        {Object.values(columnFilterOptions[filterType]).map(
                          (filterOption) => {
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
                          },
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-error"
                          onClick={() => clearAllFilterInColumn(column)}
                        >
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
              <Fragment key={filter.filterName}>
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
                          {filter.type === "time" ? (
                            <p>
                              {
                                // ensuring the input to have length of 6
                                Object.keys(filter.filterValue).length === 6
                                  ? filterValueToDate(
                                      filter.filterValue,
                                      Object.keys(
                                        filter.filterValue,
                                      ) as TimeFilterValueNameType,
                                      filter.filterName === "after" ? 0 : 999,
                                    ).toISOString()
                                  : ``.concat(
                                      filterValueToDate(
                                        filter.filterValue,
                                        Object.keys(filter.filterValue).slice(
                                          0,
                                          5,
                                        ) as TimeFilterValueNameType,
                                      ).toISOString(),
                                      " and ",
                                      filterValueToDate(
                                        filter.filterValue,
                                        Object.keys(filter.filterValue).slice(
                                          6,
                                          11,
                                        ) as TimeFilterValueNameType,
                                      ).toISOString(),
                                    )
                              }
                            </p>
                          ) : (
                            <p>
                              {`${Object.values(filter.filterValue).join(
                                " and ",
                              )}`}
                            </p>
                          )}
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
              </Fragment>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

function isIsoDate(str: string): boolean {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str; // valid date
}

const InputFields = ({
  filterState,
  onChange,
}: {
  filterState: FilterState;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement> | string,
    name?: string,
  ) => void;
}) => {
  const filterOption =
    columnFilterOptions[filterState.type][filterState.filterName];

  const handleChangeNumericWithMaxLength = (
    e: React.ChangeEvent<HTMLInputElement>,
    maxLength: number,
  ) => {
    if (!/^-?\d*$/.test(e.target.value) || e.target.value.length > maxLength) {
      return;
    }
    onChange(e);
    if (e.target.value.length === maxLength) {
      const inputIndex = filterOption.queryInputList.findIndex(
        (input) => input.name === e.target.name,
      );
      const nextInputId =
        filterOption.queryInputList.length > inputIndex + 1
          ? filterOption.queryInputList[inputIndex + 1].name
          : null;
      if (nextInputId) {
        return document.getElementById(nextInputId)?.focus();
      }
    }
    return;
  };

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      {filterState.type === "time" ? (
        <div className="grid grid-cols-3 gap-1">
          {filterOption.queryInputList.map(({ name, placeholder }, index) => (
            <Fragment key={name}>
              <div
                className="flex items-center justify-center"
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Input
                  onPaste={(e) => {
                    const clipboardData = e.clipboardData.getData("Text");
                    if (isIsoDate(clipboardData)) {
                      e.preventDefault();
                      const date = new Date(clipboardData);
                      const parsedDate = [
                        date.getUTCFullYear(),
                        date.getUTCMonth() + 1,
                        date.getUTCDate(),
                        date.getUTCHours(),
                        date.getUTCMinutes(),
                        date.getUTCSeconds(),
                      ].map((date) => date.toString());

                      const beginIndex = 6 * parseInt((index / 6).toString());
                      filterOption.queryInputList
                        .slice(beginIndex, beginIndex + 6)
                        .forEach((filter, index) =>
                          onChange(parsedDate[index], filter.name),
                        );
                    }
                  }}
                  autoFocus={index === 0}
                  name={name}
                  id={name}
                  value={filterState.filterValue[name]}
                  onChange={(e) =>
                    handleChangeNumericWithMaxLength(e, placeholder.length)
                  }
                  placeholder={placeholder}
                  className="w-full"
                />
                {(index + 1) % 3 !== 0 ? (
                  <p className="pl-1">{(index + 1) % 6 < 3 ? "/" : ":"}</p>
                ) : null}
              </div>
              {index + 1 < filterOption.queryInputList.length &&
              (index + 1) % 6 === 0 ? (
                <div className="col-span-3">
                  <p>and</p>
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      ) : (
        filterOption.queryInputList.map(({ name, placeholder }, index) => (
          <div onKeyDown={(e) => e.stopPropagation()} key={name}>
            <Input
              type={filterState.type === "number" ? "number" : "text"}
              autoFocus={index === 0}
              name={name}
              id={name}
              value={filterState.filterValue[name]}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full"
            />
            {index < filterOption.queryInputList.length - 1 ? <p>and</p> : null}
          </div>
        ))
      )}
    </div>
  );
};

/**
 * Should take in the filter values and the order in which the value names represent the Date in Year / Month / Day, Hour : Minute : Second
 * @param queryValue
 * @param valueName
 * @param millisecond
 * @returns new Date object that represent the filter values
 */
const filterValueToDate = (
  queryValue: Record<string, string>,
  valueName: TimeFilterValueNameType,
  millisecond: number = 0,
): Date => {
  const queryValueNumber = Object.fromEntries(
    Object.entries(queryValue).map(([key, val]) => [
      key,
      val !== "" ? parseInt(val) : 0,
    ]),
  );

  const dateData = valueName.map((name) =>
    name in queryValueNumber ? queryValueNumber[name] : 0,
  ) as [number, number, number, number, number, number];

  // set the value in month position to be 1 less
  dateData[1] -= 1;

  return new Date(Date.UTC(...dateData, millisecond));
};
