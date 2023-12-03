import { Input } from "../Input";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../DropdownMenu";

export type FilterType = "text" | "time";

interface DataFilterProps {
  filterConfig: Record<string, FilterType>;
}

export function DataFilter({ filterConfig }: DataFilterProps) {
  return (
    <div className="mb-1 flex w-full gap-2">
      <Input className="flex-grow" placeholder="Search by name" />
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="secondary">Add Filter {<FilterAltIcon />}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" className="ml-10 w-56">
            <DropdownMenuLabel>Choose a column</DropdownMenuLabel>
            {Object.keys(filterConfig).map((column) => (
              <DropdownMenuItem>
                <span>{column}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
