import { useState } from "react";
import { Button } from "../components/Button";
import DeployProcessPopup from "../components/DeployProcessPopup/DeployProcessPopup";
export default function InstancesPage() {
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpen = () => setIsPopUpOpen(true);
  const handleClose = () => setIsPopUpOpen(false);
  return (
    <>
      <h1>InstancesPage</h1>
      {/** Temporary test for open Modal */}
      <Button onClick={handleOpen}>Open Modal</Button>
      <DeployProcessPopup
        isPopUpOpen={isPopUpOpen}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />
    </>
  );
}
