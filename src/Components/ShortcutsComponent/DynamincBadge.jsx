import React, { useState } from "react";
import { Button } from "@mui/material";
import CustomMenu from "./CustomMenuFun";

const DynamicFilterBadge = ({
    task,
    columnKey,
    value,
    colors = {},
    onChange,
    fontSize,
    padding,
    minWidth,
    disable,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [statusMaster, setStatusMaster] = useState([]);

    const structuredData = JSON.parse(
        sessionStorage.getItem("structuredAdvMasterData")
    ) || [];

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        let matchedGroup, parentId;
        for (const parent of structuredData || []) {
            const group = parent.groups?.find(
                g => g?.name?.toLowerCase() === columnKey?.toLowerCase()
            );
            if (!group) continue;
            if (group.attributes?.some(attr => attr?.name?.toLowerCase() === value?.toLowerCase())) {
                matchedGroup = group;
                parentId = parent.id;
                break;
            }
        }
        if (!matchedGroup) {
            const parent = structuredData?.find(p => p.groups?.some(g => g?.name?.toLowerCase() === columnKey?.toLowerCase()));
            matchedGroup = parent?.groups?.find(g => g?.name?.toLowerCase() === columnKey?.toLowerCase());
            parentId = parent?.id;
        }
        const data = matchedGroup?.attributes?.map(attr => ({
            id: attr.bindid,
            labelname: attr.name,
            displayorder: 1,
            isdelete: 0,
            bindid: attr.bindid,
            filtermaingroupid: parentId,
            filtergroupid: matchedGroup?.id,
            filterattrid: attr.id,
        })) || [];
        setStatusMaster(data);
    };

    const handleClose = (newVal) => {
        setAnchorEl(null);
        if (newVal && onChange) {
            onChange(task, columnKey, newVal);
        }
    };

    const col = colors?.[String(value)?.toLowerCase()] || {
        color: "#7d7f85",
        backgroundColor: "#7d7f8559",
    };

    return (
        <>
            <Button
                onClick={handleClick}
                style={{
                    color: col.color,
                    backgroundColor: col.backgroundColor,
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
                {value !== "" && value !== null ? value : "-"}
            </Button>

            <CustomMenu
                anchorEl={anchorEl}
                handleClose={handleClose}
                statusMaster={statusMaster}
            />
        </>
    );
};

export default DynamicFilterBadge;
