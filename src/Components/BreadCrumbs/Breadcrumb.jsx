import React from "react";
import './Breadcrumb.scss';
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

const Breadcrumb = ({ breadcrumbTitles = [] }) => {
  return (
    <Box className="breadcrumb">
      {breadcrumbTitles.length > 0 && (
        <Box component="span" className="separator">/</Box>
      )}

      {breadcrumbTitles.map((title, index) => {
        const isLast = index === breadcrumbTitles.length - 1;

        return (
          <React.Fragment key={index}>
            <Tooltip
              title={title}
              placement="top"
              arrow
              classes={{ tooltip: "custom-tooltip" }}
            >
              <Box
                component="span"
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                sx={{
                  width:
                    breadcrumbTitles.length > 3
                      ? 80
                      : breadcrumbTitles.length > 2
                        ? 100
                        : 'auto'
                }}
              >
                {title}
              </Box>
            </Tooltip>
            {!isLast && (
              <Box component="span" className="separator">/</Box>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default Breadcrumb;
