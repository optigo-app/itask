import React from 'react';
import { Link } from 'react-router-dom';
import './PagenotFound.scss';

const PagenotFound = () => {
    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404</h1>
            <h2 className="not-found-subtitle">Oops! Page Not Found</h2>
            <p className="not-found-text">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="not-found-link">
               Home
            </Link>
        </div>
    );
};

export default PagenotFound;
