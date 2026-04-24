import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * A wrapper component that only allows access if the user is an admin.
 * Otherwise, it redirects to the home page or shows nothing.
 */
const ProtectedRoute = ({ children }) => {
    const { userRole, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (userRole !== 'admin') {
        // If not an admin, redirect to home page
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
