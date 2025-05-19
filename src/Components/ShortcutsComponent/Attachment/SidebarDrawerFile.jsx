import React, { useEffect, useState } from 'react';
import './SidebarDrawerFile.scss';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { CircleX, File, Link } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { commonTextFieldProps, mapKeyValuePair, transformAttachments } from '../../../Utils/globalfun';
import { useRecoilValue } from 'recoil';
import { selectedRowData } from '../../../Recoil/atom';
import { filesUploadApi } from '../../../Api/UploadApi/filesUploadApi';
import pdfIcon from '../../../Assests/pdf.png';
import sheetIcon from '../../../Assests/xls.png';
import Document from '../../../Assests/document.png'
import { filesUploadSaveApi } from '../../../Api/UploadApi/filesUploadSaveApi';
import { getAttachmentApi } from '../../../Api/UploadApi/GetAttachmentApi';
import ImageSkeleton from './ImageSkeleton';
import { toast } from 'react-toastify';

const tabData = [
  { id: 1, value: "file", label: "File", icon: <File size={18} /> },
  { id: 2, value: "url", label: "URL", icon: <Link size={18} /> },
];

const SidebarDrawerFile = ({ open, onClose }) => {
  const selectedRow = useRecoilValue(selectedRowData);
  const [selectedTab, setSelectedTab] = useState(tabData[0].value);
  const [uploading, setUploading] = useState(false);
  const [formValues, setFormValues] = useState({ folderName: '', url: '', attachment: {} });
  const [uploadedFile, setUploadedFile] = useState({ attachment: {}, url: {} });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAttachment = async () => {
      try {
        setIsLoading(true);
        const res = await getAttachmentApi(selectedRow);
        if (res) {
          const labeledTasks = mapKeyValuePair(res);
          const transformedData = transformAttachments(labeledTasks);
          setUploadedFile(transformedData);
        }
      } catch (error) {
        console.error("Failed to fetch attachments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedRow?.taskid && open) {
      getAttachment();
    }
  }, [open, selectedRow]);


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
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUrl = () => {
    const folder = formValues.folderName || 'Untitled';
    const url = formValues.url.trim();
    if (!url) return;

    setUploadedFile((prev) => ({
      ...prev,
      url: {
        ...prev.url,
        [folder]: [...(prev.url[folder] || []), url],
      },
    }));

    setFormValues((prev) => ({ ...prev, url: '' }));
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

  const handleDeleteUrl = (folder, index) => {
    setUploadedFile((prev) => {
      const updatedUrls = [...(prev.url[folder] || [])];
      updatedUrls.splice(index, 1);
      return {
        ...prev,
        url: {
          ...prev.url,
          [folder]: updatedUrls,
        },
      };
    });
  };

  const handleSave = async () => {
    const allFolders = new Set([
      ...Object.keys(uploadedFile?.attachment || {}),
      ...Object.keys(uploadedFile?.url || {}),
    ]);
    const attachments = Array.from(allFolders).map((folderName) => {
      const fileUrls = (uploadedFile?.attachment?.[folderName] || []).map(f => f.url).join(',');
      const urlList = (uploadedFile?.url?.[folderName] || []).join(',');
      return {
        folderName,
        documents: [
          {
            documents: fileUrls,
            documentsurl: urlList
          }
        ]
      };
    });
    const uploadRes = await filesUploadSaveApi(attachments, selectedRow?.taskid);
    if (uploadRes?.rd?.[0]?.stat == 1) {
      toast.success("Attachment saved successfully");
    }
  
    handleClear();
  };
  

  const handleClear = () => {
    setFormValues({
      folderName: "",
      url: "",
      attachment: {},
    });
    setUploadedFile({
      attachment: {},
      url: {}
    });
    setSelectedTab("file");
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

  const handleImgError = (e) => {
    e.target.src = Document;
  };

  return (
    <Drawer anchor="right" open={open}>
      <Box className="filedrawerMainBox">
        <Box className="drawer-header">
          <Typography variant="h6" className="drawer-title">Attachment</Typography>
          <IconButton onClick={handleClear}><CircleX /></IconButton>
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
              error={!formValues.folderName.trim()}
              helperText={!formValues.folderName.trim() ? 'Folder name is required' : ''}
              {...commonTextFieldProps}
            />
          </Box>
        </Box>

        <Box sx={{
          pointerEvents: !formValues.folderName.trim() ? 'none' : 'auto',
          opacity: !formValues.folderName.trim() ? 0.5 : 1,
          backgroundColor: !formValues.folderName.trim() ? '#f5f5f5' : 'transparent',
          cursor: !formValues.folderName.trim() ? 'not-allowed' : 'auto',
        }}>
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
        </Box>
        {uploading && (
          <Box sx={{ padding: '10px 0' }}>
            <Typography variant="body2" gutterBottom>Uploading...</Typography>
          </Box>
        )}
        {isLoading ? (
          <ImageSkeleton />
        ) :
          <Box className="filePreviewSection">
            {Array.from(
              new Set([
                ...Object.keys(uploadedFile.attachment || {}),
                ...Object.keys(uploadedFile.url || {}),
              ])
            )?.map((folder) => (
              <Box key={folder} className="folder-preview">
                <Typography variant="subtitle2" className="folder-title">{folder}</Typography>
                <Box className="preview-grid">
                  {(uploadedFile.attachment[folder] || []).map((item, index) => {
                    const isImage = item?.fileType?.startsWith('image/');
                    const isPdf = item?.fileType === 'application/pdf';
                    const isExcel = item?.fileType?.includes('spreadsheet') || item?.fileType?.includes('excel');
                    const fileURL = item.url;
                    return (
                      <Box key={index} className="file-card">
                        {isImage ? (
                          <img src={fileURL} alt={item.fileName} className="preview-image" loading="lazy" onError={handleImgError} />
                        ) : isPdf ? (
                          <img src={pdfIcon} alt="pdf-file" className="preview-file" loading="lazy" onError={handleImgError} />
                        ) : isExcel ? (
                          <img src={sheetIcon} alt="xls-file" className="preview-file" loading="lazy" onError={handleImgError} />
                        ) : (
                          <img src={Document} alt="file" className="preview-file" loading="lazy" onError={handleImgError} />
                        )}
                        <Typography className="file-title">{item.fileName}</Typography>
                        <IconButton className="delete-icon" onClick={() => handleDeleteFile(folder, index)} disabled>
                          <CircleX size={16} />
                        </IconButton>
                      </Box>
                    );
                  })}

                  {(uploadedFile?.url[folder] || [])?.map((link, idx) => (
                    <Box key={`url-${idx}`} className="file-card">
                      <Box className="preview-file url-icon-box">
                        <Link size={32} />
                      </Box>
                      <Tooltip title={link} classes={{ tooltip: 'custom-tooltip' }}>
                        <Typography
                          className="file-title url-title"
                          noWrap
                          sx={{ maxWidth: '150px', cursor: 'pointer' }}
                          onClick={() => window.open(link, '_blank')}
                        >
                          {link.replace(/^https?:\/\//, '').split('?')[0].slice(0, 30)}...
                        </Typography>
                      </Tooltip>
                      <IconButton className="delete-icon" onClick={() => handleDeleteUrl(folder, idx)} disabled>
                        <CircleX size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

        }
        <Box className="bottom-buttons" sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex' }}>
          <Button variant="outlined" className="secondaryBtnClassname" onClick={handleCancel} sx={{ marginRight: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" className="buttonClassname" onClick={handleSave} disabled={!formValues?.folderName?.trim()}>
            Save Attachment
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SidebarDrawerFile;
