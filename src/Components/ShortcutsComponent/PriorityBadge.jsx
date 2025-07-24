import React, { useState } from "react";
import { Button } from "@mui/material";
import CustomMenu from "./CustomMenuFun";

const PriorityBadge = ({ task, priorityColors, onPriorityChange, fontSize, padding, minWidth, disable }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const priorityMaster = JSON.parse(sessionStorage.getItem("taskpriorityData")) || {};

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (status) => {
        setAnchorEl(null);
        if (status) {
            onPriorityChange(task, status);
        }
    };

    return (
        <>
            <Button
                onClick={handleClick}
                style={{
                    color: (priorityColors[(task?.priority)?.toLowerCase()]?.color) ?? "#7d7f85",
                    backgroundColor: (priorityColors[(task?.priority)?.toLowerCase()]?.backgroundColor) ?? "#7d7f8559",
                    fontFamily: '"Public Sans", sans-serif',
                    width: "fit-content",
                    minWidth: minWidth ?? "inherit",
                    padding: padding ?? "0.2rem 0.8rem",
                    borderRadius: "5px",
                    textAlign: "center",
                    fontSize: fontSize ?? "13.5px",
                    fontWeight: "500",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textTransform: "capitalize",
                    border: anchorEl ? "1px solid #444050" : "none",
                    pointerEvents: disable ? "none" : "auto",
                }}
                className="status-badge"
            >
                {task?.priority != "" ? task?.priority : '-'}
            </Button>
            <CustomMenu
                anchorEl={anchorEl}
                handleClose={handleClose}
                statusMaster={priorityMaster}
            />
        </>
    );
};

export default PriorityBadge;
