import React, { useState } from "react";
import { Button } from "@mui/material";
import CustomMenu from "./CustomMenuFun";

const StatusBadge = ({ task, statusColors, onStatusChange, fontSize, padding, minWidth, disable, flag }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const statusMaster = flag === "secondaryStatus" ? JSON.parse(sessionStorage.getItem("tasksecstatusData")) || {} : JSON.parse(sessionStorage.getItem("taskstatusData")) || {};

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (status) => {
        setAnchorEl(null);
        if (status) {
            onStatusChange(task, status, flag);
        }
    };

    const statusKey = flag === "secondaryStatus" ? task?.secStatus : task?.status;
    const normalizedKey = (statusKey || "").toLowerCase();
    const colorConfig = statusColors[normalizedKey] || {};
    const displayStatus = statusKey?.trim() ? statusKey : "-";

    return (
        <>
            <Button
                onClick={handleClick}
                style={{
                    color: colorConfig.color ?? "#7d7f85",
                    backgroundColor: colorConfig.backgroundColor ?? "#7d7f8559",
                    fontFamily: '"Public Sans", sans-serif',
                    minWidth: minWidth ?? "inherit",
                    maxWidth: "120px",
                    padding: padding ?? "0.2rem 0.4rem",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: fontSize ?? "13px",
                    fontWeight: "500",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    textTransform: "capitalize",
                    border: anchorEl ? "1px solid #444050" : "none",
                    pointerEvents: disable ? "none" : "auto",
                }}
                className="status-badge"
                title={displayStatus}
            >
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        maxWidth: "100%",
                    }}
                >
                    {displayStatus}
                </span>
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
