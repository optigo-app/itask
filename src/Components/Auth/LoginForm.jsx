import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper, useMediaQuery, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import loginImage from "../../Assests/loginImage.webp";
import { commonTextFieldProps } from "../../Utils/globalfun";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:600px)");
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({ username: "itask", password: "itask" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/')
        localStorage?.setItem('isLoggedIn', 'true');
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                px: { xs: 1, sm: 2, md: 2 },
            }}
        >
            <Box sx={{
                width: { xs: "100%", sm: "600px", md: "900px", lg: "1000px" },
                borderRadius: "20px",
                background: "#EDE7F6",
                p: { xs: 0, sm: 2, md: 8 },
                position: "relative",
            }}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "35px",
                        left: "35px",
                        width: "80px",
                        height: "80px",
                        backgroundColor: "#7367f0",
                        borderRadius: "50%",
                    }}
                />
                <Paper
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        width: "100%",
                        minHeight: "600px",
                        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    {/* Left Side: Login Form */}
                    <Box
                        sx={{
                            flex: 1,
                            background: "#fff",
                            padding: { xs: "30px", sm: "40px" },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "start",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold">
                            LOGIN
                        </Typography>
                        <Typography variant="body2" color="gray" mb={2}>
                            How to get started task
                        </Typography>
                            <Box className="form-group" width="100%" maxWidth={350}>
                                <Typography variant="subtitle1">Username</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter username"
                                    value={credentials.username} 
                                    {...commonTextFieldProps}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                />
                            </Box>
                            <Box className="form-group" width="100%" maxWidth={350}>
                                <Typography variant="subtitle1">Password</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter password"
                                    value={credentials.password} 
                                    type={showPassword ? "text" : "password"}
                                    {...commonTextFieldProps}
                                    onChange={handleChange}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton sx={{ color: '#8080808f' }} onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Button variant="contained" className="buttonClassname" onClick={handleSubmit}>
                                    Login Now
                                </Button>
                            </Box>
                    </Box>

                    {/* Right Side: Image Section (Hidden on Mobile) */}
                    {!isMobile && (
                        <Box
                            sx={{
                                flex: 1,
                                background: "linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: "80%",
                                    height: "80%",
                                    borderRadius: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <img
                                    src={loginImage}
                                    alt="Login Visual"
                                    style={{ width: "100%", borderRadius: "15px" }}
                                />
                            </Box>
                        </Box>
                    )}
                </Paper>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: "35px",
                        right: "35px",
                        width: "80px",
                        height: "80px",
                        backgroundColor: "#ffffff",
                        borderRadius: "50%",
                    }}
                />
            </Box>
        </Box>
    );
};

export default LoginPage;