// AppRoutes.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from './Layout';
import LoadingBackdrop from '../Utils/Common/LoadingBackdrop';
import SomethingWentWrong from '../Components/Auth/SomethingWentWrong';
import Error401Page from '../Pages/ErrorPages/Error401Page';
import NotificationTable from '../Pages/Notification/NotificationTable';

// Lazy loaded pages
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
const PagenotFound = lazy(() => import('../Pages/404Page/PagenotFound'));

const AppRoutes = () => (
    <Suspense fallback={<LoadingBackdrop />}>
        <Routes>
            <Route path="/error_401" element={<SomethingWentWrong />} />
            <Route path="/error401" element={<Error401Page />} />

            <Route element={<Layout />}>
                <Route path="/" element={<ProtectedRoute pageId="-1001"><Home /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute pageId="-1003"><Project /></ProtectedRoute>} />
                <Route path="/projects/Dashboard" element={<ProtectedRoute pageId="-1003"><ProjectDashboard /></ProtectedRoute>} />
                <Route path="/tasks/*" element={<ProtectedRoute pageId="-1002"><Task /></ProtectedRoute>} />
                <Route path="/tasks/unassigned" element={<ProtectedRoute pageId="-1002"><UnassignedTaskList /></ProtectedRoute>} />
                <Route path="/taskDetails" element={<ProtectedRoute pageId="-1002"><TaskDetails /></ProtectedRoute>} />
                <Route path="/myCalendar" element={<ProtectedRoute pageId="-1006"><Calendar /></ProtectedRoute>} />
                <Route path="/meetings" element={<ProtectedRoute pageId="-1005"><Meeting /></ProtectedRoute>} />
                <Route path="/inbox" element={<ProtectedRoute pageId="-1004"><Inbox /></ProtectedRoute>} />
                <Route path="/masters" element={<ProtectedRoute pageId="-1007"><Masters /></ProtectedRoute>} />
                <Route path="/account-profile" element={<ProtectedRoute pageId=""><Profile /></ProtectedRoute>} />
                <Route path="/reports/*" element={<ProtectedRoute pageId="-1008"><Reports /></ProtectedRoute>} />
                <Route path="/notification" element={<NotificationTable />} />
                <Route path="*" element={<PagenotFound />} />
            </Route>
        </Routes>

    </Suspense>
);

export default AppRoutes;
