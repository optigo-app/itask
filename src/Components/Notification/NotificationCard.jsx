import React, { useState } from "react";
import { Box, Typography, Avatar, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Notification.scss";
import { toast } from "react-toastify";
import CircleIcon from '@mui/icons-material/Circle';
import { MailOpen } from "lucide-react";
import MailIcon from '@mui/icons-material/Mail';
import DraftsIcon from '@mui/icons-material/Drafts';
import RejectReasonModal from "../../Utils/Common/RejectReasonModal";

const NotificationCard = ({ notification }) => {
    const [hover, setHover] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const handleOpenRejectModal = () => setOpenRejectModal(true);

    const handleAccept = () => {
        console.log("Accepted notification:", notification);
        toast.success("Notification Accepted");
    };

    const handleReject = () => {
        setOpenRejectModal(true);
    };

    const handleCloseRejectModal = () => {
        setOpenRejectModal(false);
        setRejectReason("");
    };

    const handleConfirmReject = () => {
        console.log("Rejected notification:", notification, "Reason:", rejectReason);
        handleCloseRejectModal();
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e0e0e0",
                padding: "10px",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="notiCardCo"
        >
            <Box sx={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
                <Avatar sx={{ bgcolor: "#d1e7dd", marginRight: 2 }}>
                    {notification.avatar.includes("http") ? (
                        <img
                            src={notification.avatar}
                            alt={notification.title}
                            style={{ width: "100%" }}
                        />
                    ) : (
                        notification.avatar
                    )}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography className="notiCo notiTitleDescriptCo" variant="body2" fontWeight={600}>
                        {notification.title}
                    </Typography>
                    <Typography className="notiCo notiTitleDescriptCo" variant="body2" color="text.secondary">
                        {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography className="notiCo" variant="caption" color="text.secondary">
                            {notification.time}
                        </Typography>
                        {notification.hasActions && (
                            <Box sx={{ marginTop: 1, textAlign: 'end' }}>
                                <Button className="btnAccept buttonClassname"
                                    variant="contained" size="small" color="primary" onClick={handleAccept}>
                                    Accept
                                </Button>
                                <Button className="btnReject dangerbtnClassname"
                                    variant="contained" size="small" color="error" onClick={handleReject} sx={{ marginLeft: 1 }}>
                                    Reject
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
                <IconButton size="small" sx={{ position: "absolute", top: "-12px", right: "-12px" }}>
                    {!notification?.markAsUnread ? (
                        <DraftsIcon sx={{ color: '#7D7f85', fontSize: '20px' }} />
                    ) :
                        <MailIcon sx={{ color: '#7367f0', fontSize: '20px' }} />
                    }
                </IconButton>
                {hover && (
                    <>
                        <IconButton size="small" sx={{ position: "absolute", top: "20px", right: "-12px" }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Reject Reason Modal */}
            <RejectReasonModal
                open={openRejectModal}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
            />
        </Box>
    );
};

export default NotificationCard;
