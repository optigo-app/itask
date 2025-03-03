import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Box, useMediaQuery } from '@mui/material';
import Sidebar from './Components/NavSidebar/Sidebar';
import Header from './Components/Header/Header';
import Home from './Pages/Home/Home';
import Inbox from './Pages/Inbox/Inbox';
import Calendar from './Pages/Calendar/CalendarPage';
import Meeting from './Pages/Meeting/Meeting';
import Task from './Pages/Task/Task';
import Project from './Pages/Project/Project';
import Masters from './Pages/Master/Masters';
import { taskInit } from './Api/InitialApi/TaskInitApi';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskDetails from './Components/Task/TaskDetails/TaskDetails';
import PagenotFound from './Pages/404Page/PagenotFound';
import MetaDataSet from './Utils/MetaData/MetaDataSet';
import Profile from './Pages/ProfilePage/Profile';
import LoginForm from './Components/Auth/LoginForm';
import { fetchMasterGlFunc } from './Utils/globalfun';
import UnassignedTaskList from './Pages/Task/UnAssignedTask/UnassignedTaskList';
import CommentBox from './DemoCode/TaskGrid';
import TaskGrid from './DemoCode/TaskGrid';
import TaskTimeTracker from './DemoCode/TaskTimeTracker';

const Layout = ({ children }) => {
    const isMobile = useMediaQuery('(max-width:768px)');
    const location = useLocation();
    const hideLayout = location?.pathname?.includes('/login');

    return (
        <Box sx={{ display: isMobile ? 'block' : 'flex', overflow: "hidden" }}>
            {!hideLayout && <Sidebar />}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '10px 20px', position: 'relative', width: isMobile ? '90%' : '80%' }}>
                {!hideLayout && <Header />}
                <MetaDataSet />
                {children}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '25px',
                        right: '-50px',
                        transform: 'rotate(45deg)',
                        backgroundColor: '#8B0000',
                        color: 'white',
                        padding: '5px 40px',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        zIndex: 1,
                    }}
                >
                    Prototype
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
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("isLoggedIn") === "true"
    );

    useEffect(() => {
        const checkAndInit = async () => {
            const token = sessionStorage.getItem("taskInit");
            if (!token) {
                const result = await taskInit();
                if (result?.Data?.rd) {
                    fetchMasterGlFunc();
                } else {
                    setTimeout(checkAndInit, 1000);
                }
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
        borderRadius: '8px',
        backgroundColor: '#fff',
        fontFamily: '"Public Sans", sans-serif',
        fontWeight: '500',
        fontSize: '15px',
        lineHeight: '19px',
        color: '#444050',
        boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
        minWidth: '0px',
        width: 'fit-content',
        padding: '0px 6px',
        border: 'none',
        borderLeft: '4px solid transparent',
        backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(45deg, #6a11cb, #2575fc)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box'
    };

    return (
        <>
            <ToastContainer
                toastStyle={toastStyle}
                hideProgressBar={true}
                position="top-right"
                closeButton={false}
                style={{ marginBottom: '40px' }}
            />
            <RecoilRoot>
                <Router>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker']} sx={{ paddingTop: '0' }}>
                            <Layout>
                                <Routes>
                                    <Route
                                        path="/login"
                                        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />}
                                    />
                                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                                    <Route path="/projects" element={<ProtectedRoute><Project /></ProtectedRoute>} />
                                    <Route path="/tasks/*" element={<ProtectedRoute><Task /></ProtectedRoute>} />
                                    <Route path="/tasks/unassigned" element={<ProtectedRoute><UnassignedTaskList /></ProtectedRoute>} />
                                    <Route path="/taskDetails" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
                                    <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                                    <Route path="/meetings" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
                                    <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                                    <Route path="/masters" element={<ProtectedRoute><Masters /></ProtectedRoute>} />
                                    <Route path="/account-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                    <Route path="*" element={<PagenotFound />} />




                                    {/* test */}
                                    <Route path="/test" element={<ProtectedRoute><TaskTimeTracker /></ProtectedRoute>} />
                                </Routes>
                            </Layout>
                        </DemoContainer>
                    </LocalizationProvider>
                </Router>
            </RecoilRoot>
        </>
    );
};

export default App;
