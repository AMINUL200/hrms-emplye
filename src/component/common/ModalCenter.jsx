import React from 'react'
import Modal from 'react-bootstrap/Modal';
const ModalCenter = ({ docImage, ...props }) => {
    const isPDF = docImage?.endsWith('.pdf') || docImage?.includes('.pdf');
    const docUrl = `https://skilledworkerscloud.co.uk/hrms-v2/public/storage/${docImage}`;
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter text-center">
                    Supporting Document
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {docImage ? (
                    isPDF ? (
                        <iframe
                            src={docUrl}
                            width="100%"
                            height="500px"
                            style={{ border: 'none' }}
                            title="PDF Document"
                        />
                    ) : (
                        <img
                            src={docUrl}
                            alt="Document"
                            style={{ maxWidth: '100%', maxHeight: '500px' }}
                        />
                    )
                ) : (
                    <p>No document available</p>
                )}
            </Modal.Body>
            {/* <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer> */}
        </Modal>
    )
}

export default ModalCenter
