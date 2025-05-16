import React from "react";
import { Box, Typography } from "@mui/material";

const StatusCircles = ({ task }) => {
    const taskEstimate = [task.estimate_hrsT, task.estimate1_hrsT, task.estimate2_hrsT];
    const circleStyle = {
        minWidth: 28,
        minHeight: 28,
        borderRadius: "50%",
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
                        <Typography variant="caption" sx={{ fontSize: "11px", color: index == 0 ? "#333 !important" : "#fff !important" }}>
                            {estimate}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

export default StatusCircles;
