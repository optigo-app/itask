import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";

const StatusCircles = ({ task }) => {
    const estimate1 = Number(task?.estimate_hrs) || 0;
    const estimate2 = Number(task?.estimate2_hrs) || 0;
    const difference = estimate2 - estimate1;
    const diffPercent = estimate1 > 0 ? ((difference / estimate1) * 100).toFixed(1) : 0;

    const circleStyle = {
        minWidth: 45,
        width: "fit-content",
        minHeight: 24,
        borderRadius: "8px",
        padding: "2px 8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
    };

    const displayText = estimate2 > 0
        ? `${Number.isInteger(estimate1) ? estimate1 : estimate1.toFixed(1)}/${Number.isInteger(estimate2) ? estimate2 : estimate2.toFixed(1)} hrs`
        : `${Number.isInteger(estimate1) ? estimate1 : estimate1.toFixed(1)} hrs`;

    const tooltipContent = (
        <Box sx={{ p: 1.5, minWidth: '180px', backgroundColor: '#fff' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', display: 'block', mb: 1, fontSize: '13px', color: '#333' }}>
                Estimate Details
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#555', fontSize: '12px' }}>
                    Sr. Estimate:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12px', color: '#333' }}>
                    {estimate2.toFixed(2)} hrs
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#555', fontSize: '12px' }}>
                    Estimate:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '12px', color: '#333' }}>
                    {estimate1.toFixed(2)} hrs
                </Typography>
            </Box>
            {estimate2 > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" sx={{ color: '#555', fontSize: '12px' }}>
                        Difference:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', color: difference > 0 ? '#f44336' : difference < 0 ? '#4caf50' : '#333' }}>
                        {difference > 0 ? '+' : ''}{difference.toFixed(2)} hrs
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Tooltip
            title={tooltipContent}
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        backgroundColor: '#fff',
                        color: '#333',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                },
                arrow: {
                    sx: {
                        color: '#fff',
                        '&::before': {
                            border: '1px solid #e0e0e0'
                        }
                    }
                }
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                }}
            >
                <Box
                    className="estimate-Box"
                    sx={{
                        ...circleStyle,
                        backgroundColor: '#D3D3D3',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: "12px",
                            color: "#444050 !important",
                            fontWeight: 500
                        }}
                    >
                        {displayText}
                    </Typography>
                </Box>
            </Box>
        </Tooltip>
    );
};

export default StatusCircles;