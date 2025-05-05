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
  Typography
} from '@mui/material';
import { CircleX, File, Link } from 'lucide-react';
import FileDropzone from './FileDropzone';
import { commonTextFieldProps, mapKeyValuePair } from '../../../Utils/globalfun';
import { useRecoilValue } from 'recoil';
import { selectedRowData } from '../../../Recoil/atom';
import { filesUploadApi } from '../../../Api/UploadApi/filesUploadApi';
import pdfIcon from '../../../Assests/pdf.png';
import sheetIcon from '../../../Assests/xls.png';
import Document from '../../../Assests/document.png'
import { filesUploadSaveApi } from '../../../Api/UploadApi/filesUploadSaveApi';
import { getAttachmentApi } from '../../../Api/UploadApi/GetAttachmentApi';
import ImageSkeleton from './ImageSkeleton';

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

  function transformAttachments(data) {
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif"
    };

    const result = {
      attachment: {},
      url: {}
    };

    data.forEach(({ foldername, DocumentName, DocumentUrl }) => {
      const folder = foldername;
      const docUrls = (DocumentName || "").split(",").filter(Boolean);
      const urlLinks = (DocumentUrl || "").split(",").filter(Boolean);

      // Process attachments
      if (!result.attachment[folder]) result.attachment[folder] = [];
      docUrls.forEach(url => {
        const fileName = url.substring(url.lastIndexOf("/") + 1);
        const ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        result.attachment[folder].push({
          url,
          extention: ext,
          fileName,
          fileType: mimeTypes[ext] || "application/octet-stream"
        });
      });

      // Process additional URLs
      if (urlLinks.length) {
        result.url[folder] = urlLinks;
      }
    });

    return result;
  }

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
    debugger
    const attachments = Object.entries(uploadedFile?.attachment)?.map(([folderName, files]) => {
      const fileUrls = files.map(f => f.url).join(',');
      const urlList = (uploadedFile.url[folderName] || []).join(',');
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
    const uploadRes = await filesUploadSaveApi(attachments, selectedRow?.taskid)
    console.log('uploadRes---?>>>>>: ', uploadRes);
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
        {isLoading ? (
          <ImageSkeleton />
        ) :
          <Box className="filePreviewSection">
            {Object.entries(uploadedFile.attachment).map(([folder, files]) => (
              <Box key={folder} className="folder-preview">
                <Typography variant="subtitle2" className="folder-title">{folder}</Typography>
                <Box className="preview-grid">
                  {files.map((item, index) => {
                    const isImage = item?.fileType?.startsWith('image/');
                    const isPdf = item?.fileType === 'application/pdf';
                    const isExcel = item?.fileType?.includes('spreadsheet') || item?.fileType?.includes('excel');
                    const fileURL = item.url;
                    return (
                      <Box key={index} className="file-card">
                        {isImage ? (
                          <img src={fileURL} alt={item.fileName} className="preview-image" loading="lazy" />
                        ) : isPdf ? (
                          <img src={pdfIcon} alt="pdf-file" className="preview-file" loading="lazy" />
                        ) : isExcel ? (
                          <img src={sheetIcon} alt="xls-file" className="preview-file" loading="lazy" />
                        ) : (
                          <img src={Document} alt="file" className="preview-file" loading="lazy" />
                        )}
                        <Typography className="file-title">{item.fileName}</Typography>
                        <IconButton className="delete-icon" onClick={() => handleDeleteFile(folder, index)}>
                          <CircleX size={16} />
                        </IconButton>
                      </Box>
                    );
                  })}

                  {(uploadedFile.url[folder] || []).map((link, idx) => (
                    <Box key={`url-${idx}`} className="file-card">
                      <Box className="preview-file url-icon-box">
                        <Link size={32} />
                      </Box>
                      <Typography className="file-title url-title">{link}</Typography>
                      <IconButton className="delete-icon" onClick={() => handleDeleteUrl(folder, idx)}>
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
          <Button variant="contained" className="buttonClassname" onClick={handleSave}>
            Save Attachment
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SidebarDrawerFile;
