import React, { useEffect, useState, lazy, Suspense } from 'react';
import "./App.scss";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";
import { Box, useMediaQuery } from '@mui/material';
import { RecoilRoot, useRecoilState, useSetRecoilState } from 'recoil';
import { ToastContainer } from 'react-toastify';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { taskInit } from './Api/InitialApi/TaskInitApi';
import { fetchMasterGlFunc } from './Utils/globalfun';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBackdrop from './Utils/Common/LoadingBackdrop';
import Reports from './Pages/Reports/Reports';
import { jwtDecode } from "jwt-decode";
import Cookies from 'js-cookie';
import NotificationTable from './Pages/Notification/NotificationTable';
import { userRoleAtom, webReload } from './Recoil/atom';
import TaskTreeGrid from './Backup/TaskTreeGrid';

// Lazy Components
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
const Error401Page = lazy(() => import('./Pages/ErrorPages/Error401Page'));

const Layout = ({ children, pageDataLoaded }) => {
    const isMobile = useMediaQuery('(max-width:712px)');

    return (
        <Box sx={{ display: 'flex', overflow: "auto" }}>
            {!pageDataLoaded && <Suspense fallback={<LoadingBackdrop />}><Sidebar /></Suspense>}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: isMobile ? '20px 5px' : '10px 20px',
                position: 'relative',
                width: isMobile ? '97%' : '80%',
                overflow: "auto"
            }}>
                {!pageDataLoaded && <Suspense fallback={<LoadingBackdrop />}><Header /></Suspense>}
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

const ProtectedRoute = ({ children, pageId, pageData, pageDataLoaded }) => {
    if (pageDataLoaded && pageData?.length != 0) {
        const userPages = pageData?.map((item) => item.id.toString());
        const hasAccess = userPages?.includes(pageId.toString());
        return hasAccess ? children : <Navigate to="/error401" replace />;
    }
};

const AppWrapper = () => {
    const [reload, setReload] = useRecoilState(webReload);
    const [pageData, setPageData] = useState([]);
    const [pageDataLoaded, setPageDataLoaded] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [cookieData, setCookieData] = useState(null);
    const navigate = useNavigate();
    const setRole = useSetRecoilState(userRoleAtom);

    useEffect(() => {
        let timeout;
        const handleRefetch = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                getQueryParams();
            }, 100);
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleRefetch();
            }
        };
        const handleFocus = () => {
            handleRefetch();
        };
        getQueryParams();
        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);


    const decodeBase64 = (str) => {
        if (!str) return null;
        try {
            return atob(str);
        } catch (e) {
            console.error("Error decoding base64:", e);
            return null;
        }
    };

    const getQueryParams = () => {
        const token = Cookies.get('skey');
        if (!token) {
            localStorage.clear();
            sessionStorage.clear();
            setIsReady(true);
            setPageDataLoaded(true);
            return navigate('/error401', { replace: true });
        }

        const decoded = jwtDecode(token);
        const decodedPayload = {
            ...decoded,
            uid: decodeBase64(decoded.uid),
        };

        if (decodedPayload) {
            setCookieData(decodedPayload);
            localStorage.setItem("AuthqueryParams", JSON.stringify(decodedPayload));
            setIsReady(true);
        }

        return decodedPayload;
    };

    useEffect(() => {
        const masterFuncCall = async () => {
            if (reload) {
                sessionStorage.clear();
                localStorage.clear();
                window.location.reload();
                const roleData = await fetchMasterGlFunc();
                setRole(roleData?.designation);
                setReload(false);

            }
        }
        masterFuncCall();
    }, [reload]);

    useEffect(() => {
        const checkAndInit = async () => {
            const taskInitToken = sessionStorage.getItem("taskInit");
            let roleData;

            if (!taskInitToken) {
                const result = await taskInit();
                if (result?.Data?.rd1) {
                    setPageData(result.Data.rd1);
                    setPageDataLoaded(true);
                }
            } else {
                const pageData = JSON.parse(sessionStorage.getItem("pageAccess"));
                if (pageData) {
                    setPageData(pageData);
                    setPageDataLoaded(true);
                }
            }
            roleData = await fetchMasterGlFunc();
            setRole(roleData?.designation);
        };

        if (cookieData) {
            checkAndInit();
        }
    }, [isReady]);


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

    if (!isReady || !pageDataLoaded) {
        return <LoadingBackdrop isLoading={true} />;
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><LoadingBackdrop /></Box>}>
                    <Routes>
                        <Route path="/error401" element={<Error401Page />} />
                        <Route path="/test" element={<TaskTreeGrid />} />
                        <Route
                            path="*"
                            element={
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/projects" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1003"><Project /></ProtectedRoute>} />
                                        <Route path="/projects/Dashboard" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1003"><ProjectDashboard /></ProtectedRoute>} />
                                        <Route path="/tasks/*" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1002"><Task /></ProtectedRoute>} />
                                        <Route path="/tasks/unassigned" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1002"><UnassignedTaskList /></ProtectedRoute>} />
                                        <Route path="/taskDetails" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1002"><TaskDetails /></ProtectedRoute>} />
                                        <Route path="/calendar" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1006"><Calendar /></ProtectedRoute>} />
                                        <Route path="/meetings" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1005"><Meeting /></ProtectedRoute>} />
                                        <Route path="/inbox" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1004"><Inbox /></ProtectedRoute>} />
                                        <Route path="/masters" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1007"><Masters /></ProtectedRoute>} />
                                        <Route path="/account-profile" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId=""><Profile /></ProtectedRoute>} />
                                        <Route path="/reports/*" element={<ProtectedRoute pageData={pageData} pageDataLoaded={pageDataLoaded} pageId="-1008"><Reports /></ProtectedRoute>} />
                                        <Route path="/notification" element={<NotificationTable />} />
                                        <Route path="*" element={<PagenotFound />} />
                                    </Routes>
                                </Layout>
                            }
                        />
                    </Routes>
                </Suspense>
            </LocalizationProvider>
        </>
    );
};

const App = () => (
    <RecoilRoot>
        {/* <Router basename="/itaskweb"> */}
        <Router>
            <AppWrapper />
        </Router>
    </RecoilRoot>
);

export default App;
