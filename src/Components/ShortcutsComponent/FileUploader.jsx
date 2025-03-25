import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Grid,
    Menu,
    MenuItem,
} from "@mui/material";
import { InsertDriveFile, Close } from "@mui/icons-material";

const FileUploader = ({ formValues, setFormValues }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openUrlModal, setOpenUrlModal] = useState(false);
    const [url, setUrl] = useState("");

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setFormValues((prev) => ({
            ...prev,
            attachment: [...(prev.attachment || []), ...files],
        }));
    };

    const handleAddUrl = () => {
        if (url) {
            setFormValues((prev) => ({
                ...prev,
                attachment: [...(prev.attachment || []), { name: url, isUrl: true }],
            }));
            setUrl("");
            setOpenUrlModal(false);
        }
    };

    const handleRemoveFile = (index) => {
        setFormValues((prev) => {
            const newAttachments = [...prev.attachment];
            newAttachments.splice(index, 1);
            return { ...prev, attachment: newAttachments };
        });
    };

    return (
        <Grid item xs={12}>
            <Box className="form-group">
                <Typography variant="subtitle1" className="form-label">
                    Attachment
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        className="secondary-btn"
                        onClick={(event) => setAnchorEl(event.currentTarget)}
                    >
                        Upload File
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        slotProps={{
                            paper: {
                                sx: {
                                    borderRadius: "8px !important",
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                                    '& ".MuiList-root': {
                                        paddingTop: "0 !important",
                                        paddingBottom: "0 !important",
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem
                            sx={{
                                margin: "0px 10px !important",
                                borderRadius: "8px !important",
                                "&:hover": {
                                    backgroundColor: "#f0f0f0 !important",
                                    borderRadius: "8px !important",
                                },
                            }}
                            onClick={() => {
                                document.getElementById("fileInput").click();
                                setAnchorEl(null);
                            }}
                        >
                            <Typography variant="body2">
                                from Computer
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            sx={{
                                margin: "5px 10px !important",
                                borderRadius: "8px !important",
                                "&:hover": {
                                    backgroundColor: "#f0f0f0 !important",
                                    borderRadius: "8px !important",
                                },
                            }}
                            onClick={() => {
                                setOpenUrlModal(true);
                                setAnchorEl(null);
                            }}
                        >
                            <Typography variant="body2">
                                A link to a URL
                            </Typography>
                        </MenuItem>
                    </Menu>
                    <input
                        id="fileInput"
                        type="file"
                        multiple
                        hidden
                        onChange={handleFileChange}
                    />
                </Box>
                {formValues.attachment?.length > 0 && (
                    <Box
                        sx={{
                            marginTop: "8px",
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: "#f5f5f5",
                            maxHeight: "150px",
                            overflowY: "auto",
                            width: "50%",
                        }}
                    >
                        {formValues.attachment.map((file, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                    "&:last-child": { marginBottom: 0 },
                                }}
                            >
                                <InsertDriveFile sx={{ marginRight: 1, color: "#7367f0" }} />
                                <Typography
                                    variant="body2"
                                    sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                >
                                    {file.isUrl ? file.name : file.name}
                                </Typography>
                                <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* URL Upload Modal */}
            <Dialog open={openUrlModal} onClose={() => setOpenUrlModal(false)}>
                <DialogTitle>Enter URL</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="URL"
                        variant="outlined"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUrlModal(false)}>Cancel</Button>
                    <Button onClick={handleAddUrl} disabled={!url}>Add URL</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default FileUploader;