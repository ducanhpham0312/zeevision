import { ChangeEvent, useRef, useState } from "react";
import { readFileToString } from "../../utils/readFileToString";
import { ResponsiveBpmnViewer } from "../BpmnViewer";
import { Button } from "../Button";
import { Popup, PopupAction, PopupContent } from "../Popup";
import { DragDropFile } from "./DragDropFile";

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
          <div className="flex w-full flex-col gap-5">
            <div className="flex w-full items-center justify-between">
              <Button variant="secondary" onClick={handleFileUploadClick}>
                Upload a file (.bpmn)
              </Button>
              <input
                type="file"
                accept=".bpmn"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                data-testid="file-input"
              />
            </div>
            <div className="w-full">
              {bpmnString ? (
                <ResponsiveBpmnViewer
                  className="h-[300px] py-1"
                  bpmnString={bpmnString}
                  navigated={true}
                />
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center border-2 border-dashed">
                  <p className="text-black/40">Or drag a bpmn file here</p>
                </div>
              )}
            </div>
          </div>
        </PopupContent>
        <PopupAction>
          <Button variant="secondary" onClick={handleClosePopUp}>
            Cancel
          </Button>
          <Button variant="primary">Deploy process</Button>
        </PopupAction>
      </Popup>
      <DragDropFile onFileDropped={handleFileDroped} />
    </>
  );
}
