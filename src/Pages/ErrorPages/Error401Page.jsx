import React from 'react';
import { Box, Typography } from '@mui/material';
import Image401 from '../../Assests/error_401.webp';
import './Styles/ErrorPage.scss';

const Error401Page = () => {

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
      </Box>
    </Box>
  );
};

export default Error401Page;
