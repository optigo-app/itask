import React from "react";
import { Menu, MenuItem, Typography, Box, Divider } from "@mui/material";
import { Scissors, ClipboardPaste } from "lucide-react";

const CutPasetContextMenu = ({ contextMenu, onClose, onCopy, onPaste, copiedData, cutActive }) => {
    const hasCopiedData = copiedData && Object.keys(copiedData).length > 0;

    const menuItems = [
        {
            label: "Cut",
            icon: Scissors,
            onClick: onCopy,
            disabled: cutActive || hasCopiedData,
            description: "Move task to clipboard",
            color: "#ff6b35",
        },
        {
            label: "Paste",
            icon: ClipboardPaste,
            onClick: onPaste,
            disabled: !hasCopiedData,
            description: hasCopiedData ? `Paste "${copiedData?.taskname}"` : "No task to paste",
            color: "#51cf66",
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
                        borderRadius: "12px !important",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08) !important",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                        minWidth: "220px",
                        '& .MuiList-root': {
                            paddingTop: "8px !important",
                            paddingBottom: "8px !important",
                            margin: "0",
                        },
                    },
                },
            }}
        >
            {menuItems?.map(({ label, icon: Icon, onClick, disabled, description, color }, index) => (
                <React.Fragment key={index}>
                    <MenuItem
                        onClick={disabled ? undefined : onClick}
                        disabled={disabled}
                        sx={{
                            padding: '12px 16px !important',
                            margin: "4px 8px !important",
                            borderRadius: "8px !important",
                            minHeight: "48px",
                            opacity: disabled ? 0.6 : 1,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: "relative",
                            overflow: "hidden",
                            "&:hover": {
                                backgroundColor: disabled ? 'transparent !important' : `${color}15 !important`,
                                transform: disabled ? 'none' : 'translateY(-1px)',
                                boxShadow: disabled ? 'none' : `0 4px 12px ${color}25`,
                            },
                            "&.Mui-disabled": {
                                opacity: 0.6,
                                color: 'rgba(0, 0, 0, 0.38)',
                            },
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: "3px",
                                background: disabled ? 'rgba(0, 0, 0, 0.1)' : color,
                                opacity: disabled ? 0.3 : 1,
                                transition: "all 0.2s ease",
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '6px',
                                    backgroundColor: disabled ? 'rgba(0, 0, 0, 0.05)' : `${color}15`,
                                    marginRight: 2,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Icon
                                    size={16}
                                    color={disabled ? 'rgba(0, 0, 0, 0.38)' : color}
                                    style={{ transition: "all 0.2s ease" }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    sx={{
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: disabled ? 'rgba(0, 0, 0, 0.38)' : '#1a1a1a',
                                        lineHeight: 1.2,
                                        marginBottom: '2px'
                                    }}
                                >
                                    {label}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '12px',
                                        color: disabled ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.6)',
                                        lineHeight: 1.2,
                                        maxWidth: '160px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {description}
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                    {index < menuItems.length - 1 && (
                        <Divider sx={{ margin: '4px 16px', opacity: 0.1 }} />
                    )}
                </React.Fragment>
            ))}
        </Menu>
    );
};

export default CutPasetContextMenu;