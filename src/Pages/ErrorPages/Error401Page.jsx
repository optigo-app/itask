import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Image401 from '../../Assests/error_401.webp';
import './Styles/ErrorPage.scss';

const Error401Page = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box className="error-page-container">
      <Box className="error-page-content">
        <img
          src={Image401}
          alt="401 Unauthorized"
          className="error-image"
        />
        <Typography variant="h4" className="error-title">
          401 - Unauthorized Access
        </Typography>
        <Typography variant="body1" className="error-message">
          You do not have permission to view any page. Please contact your administrator.
        </Typography>
        <Button variant="contained" className="buttonClassname" onClick={handleGoBack}>
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default Error401Page;
