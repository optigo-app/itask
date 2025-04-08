import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const authData = JSON.parse(localStorage.getItem("AuthqueryParams"));
    const isLoggedIn = authData?.yc !== '' && authData?.yc !== null && authData?.yc !== undefined;
    return isLoggedIn ? children : <Navigate to="/error_401" replace />;
};

export default ProtectedRoute;
