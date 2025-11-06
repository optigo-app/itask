import { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Paper,
    useMediaQuery,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel
} from "@mui/material";
import loginImage from "../../Assests/loginImage.webp";
import { commonTextFieldProps } from "../../Utils/globalfun";
import Cookies from 'js-cookie';
import { fetchLoginApi } from "../../Api/AuthApi/loginApi";
import { GetTokenByCompanyCodeApi } from "../../Api/InitialApi/GetTokenByCompanyCodeApi";
import { z } from "zod";
import "./LoginPage.scss";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
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
    const [companyValidation, setCompanyValidation] = useState({ isValid: false, isChecking: false, message: "" });
    const [rememberMe, setRememberMe] = useState(false);

    const isFormDisabled = companyValidation.message && !companyValidation.isValid && credentials.companycode.trim();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        setErrors(prev => ({ ...prev, [name]: "" }));
        if (name === "companycode") {
            setCompanyValidation({ isValid: false, isChecking: false, message: "" });
        }
    };

    const validateCompanyCode = async () => {
        if (!credentials.companycode.trim()) {
            setCompanyValidation({ isValid: false, isChecking: false, message: "" });
            return;
        }
        setCompanyValidation({ isValid: false, isChecking: true, message: "" });
        try {
            const response = await GetTokenByCompanyCodeApi({ companycode: credentials.companycode });
            if (response?.rd && response.rd.length > 0) {
                const result = response.rd[0];

                if (result.stat === 1) {
                    setCompanyValidation({ isValid: true, isChecking: false, message: "" });
                } else {
                    setCompanyValidation({
                        isValid: false,
                        isChecking: false,
                        message: result.stat_msg || "Invalid company code"
                    });
                }
            } else {
                setCompanyValidation({
                    isValid: false,
                    isChecking: false,
                    message: "Invalid company code"
                });
            }
        } catch (error) {
            console.error("Company validation error:", error);
            setCompanyValidation({
                isValid: false,
                isChecking: false,
                message: "Validation failed"
            });
        }
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
                if (rememberMe) {
                    localStorage.setItem("AuthqueryParams", JSON.stringify(formatData));
                } else {
                    sessionStorage.setItem("AuthqueryParams", JSON.stringify(formatData));
                }
                
                const cookieExpiry = rememberMe ? { expires: formatData.exp } : {};
                Cookies.set('isLoggedIn', 'true', cookieExpiry);
                
                if(process.env.REACT_APP_LOCAL_HOSTNAMES.includes(window.location.hostname)) {
                    window.location.href = "/itaskweb";
                }else{
                    window.location.href = "/";
                }
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
                    <div className="login-form-section">
                        <div className="login-form-content">
                            <Typography variant="h5" className="login-title">LOGIN</Typography>
                            <Typography variant="body2" className="login-subtitle">
                                How to get started task
                            </Typography>
                            <div className="form-group">
                                <Typography variant="subtitle1" className="field-label">
                                    Company Code
                                </Typography>
                                <TextField
                                    name="companycode"
                                    fullWidth
                                    placeholder="Enter project code"
                                    value={credentials.companycode}
                                    onChange={handleChange}
                                    onBlur={validateCompanyCode}
                                    error={!!errors.companycode || (!!companyValidation.message && !companyValidation.isValid)}
                                    helperText={errors.companycode || (companyValidation.message && !companyValidation.isValid ? companyValidation.message : "")}
                                    {...commonTextFieldProps}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {companyValidation.isChecking ? (
                                                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #f3f3f3', borderTop: '2px solid #3498db', borderRadius: '50%' }}></div>
                                                ) : companyValidation.isValid ? (
                                                    <CheckCircle size={20} color="#22c55e" />
                                                ) : companyValidation.message ? (
                                                    <XCircle size={20} color="#ef4444" />
                                                ) : null}
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>

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
                                    disabled={isFormDisabled}
                                    error={!!errors.userId}
                                    helperText={errors.userId}
                                    {...commonTextFieldProps}
                                />
                            </div>
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
                                    disabled={isFormDisabled}
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
                                                    disabled={isFormDisabled}
                                                >
                                                    {showPassword ? <EyeOff width={20} height={20} /> : <Eye width={20} height={20} />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                            </div>

                            <div className="remember-me-container">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            color="primary"
                                            disabled={isFormDisabled}
                                        />
                                    }
                                    label="Remember me"
                                />
                            </div>

                            <div className="login-button-container">
                                <Button
                                    variant="contained"
                                    className="buttonClassname login-button"
                                    onClick={handleSubmit}
                                    disabled={isFormDisabled}
                                >
                                    Login Now
                                </Button>
                            </div>
                        </div>
                    </div>

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