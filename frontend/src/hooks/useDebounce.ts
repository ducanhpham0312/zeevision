import { useState } from "react";

type Timer = ReturnType<typeof setTimeout>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SomeFunction = (...args: any[]) => void;

export function useDebounce<Func extends SomeFunction>(
  func: Func,
  delay = 1000,
): [SomeFunction, boolean] {
  const [timer, setTimer] = useState<Timer>();

  const debouncedFunction = ((...args) => {
    const newTimer = setTimeout(() => {
      func(...args);
      setTimer(undefined);
    }, delay);
    clearTimeout(timer);
    setTimer(newTimer);
  }) as Func;

  return [debouncedFunction, !!timer];
}
