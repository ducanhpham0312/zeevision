import React, { useState } from "react";

interface ReadFileProps {}

export const ReadFile: React.FC<ReadFileProps> = () => {
  const [bpmnContent, setBpmnContent] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isValid, setIsValid] = useState(true);
  const isXML = (str: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, "application/xml");
    // Check for parsererror
    return !doc.getElementsByTagName("parsererror").length;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const content = e.target.result as string;
          if (isXML(content)) {
            setBpmnContent(content);
            setIsValid(true);
            console.log("The uploaded file is a valid BPMN file");
          } else {
            alert("The uploaded file is NOT a valid BPMN file");
            setIsValid(false);
          }
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid BPMN file");
    }
  };
  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".bpmn" />
      <pre>{bpmnContent}</pre>{" "}
    </div>
  );
};
