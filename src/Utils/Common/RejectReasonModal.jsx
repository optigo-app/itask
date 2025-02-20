import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextareaAutosize, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const RejectReasonModal = ({
    open,
    onClose,
    onConfirm,
    rejectReason,
    setRejectReason,
    title = "Reason for Rejection",
    cancelText = "Cancel",
    confirmText = "Confirm Reject",
}) => {
    return (
        <Dialog open={open}
            onClose={onClose}
            maxWidth="sm" fullWidth
            PaperProps={{
                sx: { borderRadius: "8px", position: "relative" },
            }}
        >
            <DialogTitle sx={{ fontWeight: "bold" }}>
                {title}
            </DialogTitle>
            <Box sx={{ position: 'absolute', top: '0', right: '0' }}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <TextareaAutosize
                        minRows={4}
                        placeholder="Enter your rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{
                            width: "96%",
                            padding: "10px",
                            fontSize: "16px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            outline: "none",
                            resize: "vertical",
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ pb: 2, px: 3 }}>
                <Button onClick={onClose} variant="contained" className="secondaryBtnClassname">
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} variant="contained" className="buttonClassname">
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RejectReasonModal;
