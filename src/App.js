import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, useMediaQuery } from '@mui/material';
import Sidebar from './Components/Sidebar/Sidebar';
import Header from './Components/Header/Header';
import Home from './Pages/Home/Home';
import Inbox from './Pages/Inbox/Inbox';
import Calendar from './Pages/Calendar/CalendarPage';
import Meeting from './Pages/Meeting/Meeting';
import Task from './Pages/Task/Task';
import Project from './Pages/Project/Project';
import Masters from './Pages/Master/Masters';
import { taskInit } from './Utils/TaskInitApi';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalContent from './Components/Task/ListView/TaskDetails';
import PaginatedTable from './Backup/demoTable';
import { fetchMasterGlFunc } from './Utils/globalfun';
import PagenotFound from './Pages/404Page/PagenotFound';


const App = () => {
    const isMobile = useMediaQuery('(max-width:768px)');

    // for init and master api
    useEffect(() => {
        const init = async () => {
            const result = await taskInit();
            if (result?.Data?.rd) {
                fetchMasterGlFunc();
            }
        };
        init();
    }, []);

    // for custome toast message
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
        width: 'fit-content !important',
        padding: '0px 6px !important',
        border: '2px solid transparent',
        backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(45deg, #6a11cb, #2575fc)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box'
    };
    

    return (
        <>
            <ToastContainer
                toastStyle={toastStyle}
                hideProgressBar="true"
                position="top-right"
                closeButton={false}
                style={{ marginBottom: '40px' }}
            />
            <RecoilRoot>
                <Router>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker']}>
                            <Box sx={{ display: isMobile ? 'block' : 'flex' }}>
                                <Sidebar />
                                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                                    <Header />
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/inbox" element={<Inbox />} />
                                        <Route path="/calendar" element={<Calendar />} />
                                        <Route path="/meeting" element={<Meeting />} />
                                        <Route path="/task" element={<Task />} />
                                        <Route path="/project" element={<Project />} />
                                        <Route path="/masters" element={<Masters />} />
                                        <Route path="/taskDetails" element={<ModalContent />} />
                                        <Route path="/pagination" element={<PaginatedTable />} />
                                        <Route path="*" element={<PagenotFound />} />
                                    </Routes>
                                </Box>
                            </Box>
                        </DemoContainer>
                    </LocalizationProvider>
                </Router>
            </RecoilRoot>
        </>
    );
};

export default App;
