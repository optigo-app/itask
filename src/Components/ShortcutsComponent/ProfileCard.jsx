import React, { useState } from "react";
import {
    Modal,
    Box,
    Fade,
    Backdrop,
    Avatar,
    Typography,
    TextField,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Pagination } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ProfileCardModal.scss";
import { commonTextFieldProps, ImageUrl } from "../../Utils/globalfun";

const ProfileCardModal = ({ open, onClose, profileData = [], background }) => {
    const [editIndex, setEditIndex] = useState(null);
    const [tempDesignation, setTempDesignation] = useState("");
    if (!Array.isArray(profileData) || profileData.length === 0) return null;

    const handleDesignationClick = (index, currentDesignation) => {
        setEditIndex(index);
        setTempDesignation(currentDesignation);
    };

    const handleDesignationChange = (e) => {
        setTempDesignation(e.target.value);
    };

    const handleDesignationBlur = () => {
        setEditIndex(null);
    };

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
                    <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        loop={true}
                        modules={[Keyboard, Pagination]}
                        keyboard={{
                            enabled: true,
                        }}
                        pagination={{ clickable: true }}
                        className="profile-swiper mySwiper"
                    >
                        {profileData.map((profile, index) => (
                            <SwiperSlide key={profile.id || index}>
                                <Box className="profile-card">
                                    {/* Profile Image */}
                                    <Box className="image">
                                        <Avatar
                                            src={ImageUrl(profile) || ""}
                                            alt={
                                                profile?.firstname + " " + profile?.lastname || "Employee"
                                            }
                                            className="profile-pic"
                                            sx={{
                                                fontSize: "60px",
                                                backgroundColor: background(profile?.firstname),
                                            }}
                                        >
                                            {!ImageUrl(profile) &&
                                                (profile?.firstname?.[0] || "") +
                                                (profile?.lastname?.[0] || "")}
                                        </Avatar>
                                    </Box>

                                    {/* Profile Data */}
                                    <Box className="data">
                                        <Typography variant="h5" className="name">
                                            {profile?.firstname + " " + profile?.lastname || "Employee"}
                                        </Typography>
                                        {editIndex === index ? (
                                            <TextField
                                                variant="outlined"
                                                value={tempDesignation}
                                                onChange={handleDesignationChange}
                                                onBlur={handleDesignationBlur}
                                                autoFocus
                                                {...commonTextFieldProps}
                                            />
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                className="role"
                                                onClick={() =>
                                                    handleDesignationClick(index, profile?.designation)
                                                }
                                                sx={{ cursor: "pointer", textDecoration: "underline" }}
                                            >
                                                {profile?.designation ?? "Click to add"}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Fade>
        </Modal>
    );
};

export default ProfileCardModal;
