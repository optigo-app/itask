import React from "react";
import { Menu, MenuItem, IconButton, Typography } from "@mui/material";
import { Scissors, ClipboardPaste } from "lucide-react";

const CutPasetContextMenu = ({ contextMenu, onClose, onCopy, onPaste, copiedData }) => {
    const menuItems = [
        {
            label: "Cut",
            icon: Scissors,
            onClick: onCopy,
            disabled: false,
        },
        {
            label: "Paste",
            icon: ClipboardPaste,
            onClick: onPaste,
            disabled: !copiedData || (typeof copiedData === 'string' && copiedData.trim() === ''),
        },
    ];
    

    return (
        <Menu
            open={contextMenu !== null}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "8px !important",
                        '& .MuiList-root': {
                            paddingTop: "0 !important",
                            paddingBottom: "0 !important",
                            margin: "10px",
                        },
                    },
                },
            }}
        >
            {menuItems?.map(({ label, icon: Icon, onClick, disabled }, index) => (
                <MenuItem
                    key={index}
                    onClick={onClick}
                    disabled={disabled}
                    sx={{
                        padding: '5px 10px !important',
                        margin: "5px 10px !important",
                        borderRadius: "8px !important",
                        "&:hover": {
                            backgroundColor: "#f0f0f0 !important",
                        },
                        "& .MuiButtonBase-root": {
                            padding: "0 !important",
                            minWidth: "unset",
                        },
                    }}
                >
                    <IconButton size="small" sx={{ mr: .5, padding: 0 }}>
                        <Icon size={18} />
                    </IconButton>
                    <Typography sx={{ fontSize: '14px' }}>{label}</Typography>
                </MenuItem>
            ))}
        </Menu>
    );
};

export default CutPasetContextMenu;
