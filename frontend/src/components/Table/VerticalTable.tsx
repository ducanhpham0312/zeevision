import { ReactNode } from "react";

export interface VerticalTableProps {
  header: string[];
  content: (string | number | ReactNode)[][];
}

export function VerticalTable({ header, content }: VerticalTableProps) {
  if (content.length < 1) return null;
  return (
    <table className="relative w-full border-collapse rounded bg-white">
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
              {content[0][idx]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
