// ProtectRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, pageId }) => {
    const accessData = JSON.parse(sessionStorage.getItem("pageAccess"));
    const userPages = accessData?.map((item) => item.id.toString());
    const hasAccess = userPages?.includes(pageId.toString());

    return hasAccess ? children : <Navigate to="/error401" replace />;
};

export default ProtectedRoute;
