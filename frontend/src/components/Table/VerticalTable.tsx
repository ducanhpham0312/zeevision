import { Button } from "../Button";
import { NavLink } from "react-router-dom";

export interface VerticalTableProps {
  header: string[];
  content: (string | number)[][];
  navLinkColumn?: Record<string, (value: string | number) => string>;
}

export function VerticalTable({
  header,
  content,
  navLinkColumn,
}: VerticalTableProps) {
  if (content.length < 1) return null;
  return (
    <tbody>
      {header.map((title, idx) => (
        <tr
          key={title}
          className={
            idx % 2 === 0
              ? "bg-second-accent hover:bg-second-accent/20"
              : "hover:bg-second-accent/10"
          }
        >
          <th className="border border-r-0 p-3 text-left">{title}</th>
          <td className="border border-l-0 p-3 text-left">
            {navLinkColumn && navLinkColumn[title] ? (
              <NavLink to={navLinkColumn[title](content[0][idx])}>
                <Button variant="secondary">{content[0][idx]}</Button>
              </NavLink>
            ) : (
              content[0][idx]
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );
}
