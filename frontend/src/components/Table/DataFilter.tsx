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
  time: [],
  value: [],
};

export function DataFilter({ filterConfig }: DataFilterProps) {
  const [filterState, setFilterState] = useState(
    Object.keys(filterConfig).reduce(
      (a, column) => {
        const type = filterConfig[column];
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
    ),
  );

  const handleToggleFilter =
    (column: string, filterName: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setFilterState((prev) => {
        prev[column][filterName].active = !prev[column][filterName].active;
        return { ...prev };
      });
    };

  console.log(filterState);

  return (
    <div className="mb-1 flex w-full gap-2">
      <Input className="flex-grow" placeholder="Search by name" />
      <div>
        <DropdownMenu>
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
                        ({ name, filterFunc, queryInputNameList }) => {
                          const thisFilterState = filterState[column][name];

                          console.log(thisFilterState);

                          return (
                            <DropdownMenuItem
                              onClick={handleToggleFilter(column, name)}
                              key={name}
                            >
                              <div className="group flex w-full items-center gap-2">
                                <div className="h-4 w-4 rounded-full border-2 border-black/50 p-[1px]">
                                  <div
                                    className={twMerge(
                                      "h-full w-full rounded-full transition group-hover:bg-gray-500",
                                      thisFilterState.active
                                        ? "bg-accent group-hover:bg-accent"
                                        : "",
                                    )}
                                  />
                                </div>
                                <p>{name}</p>
                              </div>
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
            <DropdownMenuItem className="text-error">
              <ClearAllIcon sx={{ fontSize: "20px", mr: 1 }} />
              <span>Clear all filters</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
