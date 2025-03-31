import React from "react";
import { Modal, Box, Fade, Backdrop, Avatar, Typography } from "@mui/material";
import "./ProfileCardModal.scss";
import { ImageUrl } from "../../Utils/globalfun";

const ProfileCardModal = ({ open, onClose, profileData, background }) => {
    console.log('profileData: ', profileData);
    if (!profileData) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
        >
            <Fade in={open}>
                <Box className="profile-card-modal">
                    <Box className="profile-card">
                        {/* Profile Image */}
                        <Box className="image">
                            <Avatar
                                src={ImageUrl(profileData) || ""}
                                alt={profileData?.firstname + " " + profileData?.lastname || "Employee"}
                                className="profile-pic"
                                sx={{
                                    fontSize: '60px',
                                    backgroundColor: background(profileData?.firstname),
                                }}
                            >
                                {!ImageUrl(profileData) && (profileData?.firstname?.[0] || '') + (profileData?.lastname?.[0] || '')}
                            </Avatar>
                        </Box>

                        {/* Profile Data */}
                        <Box className="data">
                            <Typography variant="h5" className="name">
                                {profileData?.firstname + " " + profileData?.lastname || "Employee"}
                            </Typography>
                            <Typography variant="body1" className="role">
                                {profileData?.designation ?? ""}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ProfileCardModal;
