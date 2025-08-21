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
import { toast } from "react-toastify";

const loginSchema = z.object({
    companycode: z.string().min(1, "Project Code is required"),
    userId: z.string().min(1, "User ID is required"),
    password: z.string().min(1, "Password is required"),
});

const LoginPage = () => {
    const isMobile = useMediaQuery("(max-width:600px)");
    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({ companycode: "", userId: "", password: "" });
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
            const loginData = await fetchLoginApi(credentials);
            const formatData = {
                aud: btoa(loginData?.rd[0]?.userid),
                exp: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60, // current time + 10 days in seconds
                iss: "itask",
                sv: loginData?.rd[0]?.svid,
                uid: loginData?.rd[0]?.userid,
                yc: loginData?.rd[0]?.yearcode
            }
            if (loginData?.rd[0]?.stat == 1) {
                localStorage.setItem("AuthqueryParams", JSON.stringify(formatData));
                Cookies.set('isLoggedIn', 'true', { expires: 10 });
                window.location.href = "/";
                toast.success("Login successful");
            } else {
                toast.error("Invalid credentials");
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Login failed. Please try again.");
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
                                    name="companycode"
                                    fullWidth
                                    placeholder="Enter project code"
                                    value={credentials.companycode}
                                    onChange={handleChange}
                                    error={!!errors.companycode}
                                    helperText={errors.companycode}
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
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSubmit(e);
                                        }
                                    }}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    {...commonTextFieldProps}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            setShowPassword((prev) => !prev);
                                                        }
                                                    }}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    tabIndex={0}
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