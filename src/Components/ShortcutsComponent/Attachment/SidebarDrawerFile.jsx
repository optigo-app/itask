import React, { useState } from 'react';
import './SidebarDrawerFile.scss';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  LinearProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import { CircleX, File, Link, Sheet } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { commonTextFieldProps } from '../../../Utils/globalfun';
import { useRecoilValue } from 'recoil';
import { selectedRowData } from '../../../Recoil/atom';
import { filesUploadApi } from '../../../Api/UploadApi/filesUploadApi';

const tabData = [
  { id: 1, value: "file", label: "File", icon: <File size={18} /> },
  { id: 2, value: "url", label: "URL", icon: <Link size={18} /> },
];

const SidebarDrawerFile = ({ open, onClose }) => {
  const selectedRow = useRecoilValue(selectedRowData);
  const [selectedTab, setSelectedTab] = useState(tabData[0].value);
  const [uploading, setUploading] = useState(false);
  const [formValues, setFormValues] = useState({
    folderName: "",
    url: "",
    attachment: {},
  });
  const [uploadedFile, setUploadedFile] = useState({
    folderName: "",
    url: "",
    attachment: {},
  });

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleFileDrop = async (acceptedFiles) => {
    const folder = formValues.folderName || "Untitled";
    setFormValues((prev) => ({
      ...prev,
      attachment: {
        ...prev.attachment,
        [folder]: [...(prev.attachment[folder] || []), ...acceptedFiles.map(file => ({ file }))],
      },
    }));

    // Upload files
    try {
      setUploading(true);
      const result = await filesUploadApi({
        attachments: acceptedFiles.map(file => ({ file })),
        folderName: folder,
        uniqueNo: selectedRow?.taskid || 'defaultNo',
      });
      setUploadedFile((prev) => ({
        ...prev,
        attachment: {
          ...prev.attachment,
          [folder]: [...(prev.attachment[folder] || []), ...result.files],
        },
      }));
      console.log('Files uploaded successfully:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    const folder = formValues.folderName || "Untitled";
    const newUrl = formValues.url.trim();
    if (!newUrl) return;
    setFormValues((prev) => ({
      ...prev,
      url: "",
      attachment: {
        ...prev.attachment,
        [folder]: [...(prev.attachment[folder] || []), { url: newUrl }],
      },
    }));
  };

  const handleDeleteFile = (folder, index) => {
    setFormValues((prev) => {
      const updatedFiles = [...prev.attachment[folder]];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        attachment: {
          ...prev.attachment,
          [folder]: updatedFiles,
        },
      };
    });
  };

  const handleSave = () => {
    console.log('Files and URLs saved:', formValues.attachment);
    onClose();
  };

  const handleCancel = () => {
    setFormValues({
      folderName: "",
      url: "",
      attachment: {},
    });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className="filedrawerMainBox">
        <Box className="drawer-header">
          <Typography variant="h6" className="drawer-title">Attachment</Typography>
          <IconButton onClick={onClose}><CircleX /></IconButton>
        </Box>

        <div style={{ margin: "10px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />

        <Box className="fileSideBarTgBox">
          <ToggleButtonGroup
            value={selectedTab}
            exclusive
            onChange={handleTabChange}
            aria-label="task type"
            size="small"
            className="toggle-group"
          >
            {tabData.map(({ id, value, label, icon }) => (
              <ToggleButton
                key={id}
                value={value}
                className="toggle-button"
                sx={{ borderRadius: "8px" }}
              >
                {icon}
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box className="folderBox">
          <Box className="form-group">
            <Typography variant="subtitle1" className="form-label">Folder Name</Typography>
            <TextField
              name="folderName"
              placeholder="Enter Folder name"
              value={formValues.folderName}
              onChange={handleChange}
              {...commonTextFieldProps}
            />
          </Box>
        </Box>

        {selectedTab === "file" ? (
          <FileDropzone onDrop={handleFileDrop} />
        ) : (
          <Box className="urlInBox">
            <Box className="form-group">
              <Typography variant="subtitle1" className="form-label">URL address</Typography>
              <TextField
                name="url"
                placeholder="Add your URL"
                value={formValues.url}
                onChange={handleChange}
                {...commonTextFieldProps}
              />
            </Box>
            <Box className="linkButton">
              <Button className="buttonClassname" onClick={handleAddUrl}>Add</Button>
            </Box>
          </Box>
        )}

        {uploading && (
          <Box sx={{ padding: '10px 0' }}>
            <Typography variant="body2" gutterBottom>Uploading...</Typography>
          </Box>
        )}

        <Box className="filePreviewSection">
          {Object.entries(uploadedFile.attachment).map(([folder, files]) => (
            <Box key={folder} className="folder-preview">
              <Typography variant="subtitle2" className="folder-title">{folder}</Typography>
              <Box className="preview-grid">
                {files.map((item, index) => {
                  console.log('item: ', item);
                  const isImage = item?.fileType?.startsWith("image/");
                  const isPdf = item?.fileType === "application/pdf";
                  const isExcel = item?.fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                    item?.fileType === "application/vnd.ms-excel";
                  const fileURL = item ? item.url : item.url;

                  return (
                    <Box key={index} className="file-card">
                      {isImage ? (
                        <img src={fileURL} alt={item.fileName} className="preview-image" />
                      ) : isPdf ? (
                        <PdfIcon className="preview-icon" />
                      ) : isExcel ? (
                        <Sheet className="preview-icon" />
                      ) : (
                        <File className="preview-icon" />
                      )}
                      <Typography className="file-title">
                        {item ? item.fileName : item.fileName}
                      </Typography>
                      <IconButton className="delete-icon" onClick={() => handleDeleteFile(folder, index)}>
                        <CircleX size={16} />
                      </IconButton>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>

        <Box className="bottom-buttons" sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex' }}>
          <Button variant="outlined" className="secondaryBtnClassname" onClick={handleCancel} sx={{ marginRight: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" className="buttonClassname" onClick={handleSave}>
            Save Attachment
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SidebarDrawerFile;
