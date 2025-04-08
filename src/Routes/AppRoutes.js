// src/Routes/AppRoutes.js
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingBackdrop from '../Utils/Common/LoadingBackdrop';
import ProtectedRoute from './ProtectedRoute'; // Create this as shown below
import Layout from './Layout'; // We'll extract your Layout too
import SomethingWentWrong from '../Components/Auth/SomethingWentWrong';
import PagenotFound from '../Pages/404Page/PagenotFound';

// Lazy-loaded Pages
const Home = lazy(() => import('../Pages/Home/Home'));
const Project = lazy(() => import('../Pages/Project/Project'));
const ProjectDashboard = lazy(() => import('../Pages/Project/ProjectDashboard'));
const Task = lazy(() => import('../Pages/Task/Task'));
const UnassignedTaskList = lazy(() => import('../Pages/Task/UnAssignedTask/UnassignedTaskList'));
const TaskDetails = lazy(() => import('../Components/Task/TaskDetails/TaskDetails'));
const Calendar = lazy(() => import('../Pages/Calendar/CalendarPage'));
const Meeting = lazy(() => import('../Pages/Meeting/Meeting'));
const Inbox = lazy(() => import('../Pages/Inbox/Inbox'));
const Masters = lazy(() => import('../Pages/Master/Masters'));
const Profile = lazy(() => import('../Pages/ProfilePage/Profile'));
const Reports = lazy(() => import('../Pages/Reports/Reports'));
const MilestoneTimeline = lazy(() => import('../Components/Project/Dashboard/MilestoneTimeline'));
const DatePickerWithIST = lazy(() => import('../Backup/DatePickerWithIST'));

const AppRoutes = ({ isAuthenticated }) => {
    return (
        <Suspense fallback={<LoadingBackdrop />}>
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
                                <Route path="/test" element={<ProtectedRoute><MilestoneTimeline /></ProtectedRoute>} />
                                <Route path="/test1" element={<ProtectedRoute><DatePickerWithIST /></ProtectedRoute>} />
                                <Route path="*" element={<PagenotFound />} />
                            </Routes>
                        </Layout>
                    }
                />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
