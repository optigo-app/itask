import React, { useState } from "react";
import { Button } from "@mui/material";
import CustomMenu from "./CustomMenuFun";
import { getDynamicPriorityColor, cachedMaster } from "../../Utils/globalfun";

const PriorityBadge = ({ task, priorityColors, onPriorityChange, fontSize, padding, minWidth, disable }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const priorityMaster = cachedMaster("taskpriorityData").data || {};
    const masterList = Array.isArray(priorityMaster) ? priorityMaster : (priorityMaster?.data || []);
    // task.priority may hold an id or be missing — resolve the label via priorityid
    const priorityLabel = (priorityColors[(task?.priority || '').toLowerCase().trim()]
        ? task?.priority
        : (masterList?.find?.((m) => String(m?.id) === String(task?.priorityid))?.labelname || task?.priority)) || '';
    const lookup = priorityLabel.toLowerCase().trim();
    // API-persisted colorkey first; passed map stays the fallback
    const apiColor = getDynamicPriorityColor(priorityLabel, task?.colorkey);

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
                    color: apiColor?.color ?? (priorityColors[lookup]?.color) ?? "#7d7f85",
                    backgroundColor: apiColor?.backgroundColor ?? (priorityColors[lookup]?.backgroundColor) ?? "#7d7f8559",
                    fontFamily: '"Public Sans", sans-serif',
                    width: "fit-content",
                    minWidth: minWidth ?? "inherit",
                    padding: padding ?? "0.2rem 0.4rem",
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
                {priorityLabel != "" ? priorityLabel : '-'}
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
