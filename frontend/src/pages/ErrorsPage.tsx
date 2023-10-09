import { useState } from "react";
import { Button } from "../components/Button";
import { Popup, PopupAction, PopupContent } from "../components/Popup/Popup";

export default function ErrorsPage() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <h1>ErrorsPage</h1>
      <Button onClick={handleOpen}>Open Modal</Button>
      <Popup open={open} onClose={handleClose} title={"Deploy a process"}>
        <PopupContent>
          <div>
            <Button>Deploy a file (.bpmn) </Button>
            <p>Or drag the files to the box belows</p>
          </div>
          <div>
            {[...new Array(50)]
              .map(
                () => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
              )
              .join("\n")}
          </div>
        </PopupContent>
        <PopupAction>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained">Deploy process</Button>
        </PopupAction>
      </Popup>
    </>
  );
}
