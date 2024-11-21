import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";

export default function Tutorial() {
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    // Ensure the modal remains on top when the page loads
    setIsOpen(true);
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        backdrop="opaque"
        radius="lg"
        preventClose
        closeButton
        aria-labelledby="tutorial-modal"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
        }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999, // Ensure the modal is above all other content
          position: "fixed", // Keep it fixed on the viewport
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Welcome Tutorial</ModalHeader>
          <ModalBody>
            <p>
              Welcome to the app! This tutorial will guide you through the main features.
              Please take a moment to familiarize yourself with the layout.
            </p>
            <p>
              Click the "Close" button to proceed to the map and start exploring.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="foreground" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button
              className="bg-[#6f4ef2] shadow-lg shadow-indigo-500/20"
              onPress={onClose}
            >
              Get Started
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
