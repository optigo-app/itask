import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { taskInit } from './Api/InitialApi/TaskInitApi';
import { fetchMasterGlFunc } from './Utils/globalfun';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBackdrop from './Utils/Common/LoadingBackdrop';
import Reports from './Pages/Reports/Reports';
import SomethingWentWrong from './Components/Auth/SomethingWentWrong';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import MuiSortableTable from './Backup/MuiSortableTable';
import NotificationPage from './Backup/NotificationPage';
import NotificationTable from './Pages/Notification/NotificationTable';
import FileUploadComp from './Backup/FileUploadComp';

// Lazy Loaded Components
const Sidebar = lazy(() => import('./Components/NavSidebar/Sidebar'));
const Header = lazy(() => import('./Components/Header/Header'));
const Home = lazy(() => import('./Pages/Home/Home'));
const Inbox = lazy(() => import('./Pages/Inbox/Inbox'));
const Calendar = lazy(() => import('./Pages/Calendar/CalendarPage'));
const Meeting = lazy(() => import('./Pages/Meeting/Meeting'));
const Task = lazy(() => import('./Pages/Task/Task'));
const Project = lazy(() => import('./Pages/Project/Project'));
const Masters = lazy(() => import('./Pages/Master/Masters'));
const TaskDetails = lazy(() => import('./Components/Task/TaskDetails/TaskDetails'));
const PagenotFound = lazy(() => import('./Pages/404Page/PagenotFound'));
const MetaDataSet = lazy(() => import('./Utils/MetaData/MetaDataSet'));
const Profile = lazy(() => import('./Pages/ProfilePage/Profile'));
const UnassignedTaskList = lazy(() => import('./Pages/Task/UnAssignedTask/UnassignedTaskList'));
const ProjectDashboard = lazy(() => import('./Pages/Project/ProjectDashboard'));

const Layout = ({ children }) => {
    const isMobile = useMediaQuery('(max-width:712px)');
    console.log('isMobile: ', isMobile);
    const location = useLocation();
    const hideLayout = location?.pathname?.includes('/login');

    return (
        <Box sx={{ display: 'flex', overflow: "auto" }}>
            {!hideLayout && <Suspense fallback={<LoadingBackdrop />}><Sidebar /></Suspense>}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: isMobile ? '20px 5px' : '10px 20px',
                position: 'relative',
                width: isMobile ? '97%' : '80%',
                overflow: "auto"
            }}>
                {!hideLayout && <Suspense fallback={<LoadingBackdrop />}><Header /></Suspense>}
                <Suspense fallback={<LoadingBackdrop />}><MetaDataSet /></Suspense>
                {children}
                <Box
                    sx={{
                        position: "fixed",
                        top: "25px",
                        right: "35px",
                        transform: "translateX(50%) rotate(45deg)",
                        background: "linear-gradient(to right, #ff7e5f, #feb47b)",
                        color: "white",
                        padding: "6px 40px",
                        fontWeight: "bold",
                        fontSize: "10px",
                        zIndex: 10,
                        whiteSpace: "nowrap",
                        boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
                    }}
                >
                    In Development
                </Box>
            </Box>
        </Box>
    );
};

const ProtectedRoute = ({ children }) => {
    const authData = JSON.parse(localStorage.getItem("AuthqueryParams"));
    const isLoggedIn = authData?.yc !== '' && authData?.yc !== null && authData?.yc !== undefined;
    return isLoggedIn ? children : <Navigate to="/error_401" replace />;
};

const App = () => {
    const [isReady, setIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const getQueryParams = () => {
        const token = Cookies.get('skey');
        if (!token) {
            return <Navigate to="/error_401" replace />;
        }

        // Decode without verifying signature
        const decoded = jwtDecode(token);
        const decodedPayload = {
            ...decoded,
            uid: decodeBase64(decoded.uid),
        };

        if (decodedPayload) {
            localStorage.setItem("AuthqueryParams", JSON.stringify(decodedPayload));
        }

        return decodedPayload;
    };

    const decodeBase64 = (str) => {
        if (!str) return null;
        try {
            return atob(str);
        } catch (e) {
            console.error("Error decoding base64:", e);
            return null;
        }
    };

    useEffect(() => {
        const params = getQueryParams();
        const authData = params?.yc || JSON?.parse(localStorage.getItem("AuthqueryParams"))?.yc;
        const isLoggedIn = authData !== '' && authData !== null && authData !== undefined;
        setIsAuthenticated(isLoggedIn);
        setIsReady(true);
    }, []);

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 5;

        const checkAndInit = async () => {
            if (retryCount >= maxRetries) return console.log("Api call failed after 5 retries");

            const token = JSON?.parse(localStorage.getItem("token"));
            let result;
            if (!token) {
                result = await taskInit();
            }
            if (result?.Data?.rd || token) {
                fetchMasterGlFunc();
            } else {
                retryCount++;
                setTimeout(checkAndInit, 1000);
            }
        };

        checkAndInit();
    }, []);

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(localStorage.getItem("isLoggedIn") === "true");
        };
        window.addEventListener("storage", handleAuthChange);
        return () => window.removeEventListener("storage", handleAuthChange);
    }, []);

    const toastStyle = {
        borderRadius: "8px",
        backgroundColor: "#fff",
        fontFamily: '"Public Sans", sans-serif',
        fontWeight: 500,
        fontSize: "15px",
        lineHeight: "19px",
        color: "#444050",
        boxShadow: "rgba(100,100,111,0.2) 0px 7px 29px 0px",
        minWidth: "auto",
        width: "fit-content",
        padding: "0px 6px",
        border: "none",
        borderLeft: "4px solid transparent",
        backgroundImage: "linear-gradient(#fff, #fff), linear-gradient(45deg, #6a11cb, #2575fc)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
    };

    if (!isReady) {
        return <LoadingBackdrop />;
    }
    return (
        <>
            <ToastContainer
                toastStyle={toastStyle}
                hideProgressBar={true}
                position="bottom-right"
                closeButton={false}
                autoClose={2000}
            />
            <RecoilRoot>
                <Router>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><LoadingBackdrop /></Box>}>
                            <Routes>
                                <Route path="/error_401" element={isAuthenticated ? <Navigate to="/" replace /> : <SomethingWentWrong />} />
                                <Route
                                    path="*"
                                    element={
                                        <Layout>
                                            <Routes>
                                                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                                                <Route path="/projects" element={<ProtectedRoute><Project /></ProtectedRoute>} />
                                                <Route path="/projects/Dashboard" element={<ProtectedRoute><ProjectDashboard /></ProtectedRoute>} />
                                                <Route path="/tasks/*" element={<ProtectedRoute><Task /></ProtectedRoute>} />
                                                <Route path="/tasks/unassigned" element={<ProtectedRoute><UnassignedTaskList /></ProtectedRoute>} />
                                                <Route path="/taskDetails" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
                                                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                                                <Route path="/meetings" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
                                                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                                                <Route path="/masters" element={<ProtectedRoute><Masters /></ProtectedRoute>} />
                                                <Route path="/account-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                                <Route path="/reports/*" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                                                <Route path="/notification" element={<NotificationTable />} />                  
                                                <Route path="/test" element={<FileUploadComp />} />
                                                <Route path="*" element={<PagenotFound />} />
                                            </Routes>
                                        </Layout>
                                    }
                                />
                            </Routes>
                        </Suspense>
                    </LocalizationProvider>
                </Router>
            </RecoilRoot>
        </>
    );
};

export default App;
