import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, TextField, Grid, Typography, Box } from "@mui/material";

// ✅ Define Validation Schema using Zod
const schema = z.object({
    firstName: z.string().min(2, "First Name must be at least 2 characters"),
    lastName: z.string().min(2, "Last Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    organization: z.string().min(2, "Organization name is required"),
    phone: z.string().regex(/^\d{10}$/, "Invalid phone number format"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().length(6, "Zip Code must be 6 digits"),
});

const ProfileForm = ({ profileData, onSubmit }) => {
    const [editFlag, setEditFlag] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: profileData,
    });

    React.useEffect(() => {
        if (profileData) {
            reset(profileData);
        }
    }, [profileData, reset]);

    const handleEdit = () => {
        setEditFlag(true);
    };

    const handleFormSubmit = (data) => {
        onSubmit(data);
        setEditFlag(false);
    };

    const handleCancel = () => {
        reset(profileData);
        setEditFlag(false);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} style={{ padding: "10px 25px 20px 25px" }}>
            <Grid container spacing={2}>
                {/* First Name */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            First Name
                        </Typography>
                        <TextField {...register("firstName")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.firstName?.message}</span>
                    </Box>
                </Grid>

                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            Last Name
                        </Typography>
                        <TextField {...register("lastName")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.lastName?.message}</span>
                    </Box>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            E-mail
                        </Typography>
                        <TextField {...register("email")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.email?.message}</span>
                    </Box>
                </Grid>

                {/* Organization */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            Organization
                        </Typography>
                        <TextField {...register("organization")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.organization?.message}</span>
                    </Box>
                </Grid>

                {/* Phone Number */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            Phone Number
                        </Typography>
                        <TextField {...register("phone")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.phone?.message}</span>
                    </Box>
                </Grid>

                {/* Address */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            Address
                        </Typography>
                        <TextField {...register("address")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.address?.message}</span>
                    </Box>
                </Grid>

                {/* State */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            State
                        </Typography>
                        <TextField {...register("state")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.state?.message}</span>
                    </Box>
                </Grid>

                {/* Zip Code */}
                <Grid item xs={12} sm={6}>
                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">
                            Zip Code
                        </Typography>
                        <TextField {...register("zipCode")} className="textfieldsClass" fullWidth disabled={!editFlag} />
                        <span className="errorPFormMsg">{errors.zipCode?.message}</span>
                    </Box>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ mt: 2, textAlign: "right" }}>
                {!editFlag ? (
                    <Button type="button" className="buttonClassname" sx={{ mr: 2 }} onClick={handleEdit}>
                        Update
                    </Button>
                ) : (
                    <Box>
                        <Button type="submit" className="buttonClassname" sx={{ mr: 2 }}>
                            Save changes
                        </Button>
                        <Button className="secondaryBtnClassname" sx={{ px: 2 }} type="button" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Box>
                )}
            </Grid>
        </form>
    );
};

export default ProfileForm;
