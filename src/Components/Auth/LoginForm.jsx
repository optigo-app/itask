import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Paper,
    useMediaQuery,
    InputAdornment,
    IconButton
} from "@mui/material";
import loginImage from "../../Assests/loginImage.webp";
import { commonTextFieldProps } from "../../Utils/globalfun";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { fetchLoginApi } from "../../Api/AuthApi/loginApi";
import { z } from "zod";
import "./LoginPage.scss";
import { Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
    prCode: z.string().min(1, "Project Code is required"),
    userId: z.string().min(1, "User ID is required"),
    password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({ prCode: "", userId: "", password: "" });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = loginSchema.safeParse(credentials);

        if (!result.success) {
            const newErrors = {};
            result.error.errors.forEach((err) => {
                newErrors[err.path[0]] = err.message;
            });
            setErrors(newErrors);
            return;
        }

        try {
            const data = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6ImFtVnVhWE5BWldjdVkyOXQiLCJleHAiOjE3NDc2MzMwODcsInVpZCI6ImFtVnVhWE5BWldjdVkyOXQiLCJ5YyI6ImUzdHVlbVZ1ZlgxN2V6SXdmWDE3ZTI5eVlXbHNNalY5Zlh0N2IzSmhhV3d5TlgxOSIsInN2IjoiMCJ9.KKB72Gvy1l7-MOX4Nt9VwxpkCRHUDWi_KW73K3LlUyc";
            // const loginData = await fetchLoginApi(credentials);

            // if (loginData?.length > 0) {
                localStorage.setItem("isLoggedIn", "true");
                Cookies.set("skey", data, { path: "/", expires: 15 });
                window.location.href = "/";
            // } else {
            //     alert("Invalid credentials");
            // }
        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="decorative-circle decorative-circle--top-left"></div>

                <Paper className="login-paper">
                    {/* Left Side: Login Form */}
                    <div className="login-form-section">
                        <div className="login-form-content">
                            <Typography variant="h5" className="login-title">LOGIN</Typography>
                            <Typography variant="body2" className="login-subtitle">
                                How to get started task
                            </Typography>

                            {/* Project Code */}
                            <div className="form-group">
                                <Typography variant="subtitle1" className="field-label">
                                    Project Code
                                </Typography>
                                <TextField
                                    name="prCode"
                                    fullWidth
                                    placeholder="Enter project code"
                                    value={credentials.prCode}
                                    onChange={handleChange}
                                    error={!!errors.prCode}
                                    helperText={errors.prCode}
                                    {...commonTextFieldProps}
                                />
                            </div>

                            {/* User ID */}
                            <div className="form-group">
                                <Typography variant="subtitle1" className="field-label">
                                    User Id
                                </Typography>
                                <TextField
                                    name="userId"
                                    fullWidth
                                    placeholder="Enter username"
                                    value={credentials.userId}
                                    onChange={handleChange}
                                    error={!!errors.userId}
                                    helperText={errors.userId}
                                    {...commonTextFieldProps}
                                />
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <Typography variant="subtitle1" className="field-label">
                                    Password
                                </Typography>
                                <TextField
                                    name="password"
                                    fullWidth
                                    placeholder="Enter password"
                                    type={showPassword ? "text" : "password"}
                                    value={credentials.password}
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    {...commonTextFieldProps}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="password-toggle"
                                                >
                                                    {showPassword ? <EyeOff width={20} height={20} /> : <Eye width={20} height={20} />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>

                            <div className="login-button-container">
                                <Button
                                    variant="contained"
                                    className="buttonClassname login-button"
                                    onClick={handleSubmit}
                                >
                                    Login Now
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Image */}
                    {!isMobile && (
                        <div className="login-image-section">
                            <div className="image-container">
                                <img
                                    src={loginImage}
                                    alt="Login Visual"
                                    className="login-image"
                                />
                            </div>
                        </div>
                    )}
                </Paper>

                <div className="decorative-circle decorative-circle--bottom-right"></div>
            </div>
        </div>
    );
};

export default LoginPage;