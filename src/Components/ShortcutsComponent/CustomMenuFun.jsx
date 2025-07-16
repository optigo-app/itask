import React from 'react';
import { Menu, MenuItem, Typography } from '@mui/material';

const CustomMenu = ({ anchorEl, handleClose, statusMaster }) => {
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleClose(null)}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "8px !important",
                        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                        maxHeight: '300px',
                        overflowY: 'auto',
                        '& .MuiList-root': {
                            paddingTop: "0 !important",
                            paddingBottom: "0 !important",
                        },
                    },
                },
            }}
        >
            {statusMaster?.length > 0 && statusMaster?.map((status) => (
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
    );
};

export default CustomMenu;
