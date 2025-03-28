import React, { useState } from "react";
import { Menu, MenuItem, Button, Typography } from "@mui/material";

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
                    color: statusColors[task?.status]?.color ?? "#fff",
                    backgroundColor: statusColors[task?.status]?.backgroundColor ?? "#7d7f85a1",
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
                {task?.status}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => handleClose(null)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "8px !important",
                            boxShadow:
                                "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                            '& ".MuiList-root': {
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important",
                            },
                        },
                    },
                }}
            >
                {statusMaster?.map((status) => (
                    <MenuItem
                        key={status?.id}
                        onClick={() => handleClose(status)}
                        sx={{
                            margin: "5px 10px !important",
                            borderRadius: "8px !important",
                            "&:hover": {
                                backgroundColor: "#f0f0f0 !important",
                                borderRadius: "8px !important",
                            },
                        }}
                    >
                        <Typography variant="body2">{status?.labelname}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default StatusBadge;
