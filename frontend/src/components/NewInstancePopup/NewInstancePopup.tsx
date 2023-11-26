import { Popup, PopupAction, PopupContent } from "../Popup";
import { Button } from "../Button";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import { useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";

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
  const [variablesJsonString, setVariablesJsonString] = useState("{\n\t\n}");
  const [variablesObject, setVariablesObject] = useState({});

  useEffect(() => {
    setVariablesObject(() => {
      try {
        return JSON.parse(variablesJsonString);
      } catch (e) {
        return undefined;
      }
    });
  }, [variablesJsonString]);

  const handlePrettify = () => {
    if (!variablesObject) {
      return;
    }

    setVariablesJsonString(JSON.stringify(variablesObject, null, 2));
  };

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
          <p>Instance variabless:</p>
          <div
            className={`relative w-full border-2 ${
              !variablesObject ? "border-red-500" : "border-black/10"
            }`}
          >
            <AceEditor
              width="100%"
              height={"350px"}
              placeholder="Enter the instance variables in JSON"
              mode="json"
              theme="tomorrow"
              value={variablesJsonString}
              onChange={(value) => setVariablesJsonString(value)}
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
            <Button
              variant="secondary"
              className="absolute right-2 top-2 transition hover:scale-110"
              onClick={handlePrettify}
            >
              <CleaningServicesIcon sx={{ fontSize: "20px" }} />
            </Button>
          </div>
          {!variablesObject ? (
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
