import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Box, useMediaQuery } from '@mui/material';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { taskInit } from './Api/InitialApi/TaskInitApi';
import { fetchMasterGlFunc } from './Utils/globalfun';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBackdrop from './Utils/Common/LoadingBackdrop';
import Reports from './Pages/Reports/Reports';
import ProjectDashboard from './Pages/Project/ProjectDashboard';
import MilestoneTimeline from './Components/Project/Dashboard/MilestoneTimeline';
import ReferencePr from './Components/Project/Dashboard/ReferencePr';
import EditableTimer from './Backup/EditableTimer';
import TreeDataGrid from './Backup/TreeDataGrid';
import NotificationComponent from './Backup/NotificationComponent';
import PinnableTable from './Backup/TreeDataGrid';
import TableGrid from './Backup/TableGrid';

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
const LoginForm = lazy(() => import('./Components/Auth/LoginForm'));
const UnassignedTaskList = lazy(() => import('./Pages/Task/UnAssignedTask/UnassignedTaskList'));

const Layout = ({ children }) => {
    const isMobile = useMediaQuery('(max-width:768px)');
    const location = useLocation();
    const hideLayout = location?.pathname?.includes('/login');

    return (
        <Box sx={{ display: isMobile ? 'block' : 'flex', overflow: "hidden" }}>
            {!hideLayout && <Suspense fallback={<LoadingBackdrop />}><Sidebar /></Suspense>}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '10px 20px', position: 'relative', width: isMobile ? '90%' : '80%' }}>
                {!hideLayout && <Suspense fallback={<LoadingBackdrop />}><Header /></Suspense>}
                <Suspense fallback={<LoadingBackdrop />}><MetaDataSet /></Suspense>
                {children}
                <Box
                    sx={{
                        position: "fixed",
                        top: "30px",
                        right: "40px",
                        transform: "translateX(50%) rotate(45deg)",
                        background: "linear-gradient(to right, #ff7e5f, #feb47b)",
                        color: "white",
                        padding: "6px 40px",
                        fontWeight: "bold",
                        fontSize: "14px",
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
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("isLoggedIn") === "true");


    const getQueryParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
      
        return {
          yc: urlParams.get("yc"),
          uid: urlParams.get("uid"),
          sv: urlParams.get("sv"),
          ifid: urlParams.get("ifid"),
          pid: urlParams.get("pid"),
        };
      };
      
      // Example usage
      const queryParams = getQueryParams();
      console.log("Query Parameters:", queryParams);
      
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
                            <Layout>
                                <Routes>
                                    <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />} />
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
                                    <Route path="*" element={<PagenotFound />} />
                                    <Route path="/test" element={<ProtectedRoute><MilestoneTimeline /></ProtectedRoute>} />
                                    <Route path="/test1" element={<ProtectedRoute><TableGrid  /></ProtectedRoute>} />
                                </Routes>
                            </Layout>
                        </Suspense>
                    </LocalizationProvider>
                </Router>
            </RecoilRoot>
        </>
    );
};

export default App;
