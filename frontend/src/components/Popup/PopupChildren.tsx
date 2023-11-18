import { HTMLAttributes } from "react";

export function PopupContent(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="mt-[10px] max-h-[500px] flex-grow overflow-y-auto pl-[20px] pr-[20px]"
    />
  );
}
export function PopupAction(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="flex justify-end gap-[10px] p-[15px] pr-[20px]"
    />
  );
}
