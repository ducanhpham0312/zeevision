import { useEffect, useState } from "react";

interface UseDragDropReturnType {
  dragging: boolean;
  file?: File;
}

export function useDragDrop(): UseDragDropReturnType {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File>();

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    };
    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      // Do validation
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
        // at least one file has been dropped so do something
        // handleFiles(e.dataTransfer.files);
      }
    };

    window.document.documentElement.addEventListener(
      "dragenter",
      handleDragEnter,
      false,
    );
    window.document.documentElement.addEventListener(
      "dragleave",
      handleDragLeave,
      false,
    );
    window.document.documentElement.addEventListener(
      "dragover",
      handleDragEnter,
      false,
    );
    window.document.documentElement.addEventListener("drop", handleDrop, false);

    return () => {
      window.document.documentElement.removeEventListener(
        "dragover",
        handleDragEnter,
      );
      window.document.documentElement.removeEventListener(
        "dragenter",
        handleDragEnter,
      );
      window.document.documentElement.removeEventListener(
        "dragleave",
        handleDragLeave,
      );
      window.document.documentElement.removeEventListener("drop", handleDrop);
    };
  },[]);

  return { dragging, file };
}
