import React, { useEffect } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import './Profile.scss'
import { Calendar1, Code, MapPin, UserRoundCheck } from "lucide-react";
import ProfileForm from "./ProfileForm";
import ProfileViewModal from "./ProfileViewModal";
import DeleteDeactivateCard from "./DeleteAccountCard";

const ProfileCard = () => {
    const [profileData, setProfileData] = React.useState({});

    const handleEdit = () => {
    };

    const handleDelete = () => {
        console.log("Delete profile");
    };

    const handleChange = () => {
        console.log("Profile form changed");
    };

    const hanldeSubmit = (data) => {
        console.log("Profile form submitted", data);
        localStorage?.setItem('ProfileData', JSON.stringify(data))
    };

    useEffect(() => {
        const profileData = localStorage?.getItem('ProfileData')
        if (profileData) {
            setProfileData(JSON?.parse(profileData))
        }
    }, [])

    const handleDeleteAcc = () => {
        console.log("Item deleted!");
    };

    const handleDeactivate = () => {
        console.log("Item deactivated!");
    };

    return (
        <>
            <Card className="profileCard">
                {/* Cover Image */}
                <Box
                    sx={{
                        height: 250,
                        background: "linear-gradient(90deg, #ff6ec4, #7873f5)",
                    }}
                />

                {/* Profile Details */}
                <CardContent sx={{ display: "flex", alignItems: "center", p: 3, position: "relative" }}>
                    {/* Avatar */}
                    <ProfileViewModal
                        imageSrc="https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/1.png"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        altText="Shivam Shukla"
                    />

                    {/* User Info */}
                    <Box sx={{ marginLeft: "140px", flex: 1 }}>
                        <Typography variant="h5" fontWeight="500">
                            Shivam Shukla
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Code className="priconcolo" />
                                <Typography className="typoprofile">Web Developer</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <MapPin className="priconcolo" />
                                <Typography className="typoprofile">Surat City</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Calendar1 className="priconcolo" />
                                <Typography className="typoprofile">Joined April 2021</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Button */}
                    <Button
                        className="buttonClassname"
                        sx={{ px: 2 }}
                        startIcon={<UserRoundCheck width='20px' height='20px' />}
                    >
                        Connected
                    </Button>
                </CardContent>
                <ProfileForm profileData={profileData} onChange={handleChange} onSubmit={hanldeSubmit} />
            </Card>
            <DeleteDeactivateCard
                title="Delete Account"
                description="Are you sure you want to delete your account?"
                subDescription="Once you delete your account, there is no going back. Please be certain."
                onDelete={handleDeleteAcc}
                onDeactivate={handleDeactivate}
            />
        </>
    );
};

export default ProfileCard;
