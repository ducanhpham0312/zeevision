import { ChangeEvent, useRef, useState } from "react";
import { DragDropFile } from "../DragDropFile/DragDropFile";
import { Popup, PopupAction, PopupContent } from "../Popup";
import { Button } from "../Button";
import { BpmnViewer } from "../BpmnViewer";
import { readFileToString } from "../../utils/readFileToString";

interface DeployProcessPopupProps {
  /**
   * Determines if the Popup should be displayed.
   */
  isPopUpOpen: boolean;
  /**
   * Callback function triggered to open the Popup.
   * @returns void
   */
  onOpenPopUp: () => void;
  /**
   * Callback function triggered to close the Popup.
   * @returns void
   */
  onClosePopUp: () => void;
}
export function DeployProcessPopup({
  isPopUpOpen,
  onOpenPopUp,
  onClosePopUp,
}: DeployProcessPopupProps) {
  const [bpmnString, setBpmnString] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadClick = () => {
    // click on file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      setBpmnString(await readFileToString(files[0]));
    }
  };

  const handleFileDroped = (file: string) => {
    setBpmnString(file as string);
    onOpenPopUp();
  };

  const handleClosePopUp = () => {
    onClosePopUp();
    setTimeout(() => setBpmnString(""), 200);
  };
  return (
    <>
      <Popup
        open={isPopUpOpen}
        onClose={handleClosePopUp}
        title={"Deploy a process"}
        shouldNotCloseWhenClickAway
      >
        <PopupContent style={{ overflow: "hidden" }}>
          <div>
            <Button type="button" onClick={handleFileUploadClick}>
              Deploy a file (.bpmn)
            </Button>
            <p>Or drag a bpmn file here</p>
            <input
              type="file"
              accept=".bpmn"
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
