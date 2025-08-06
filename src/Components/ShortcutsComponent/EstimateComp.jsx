import React from "react";
import { Box, Typography } from "@mui/material";

const StatusCircles = ({ task }) => {
    const taskEstimate = [task.estimate_hrsT];
    const circleStyle = {
        minWidth: 38,
        width: 'fit-content',
        minHeight: 24,
        borderRadius: "8px",
        padding: '2px 6px',
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginRight: "1px",
        marginLeft: "1px",
        cursor: "pointer",
        boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset",
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
            {taskEstimate?.map((estimate, index) => {
                const colors = ["#D3D3D3", "#808080bf", "#404040b8"];
                return (
                    <Box className="estimate-Box" key={index} sx={{ ...circleStyle, backgroundColor: colors[index] }}>
                        <Typography variant="caption" sx={{ fontSize: "12px", color: index == 0 ? "#333 !important" : "#fff !important" }}>
                            {estimate ? (parseFloat(estimate) % 1 === 0 ? estimate : estimate.toFixed(2)) : "0"} hrs

                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

export default StatusCircles;
