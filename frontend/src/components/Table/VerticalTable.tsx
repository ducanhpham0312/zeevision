export interface VerticalTableProps {
  header: string[];
  content: (string | number)[][];
}

export function VerticalTable({ header, content }: VerticalTableProps) {
  if (!content || content.length === 0) return null;
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
          <td className="border border-l-0 p-3 text-left">{content[0][idx]}</td>
        </tr>
      ))}
    </tbody>
  );
}
