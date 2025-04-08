import React, { Suspense } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';
import LoadingBackdrop from '../Utils/Common/LoadingBackdrop';
const Sidebar = React.lazy(() => import('../Components/NavSidebar/Sidebar'));
const Header = React.lazy(() => import('../Components/Header/Header'));
const MetaDataSet = React.lazy(() => import('../Utils/MetaData/MetaDataSet'));

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

export default Layout;
