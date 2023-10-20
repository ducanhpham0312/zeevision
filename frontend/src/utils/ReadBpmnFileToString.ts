export const ReadBpmnFileToString = (
  file: File | undefined,
  callback: (content: string) => void
) => {
  if (file && file.name.endsWith(".bpmn")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      if (e.target && e.target.result) {
        callback(e.target.result as string);
      }
    };
    reader.readAsText(file);
  }
};
