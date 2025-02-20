import React, { useState } from "react";
import {
    Button,
    TextField,
    Grid,
    Avatar,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Typography,
    Box,
} from "@mui/material";

const ProfileSettings = () => {
    const [profilePic, setProfilePic] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(URL.createObjectURL(file));
        }
    };

    return (
        <Box className="profileCard" sx={{ padding: '20px' }}>
            <Grid container spacing={3} alignItems="center">
                {/* Profile Image Upload */}
                <Grid item xs={12} sm={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={profilePic || "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/avatars/1.png"}
                        sx={{ width: 100, height: 100, mb: 2 }}
                        variant="rounded"
                    />
                    <Box>
                        <input
                            type="file"
                            accept="image/*"
                            id="upload-image"
                            style={{ display: "none" }}
                            onChange={handleImageChange}

                        />
                        <label htmlFor="upload-image" >
                            <Button className="buttonClassname">
                                Upload new photo
                            </Button>
                        </label>
                        <Button
                            className="secondaryBtnClassname" sx={{ ml: 2 }}>
                            Reset
                        </Button>
                        <Typography className="typo" sx={{ mt: 1 }}>
                            Allowed JPG, GIF or PNG. Max size 800K
                        </Typography>
                    </Box>
                </Grid>

                {/* Form Fields */}
                <Grid item xs={12} sm={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                   First Name
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="John" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    Last Name
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="Doe" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                   E-mail
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="john.doe@example.com" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    Organization
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="Pixinvent" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    Phone Number
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="US (+1) 202 555 0111" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    Address
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="Address" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    State
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="California" />
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    Zip Code
                                </Typography>
                                <TextField className="textfieldsClass" fullWidth defaultValue="231445" />
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} sx={{ mt: 2, textAlign: "right" }}>
                    <Button className="buttonClassname" sx={{ mr: 2 }}>
                        Save changes
                    </Button>
                    <Button className="secondaryBtnClassname" sx={{ px: 2 }}>Cancel</Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfileSettings;
