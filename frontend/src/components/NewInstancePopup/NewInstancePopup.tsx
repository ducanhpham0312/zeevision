import { Popup, PopupAction, PopupContent } from "../Popup";
import { Button } from "../Button";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import { useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";

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
  const [variableJson, setVariableJson] = useState("{\n\t\n}");
  const [variableObject, setVariableObject] = useState({});

  useEffect(() => {
    setVariableObject(() => {
      try {
        return JSON.parse(variableJson);
      } catch (e) {
        return undefined;
      }
    });
  }, [variableJson]);

  return (
    <Popup
      open={isPopUpOpen}
      onClose={onClosePopUp}
      title={"Create a new Instance"}
      shouldNotCloseWhenClickAway
    >
      <PopupContent>
        <div className="flex flex-col gap-2">
          <p>Select a Process:</p>
          <p>Instance variables:</p>
          <div
            className={`relative w-full border-2 ${
              !variableObject ? "border-red-500" : "border-white"
            }`}
          >
            <AceEditor
              width="100%"
              height={"350px"}
              placeholder="Enter the instance variables in JSON"
              mode="json"
              theme="tomorrow"
              value={variableJson}
              onChange={(value) => setVariableJson(value)}
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
          {!variableObject ? (
            <div className="flex items-center gap-3 text-red-500">
              <InfoIcon sx={{ fontSize: "20px" }} />
              <p>Invalid JSON</p>
            </div>
          ) : null}
        </div>
      </PopupContent>
      <PopupAction>
        <Button variant="secondary" onClick={onClosePopUp}>
          Cancel
        </Button>
        <Button variant="primary">Create Instance</Button>
      </PopupAction>
    </Popup>
  );
}
