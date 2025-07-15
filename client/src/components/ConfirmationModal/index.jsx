import { Button, Modal, Col, Container, Row } from 'react-bootstrap';


const ConfirmationModal = function ConfirmationModal({
  show,
  close,
  confirmationTitle,
  confirmationText,
  cancelButton,
  confirmButton,
  onFinish,
}) {

  const defaultTitle = "Please Confirm to Move to Next Page";
  const defaultBody = "You will not be able to return to this page. Please confirm before moving on to the next page.";
  const defaultCancel = "Return to Current Page";
  const defaultConfirm = "Save and Move to Next Page";

  return (
    <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
            <Modal.Title>{confirmationTitle ? confirmationTitle : defaultTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmationText ? confirmationText : defaultBody}</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={close}>
                {cancelButton ? cancelButton : defaultCancel}
            </Button>
            <Button variant="primary" onClick={onFinish}>
                {confirmButton ? confirmButton : defaultConfirm}
            </Button>
        </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;