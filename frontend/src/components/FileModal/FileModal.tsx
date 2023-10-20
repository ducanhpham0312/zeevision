import { ChangeEvent, useRef, useState } from "react";
import { DragDropFile } from "../DragDrop/DragDropFile";
import { Popup, PopupAction, PopupContent } from "../Popup";
import { Button } from "../Button";
import { BpmnViewer } from "../BpmnViewer";
import { ReadBpmnFileToString } from "../../utils/ReadBpmnFileToString";

interface FileModalProps {
  isPopUpOpen: boolean;
  onOpenPopUp: () => void;
  onClosePopUp: () => void;
}
export default function FileModal({
  isPopUpOpen,
  onOpenPopUp,
  onClosePopUp,
}: FileModalProps) {
  const [bpmnString, setBpmnString] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadClick = () => {
    // click on file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      ReadBpmnFileToString(files[0], setBpmnString);
    }
  };

  const handleFileDroped = (file: string) => {
    setBpmnString(file as string);
    onOpenPopUp();
  };

  const handleClosePopUp = () => {
    onClosePopUp();
  };
  return (
    <>
      <Popup
        open={isPopUpOpen}
        onClose={handleClosePopUp}
        title={"Deploy a process"}
      >
        <PopupContent>
          <div>
            <Button type="button" onClick={handleFileUploadClick}>
              Deploy a file (.bpmn){" "}
            </Button>
            <p>Or drag the files to the box belows</p>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
          <div>
            {bpmnString && (
              <BpmnViewer
                width={700}
                bpmnString={bpmnString}
                navigated={true}
              />
            )}
          </div>
        </PopupContent>
        <PopupAction>
          <Button onClick={handleClosePopUp}>Cancel</Button>
          <Button variant="contained">Deploy process</Button>
        </PopupAction>
      </Popup>
      <DragDropFile onFileDropped={handleFileDroped} />
    </>
  );
}
