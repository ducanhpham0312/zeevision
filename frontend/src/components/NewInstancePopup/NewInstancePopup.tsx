import { Popup, PopupAction, PopupContent } from "../Popup";
import { Button } from "../Button";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";

interface NewInstancePopupProps {
  /**
   * Determines if the Popup should be displayed.
   */
  isPopUpOpen: boolean;
  /**
   * Callback function triggered to close the Popup.
   * @returns void
   */
  onClosePopUp: () => void;
}

export function NewInstancePopup({
  isPopUpOpen,
  onClosePopUp,
}: NewInstancePopupProps) {
  return (
    <Popup
      open={isPopUpOpen}
      onClose={onClosePopUp}
      title={"Create a new Instance"}
      shouldNotCloseWhenClickAway
    >
      <PopupContent>
        <div className="flex flex-col gap-2">
          <p>Instance variables:</p>
          <div className="w-full">
            <AceEditor
              width="full"
              placeholder="Enter the instance variables in JSON"
              mode="json"
              theme="tomorrow"
              value={"{\n\t\n}"}
              fontSize={14}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: false,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </PopupContent>
      <PopupAction>
        <Button variant="secondary" onClick={onClosePopUp}>
          Cancel
        </Button>
        <Button variant="primary">Deploy process</Button>
      </PopupAction>
    </Popup>
  );
}
