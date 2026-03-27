import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-icon-wrapper">
                    <FiAlertTriangle className="error-icon" />
                    <span className="error-code">404</span>
                </div>

                <h1 className="not-found-title">Oops! Page Lost in Search</h1>
                <p className="not-found-text">
                    The requested URL was not found on this server. It might have been moved,
                    deleted, or never existed in the first place.
                </p>

                <div className="not-found-actions">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="home-btn"
                        title="Return to Dashboard"
                    >
                        <FiHome /> Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="go-back-link"
                    >
                        Go to Previous Page
                    </button>
                </div>
            </div>

            {/* Background elements for aesthetic depth */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
        </div>
    );
};

export default NotFound;
