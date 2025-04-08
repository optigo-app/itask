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
import { CircleX } from "lucide-react";
import { commonTextFieldProps } from "../../Utils/globalfun";

const FileUploader = ({ formValues, setFormValues }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [openUrlModal, setOpenUrlModal] = useState(false);
    const [url, setUrl] = useState("");

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files).map((file) => ({
            file,
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
            name: file.name,
        }));

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
                        className="uploadBtnClassname"
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
                                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                                },
                            },
                        }}
                    >
                        <MenuItem
                            sx={{ margin: "0px 10px !important", borderRadius: "8px !important" }}
                            onClick={() => {
                                document.getElementById("fileInput").click();
                                setAnchorEl(null);
                            }}
                        >
                            <Typography variant="body2">From Computer</Typography>
                        </MenuItem>
                        <MenuItem
                            sx={{ margin: "5px 10px !important", borderRadius: "8px !important" }}
                            onClick={() => {
                                setOpenUrlModal(true);
                                setAnchorEl(null);
                            }}
                        >
                            <Typography variant="body2">A link to a URL</Typography>
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
                                {file.preview ? (
                                    <img
                                        src={file.preview}
                                        alt="preview"
                                        style={{ width: 40, height: 40, objectFit: "cover", marginRight: 8 }}
                                    />
                                ) : (
                                    <InsertDriveFile sx={{ marginRight: 1, color: "#7367f0" }} />
                                )}
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
            <Dialog PaperProps={{
                sx: {
                    borderRadius: '8px',
                },
            }}
                open={openUrlModal}
                onClose={() => setOpenUrlModal(false)}
            >
                <Box sx={{ minWidth: '400px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <DialogTitle sx={{ padding: '5px 2px 0px 10px' }}>Add a link</DialogTitle>
                        <IconButton onClick={() => setOpenUrlModal(false)}>
                            <CircleX />
                        </IconButton>
                    </Box>
                    <div style={{
                        margin: "5px 0",
                        border: "1px dashed #7d7f85",
                        opacity: 0.3,
                    }}
                    />
                    <DialogContent>
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="taskName"
                                sx={{ fontSize: '14px' }}
                            >
                                URL address
                            </Typography>
                            <TextField
                                name="taskAttachmentUrl"
                                placeholder="Add your link here"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                {...commonTextFieldProps}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button className="secondaryBtnClassname" onClick={() => setOpenUrlModal(false)}>Cancel</Button>
                        <Button className="buttonClassname" onClick={handleAddUrl} disabled={!url}>Add URL</Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Grid>
    );
};

export default FileUploader;
