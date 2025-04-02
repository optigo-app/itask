import React, { useState } from "react";
import { Button } from "@mui/material";
import CustomMenu from "./CustomMenuFun";

const StatusBadge = ({ task, statusColors, onStatusChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const statusMaster = JSON.parse(sessionStorage.getItem("taskstatusData")) || {};

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (status) => {
        setAnchorEl(null);
        if (status) {
            console.log("Selected Status:", status);
            onStatusChange(task, status);   
        }
    };

    return (
        <>
            <Button
                onClick={handleClick}
                style={{
                    color: (statusColors[(task?.status)?.toLowerCase()]?.color) ?? "#7d7f85",
                    backgroundColor: (statusColors[(task?.status)?.toLowerCase()]?.backgroundColor) ?? "#7d7f8559",
                    width: "fit-content",
                    padding: "0.2rem 0.8rem",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: "13.5px",
                    fontWeight: "500",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    border: anchorEl ? "1px solid #444050" : "none",
                }}
            >
                {task?.status != "" ? task?.status : '-'}
            </Button>
            <CustomMenu
                anchorEl={anchorEl}
                handleClose={handleClose}
                statusMaster={statusMaster}
            />
        </>
    );
};

export default StatusBadge;
