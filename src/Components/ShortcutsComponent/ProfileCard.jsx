import React, { useState } from "react";
import {
    Modal,
    Box,
    Fade,
    Backdrop,
    Avatar,
    Typography,
    TextField,
    IconButton,
    Tooltip,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Pagination } from 'swiper/modules';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ProfileCardModal.scss";
import { commonTextFieldProps, getRandomAvatarColor, ImageUrl } from "../../Utils/globalfun";
import { useRecoilValue } from "recoil";
import { assigneeId } from "../../Recoil/atom";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import { DelPrTeamsApi } from "../../Api/TaskApi/DelPrTeamsApi";
import useAccess from "../Auth/Role/useAccess";
import { PERMISSIONS } from "../Auth/Role/permissions";

const ProfileCardModal = ({ open, onClose, profileData = [], background, taskId = "", onRemoved }) => {
    const { hasAccess } = useAccess();
    const assigneeIDvalue = useRecoilValue(assigneeId);
    const [editIndex, setEditIndex] = useState(null);
    const [tempDesignation, setTempDesignation] = useState("");
    const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
    const [removingProfile, setRemovingProfile] = useState(null);

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

    const sortingAssignee = (a, b) => {
        if (a.id === assigneeIDvalue) return -1;
        if (b.id === assigneeIDvalue) return 1;
        return 0;
    };

    // Sort the profileData array
    const sortedProfileData = [...profileData].sort(sortingAssignee);

    const handleOpenRemoveConfirm = (profile) => {
        setRemovingProfile(profile);
        setRemoveConfirmOpen(true);
    };

    const handleCloseRemoveConfirm = () => {
        setRemoveConfirmOpen(false);
        setRemovingProfile(null);
    };

    const handleConfirmRemove = async () => {
        const assigneeid = removingProfile?.assigneeid ?? removingProfile?.id;
        if (!taskId || !assigneeid) {
            toast.error("Missing taskid or assigneeid");
            handleCloseRemoveConfirm();
            return;
        }

        const apiRes = await DelPrTeamsApi({ assigneeid }, { taskid: taskId });
        if (String(apiRes?.Status) === "200") {
            toast.success("Team member removed successfully");
            onRemoved?.(assigneeid);
            handleCloseRemoveConfirm();
        } else {
            toast.error("Failed to remove team member");
        }
    };

    return (
        <>
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
                            loop={false}
                            modules={[Keyboard, Pagination]}
                            keyboard={{
                                enabled: true,
                            }}
                            pagination={{ clickable: true }}
                            className="profile-swiper mySwiper"
                        >
                            {sortedProfileData?.map((profile, index) => (
                                <SwiperSlide key={profile.id || index}>
                                    <Box className="profile-card">
                                        {hasAccess(PERMISSIONS.teammemberremove) && (
                                            <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
                                                <Tooltip title="Remove from team" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenRemoveConfirm(profile)}
                                                        sx={{
                                                            backgroundColor: "#fafafa",
                                                            border: "1px solid #e0e0e0",
                                                            "&:hover": { backgroundColor: "#f5f5f5" },
                                                        }}
                                                    >
                                                        <Trash2 size={18} color="#d32f2f" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        )}
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
                                                    backgroundColor: background(`${profile?.firstname + " " + profile?.lastname}`),
                                                }}
                                            >
                                                {!ImageUrl(profile) &&
                                                    (profile?.firstname?.[0] || "") +
                                                    (profile?.lastname?.[0] || "")}
                                            </Avatar>
                                        </Box>

                                        {/* Profile Data */}
                                        <Box className="data">
                                            <Typography variant="h5" className="name" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {profile?.firstname + " " + profile?.lastname || "Employee"}
                                            </Typography>
                                            <Box>
                                                {editIndex === index ? (
                                                    <Box sx={{ textAlign: 'start' }}>
                                                        <Typography className="role" variant="body1">Project Role</Typography>
                                                        <TextField
                                                            variant="outlined"
                                                            value={tempDesignation}
                                                            onChange={handleDesignationChange}
                                                            onBlur={handleDesignationBlur}
                                                            autoFocus
                                                            {...commonTextFieldProps}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                        <Typography className="role" variant="body1">Project Role : </Typography>
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
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Box>
                </Fade>
            </Modal>

            <ConfirmationDialog
                open={removeConfirmOpen}
                onClose={handleCloseRemoveConfirm}
                onConfirm={handleConfirmRemove}
                title="Confirm"
                cancelLabel="Cancel"
                confirmLabel="Remove"
                content="Are you sure you want to remove this team member?"
            />
        </>
    );
};

export default ProfileCardModal;
