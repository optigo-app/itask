import React, { useState } from 'react';
import './SidebarDrawerFile.scss';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { CircleX, File, Link, } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { commonTextFieldProps } from '../Utils/globalfun';

const tabData = [
  { id: 1, value: "file", label: "File", icon: <File size={18} /> },
  { id: 2, value: "url", label: "URL", icon: <Link size={18} /> },
];

const SidebarDrawerFile = ({ open, onClose }) => {
  const [selectedTab, setSelectedTab] = useState(tabData[0].value);
  const [formValues, setFormValues] = useState({
    folderName: "",
    url: "",
    attachment: {},
  });


  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleFileDrop = (acceptedFiles) => {
    const folder = formValues.folderName || "Untitled";
    setFormValues((prev) => ({
      ...prev,
      attachment: {
        ...prev.attachment,
        [folder]: [...(prev.attachment[folder] || []), ...acceptedFiles.map(file => ({ file }))]
      }
    }));
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
        [folder]: [...(prev.attachment[folder] || []), { url: newUrl }]
      }
    }));
  };


  const handleDeleteFile = (folder, index) => {
    setFormValues(prev => {
      const updatedFiles = [...prev.attachment[folder]];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        attachment: {
          ...prev.attachment,
          [folder]: updatedFiles,
        }
      };
    });
  };



  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box className="filedrawerMainBox">
        <Box className="drawer-header">
          <Typography variant="h6" className="drawer-title">
            Attachment
          </Typography>
          <IconButton onClick={onClose}>
            <CircleX />
          </IconButton>
        </Box>
        <div style={{
          margin: "10px 0",
          border: "1px dashed #7d7f85",
          opacity: 0.3,
        }}
        />
        <Box className="fileSideBarTgBox">
          <ToggleButtonGroup
            value={selectedTab}
            exclusive
            onChange={handleTabChange}
            aria-label="task type"
            size="small"
            className="toggle-group"
          >
            {tabData?.map(({ id, value, label, icon }) => (
              <ToggleButton
                key={id}
                value={value}
                className="toggle-button"
                sx={{
                  borderRadius: "8px",
                }}
              >
                {icon}
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box className="folderBox">
          <Box className="form-group">
            <Typography
              variant="subtitle1"
              className="form-label"
              htmlFor="taskName"
            >
              Folder Name
            </Typography>
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
        ) :
          <Box className="urlInBox">
            <Box className="form-group">
              <Typography
                variant="subtitle1"
                className="form-label"
                htmlFor="taskName"
              >
                URL address
              </Typography>
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
        }
        <Box className="filePreviewSection">
          {Object.entries(formValues.attachment).map(([folder, files]) => (
            <Box key={folder} className="folder-preview">
              <Typography variant="subtitle2" className="folder-title">{folder}</Typography>
              <Box className="preview-grid">
                {files.map((item, index) => {
                  const isFile = item.file;
                  const isImage = isFile?.type?.startsWith("image/");
                  const fileURL = isFile ? URL.createObjectURL(item.file) : null;

                  return (
                    <Box key={index} className="file-card">
                      {isFile ? (
                        isImage ? (
                          <img src={fileURL} alt={item.file.name} className="preview-image" />
                        ) : (
                          <File className="preview-icon" />
                        )
                      ) : (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="url-preview">
                          <Link className="preview-icon" />
                        </a>
                      )}
                      <Typography className="file-title">
                        {isFile ? item.file.name : item.url}
                      </Typography>
                      <IconButton
                        className="delete-icon"
                        onClick={() => handleDeleteFile(folder, index)}
                      >
                        <CircleX size={16} />
                      </IconButton>
                    </Box>
                  );
                })}

              </Box>
            </Box>
          ))}
        </Box>

      </Box>
    </Drawer>
  );
};

export default SidebarDrawerFile;
