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

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = [
  'image/',
  'image/svg+xml',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/',
];

const SidebarDrawerFile = ({ open, onClose }) => {
  const selectedRow = useRecoilValue(selectedRowData);
  console.log('selectedRow: ', selectedRow);
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


  const handleFileDrop = (acceptedFiles) => {
    const folder = formValues.folderName || "Untitled";
    const validFiles = [];
    const errors = [];

    acceptedFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds the 1MB size limit.`);
      } else if (!ALLOWED_TYPES.some(type => file.type.startsWith(type))) {
        errors.push(`${file.name} is not a supported file type.`);
      } else {
        const extension = file.name.split('.').pop();
        validFiles.push({
          url: URL.createObjectURL(file),
          extention: extension,
          fileName: file.name,
          fileType: file.type,
          file,
          isLocalfile: true,
        });
      }
    });

    if (errors.length) {
      errors.forEach(err => toast.error(err));
      return;
    }

    setUploadedFile(prev => ({
      ...prev,
      attachment: {
        ...prev.attachment,
        [folder]: [...(prev.attachment?.[folder] || []), ...validFiles],
      }
    }));
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
    setUploadedFile((prev) => {
      const prevAttachment = prev?.attachment || {};
      const updatedFiles = [...(prevAttachment[folder] || [])];
      updatedFiles.splice(index, 1);
      const newAttachment = { ...prevAttachment };

      if (updatedFiles.length === 0) {
        delete newAttachment[folder];
      } else {
        newAttachment[folder] = updatedFiles;
      }
      const prevUrl = prev?.url || {};
      const newUrl = { ...prevUrl };
      if (!newAttachment[folder]) {
        delete newUrl[folder];
      }

      return {
        ...prev,
        attachment: newAttachment,
        url: newUrl,
      };
    });
  };

  const handleDeleteUrl = (folder, index) => {
    setUploadedFile((prev) => {
      const prevUrl = prev?.url || {};
      const updatedUrls = [...(prevUrl[folder] || [])];
      updatedUrls.splice(index, 1);
      const newUrl = { ...prevUrl };
      if (updatedUrls.length === 0) {
        delete newUrl[folder];
      } else {
        newUrl[folder] = updatedUrls;
      }
      return {
        ...prev,
        url: newUrl,
      };
    });
  };

  const handleSave = async () => {
    const allFolders = new Set([
      ...Object.keys(formValues?.attachment || {}),
      ...Object.keys(uploadedFile?.url || {}),
    ]);
    let updatedAttachments = {};
    try {
      setUploading(true);
      for (const folderName of allFolders) {
        const localFiles = formValues?.attachment?.[folderName] || [];
        if (localFiles.length) {
          const res = await filesUploadApi({
            attachments: localFiles,
            folderName,
            uniqueNo: selectedRow?.taskid || 'defaultNo',
          });
          updatedAttachments[folderName] = res.files;
          setUploadedFile(prev => ({
            ...prev,
            attachment: {
              ...prev.attachment,
              [folderName]: [
                ...(prev.attachment?.[folderName] || []),
                ...res.files
              ]
            }
          }));
        }
      }
      const attachmentsPayload = Array.from(allFolders).map(folderName => {
        const fileUrls = (uploadedFile?.attachment?.[folderName] || [])
          .concat(updatedAttachments?.[folderName] || [])
          .map(f => f.url)
          .join(',');
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
      const uploadRes = await filesUploadSaveApi(attachmentsPayload, selectedRow?.taskid);
      if (uploadRes?.rd?.[0]?.stat == 1) {
        toast.success("Attachment saved successfully");
      }
      handleClear();
    } catch (error) {
      toast.error("Failed to save attachments.");
      console.error("Save error:", error);
    } finally {
      setUploading(false);
    }
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
        {selectedRow && <Typography variant="caption"
          sx={{ color: '#7D7f85 !important' }}
        >
          {selectedRow?.taskPr + '/' + selectedRow?.taskname}
        </Typography>}

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
              error={!formValues?.folderName?.trim()}
              helperText={!formValues?.folderName?.trim() ? 'Folder name is required' : ''}
              {...commonTextFieldProps}
            />
          </Box>
        </Box>

        <Box sx={{
          pointerEvents: !formValues?.folderName?.trim() ? 'none' : 'auto',
          opacity: !formValues?.folderName?.trim() ? 0.5 : 1,
          backgroundColor: !formValues?.folderName?.trim() ? '#f5f5f5' : 'transparent',
          cursor: !formValues?.folderName?.trim() ? 'not-allowed' : 'auto',
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
                  {(uploadedFile?.attachment[folder] || []).map((item, index) => {
                    console.log('item: ', item);
                    const isImage = item?.fileType?.startsWith('image/');
                    const isPdf = item?.fileType === 'application/pdf';
                    const isExcel = item?.fileType?.includes('spreadsheet') || item?.fileType?.includes('excel');
                    const fileURL = item.url;
                    return (
                      <Box key={index} className="file-card" sx={{
                        border: item?.isLocalfile == true ? "1px solid #FFD700 !important" : "transparent",
                        background: item?.isLocalfile == true ? "linear-gradient(to right, #ffd70000, #FFECB3) !important" : "transparent"
                      }}>
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
                        <IconButton className="delete-icon" onClick={() => handleDeleteFile(folder, index)}>
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
          <Button variant="contained" className="buttonClassname" onClick={handleSave} disabled={!formValues?.folderName?.trim()}>
            Save Attachment
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SidebarDrawerFile;
