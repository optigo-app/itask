import React, { useEffect, useState } from 'react';
import './SidebarDrawerFile.scss';
import {
  Box, Button, Drawer, IconButton, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography
} from '@mui/material';
import { CircleX, File, Link, VideoIcon } from 'lucide-react';
import FileDropzone from './FileDropzone';
import {
  commonTextFieldProps, mapKeyValuePair, transformAttachments
} from '../../../Utils/globalfun';
import { useRecoilValue } from 'recoil';
import { selectedRowData } from '../../../Recoil/atom';
import { filesUploadApi } from '../../../Api/UploadApi/filesUploadApi';
import pdfIcon from '../../../Assests/pdf.png';
import sheetIcon from '../../../Assests/xls.png';
import Document from '../../../Assests/document.png';
import { filesUploadSaveApi } from '../../../Api/UploadApi/filesUploadSaveApi';
import { getAttachmentApi } from '../../../Api/UploadApi/GetAttachmentApi';
import ImageSkeleton from './ImageSkeleton';
import { toast } from 'react-toastify';
import { removeFileApi } from '../../../Api/UploadApi/filesRemoveApi';

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
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleFileDrop = async (acceptedFiles) => {
    const folder = formValues.folderName || "Untitled";
    const formFiles = formValues?.attachment?.[folder] || [];
    const uploadedFiles = uploadedFile?.attachment?.[folder] || [];
    const existingNames = new Set([
      ...formFiles.map(f => f.file?.name || f.file?.path?.split('/').pop()),
      ...uploadedFiles.map(f => f.fileName),
    ]);
    const newFiles = [];
    const duplicateFiles = [];
    const oversizedFiles = [];
    for (const file of acceptedFiles) {
      const isDuplicate = existingNames.has(file.name);
      const isOversized = file.size > 25 * 1024 * 1024;
      if (isDuplicate) {
        duplicateFiles.push(file.name);
      } else if (isOversized) {
        oversizedFiles.push(file.name);
      } else {
        newFiles.push(file);
      }
    }
    if (duplicateFiles.length > 0) {
      toast.warning(`Skipped duplicate file(s): ${duplicateFiles.join(', ')}`);
    }
    if (oversizedFiles.length > 0) {
      toast.error(`Skipped file(s) exceeding 25MB: ${oversizedFiles.join(', ')}`);
    }
    if (newFiles.length === 0) return;
    setFormValues((prev) => ({
      ...prev,
      attachment: {
        ...prev.attachment,
        [folder]: [
          ...(prev.attachment[folder] || []),
          ...newFiles.map(file => ({ file })),
        ],
      },
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

  const handleDeleteFile = async (folder, index) => {
    const isLocal = (formValues?.attachment?.[folder] || []).some((f, i) => i === index);
    if (isLocal) {
      const updatedFormFiles = [...formValues.attachment[folder]];
      updatedFormFiles.splice(index, 1);
      const updatedFormAttachment = { ...formValues.attachment };
      if (updatedFormFiles.length > 0) {
        updatedFormAttachment[folder] = updatedFormFiles;
      } else {
        delete updatedFormAttachment[folder];
      }
      setFormValues((prev) => ({
        ...prev,
        attachment: updatedFormAttachment,
      }));
      return;
    }
    const fileToRemove = uploadedFile?.attachment?.[folder]?.[index];
    if (!fileToRemove?.url) return;
    try {
      await removeFileApi({ attachments: fileToRemove.url });
    } catch {
      return;
    }
    const updatedFiles = [...(uploadedFile.attachment[folder] || [])];
    updatedFiles.splice(index, 1);
    const updatedAttachment = { ...uploadedFile.attachment };
    const updatedUrl = { ...uploadedFile.url };
    if (updatedFiles.length > 0) {
      updatedAttachment[folder] = updatedFiles;
    } else {
      delete updatedAttachment[folder];
      const isUrlEmpty = !(updatedUrl?.[folder]?.length > 0);
      if (isUrlEmpty) {
        delete updatedUrl[folder];
      }
    }
    const newUploadedFile = {
      attachment: updatedAttachment,
      url: updatedUrl,
    };
    setUploadedFile(newUploadedFile);
    const allFolders = Array.from(new Set([
      ...Object.keys(updatedAttachment),
      ...Object.keys(updatedUrl)
    ]));
    const attachments = allFolders
      .map((folderName) => {
        const files = updatedAttachment[folderName] || [];
        const urls = updatedUrl[folderName] || [];
        if (files.length === 0 && urls.length === 0) return null;
        return {
          folderName,
          documents: [
            {
              documents: files.map(f => f.url).join(','),
              documentsurl: urls.join(','),
            }
          ]
        };
      })
      .filter(Boolean);

    try {
      const uploadRes = await filesUploadSaveApi(attachments, selectedRow?.taskid);
      if (uploadRes?.rd?.[0]?.stat == 1) toast.success("Attachment saved successfully");
      else toast.error("Attachment save failed");
    } catch {
      toast.error("Error while saving updated attachments");
    }
  };

  const handleDeleteUrl = async (folder, index) => {
    const updatedUrl = { ...uploadedFile.url };
    const updatedAttachment = { ...uploadedFile.attachment };

    const urls = [...(updatedUrl[folder] || [])];
    urls.splice(index, 1);

    if (urls.length > 0) {
      updatedUrl[folder] = urls;
    } else {
      delete updatedUrl[folder];
      const isAttachmentEmpty = !(updatedAttachment?.[folder]?.length > 0);
      if (isAttachmentEmpty) {
        delete updatedAttachment[folder];
      }
    }

    const newUploadedFile = {
      attachment: updatedAttachment,
      url: updatedUrl,
    };

    setUploadedFile(newUploadedFile);

    const allFolders = Array.from(new Set([
      ...Object.keys(updatedAttachment),
      ...Object.keys(updatedUrl),
    ]));

    const attachments = allFolders
      .map((folderName) => {
        const files = updatedAttachment[folderName] || [];
        const urls = updatedUrl[folderName] || [];
        if (files.length === 0 && urls.length === 0) return null;
        return {
          folderName,
          documents: [
            {
              documents: files.map(f => f.url).join(','),
              documentsurl: urls.join(','),
            }
          ]
        };
      })
      .filter(Boolean);

    try {
      const uploadRes = await filesUploadSaveApi(attachments, selectedRow?.taskid);
      if (uploadRes?.rd?.[0]?.stat == 1) toast.success("Attachment saved successfully");
      else toast.error("Attachment save failed");
    } catch {
      toast.error("Error while saving updated attachments");
    }
  };

  const handleSave = async () => {
    const folderFiles = formValues?.attachment || {};
    const folderUrls = uploadedFile?.url || {};

    try {
      setUploading(true);
      const uploadedAttachment = {};

      // 1. Upload new files
      for (const folderName of Object.keys(folderFiles)) {
        const files = folderFiles[folderName];
        const uploadedResults = [];

        for (const item of files) {
          const res = await filesUploadApi({
            attachments: [{ file: item.file }],
            folderName,
            uniqueNo: item?.file?.name?.split('.')[0],
          });
          uploadedResults.push(...res.files);
        }

        uploadedAttachment[folderName] = uploadedResults;
      }

      // 2. Merge with previously uploaded files
      const combinedAttachment = { ...uploadedFile.attachment };

      for (const folder in uploadedAttachment) {
        combinedAttachment[folder] = [
          ...(uploadedFile.attachment?.[folder] || []),
          ...uploadedAttachment[folder],
        ];
      }

      // 3. Prepare full payload with both file URLs and URL links
      const allFolders = Array.from(new Set([
        ...Object.keys(combinedAttachment),
        ...Object.keys(folderUrls),
      ]));

      const attachments = allFolders.map((folderName) => {
        const files = combinedAttachment[folderName] || [];
        const urls = folderUrls[folderName] || [];

        return {
          folderName,
          documents: [
            {
              documents: files.map(f => f.url).join(','),
              documentsurl: urls.join(','),
            },
          ],
        };
      });

      // 4. Send to save API
      const uploadRes = await filesUploadSaveApi(attachments, selectedRow?.taskid);
      if (uploadRes?.rd?.[0]?.stat == 1) {
        toast.success("Attachment saved successfully");
      } else {
        toast.error("Attachment save failed");
      }

      handleClear();
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Error during upload/save");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFormValues({ folderName: "", url: "", attachment: {} });
    setUploadedFile({ attachment: {}, url: {} });
    setSelectedTab("file");
    onClose();
  };

  const handleCancel = () => {
    setFormValues({ folderName: "", url: "", attachment: {} });
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
          <IconButton onClick={onClose}><CircleX /></IconButton>
        </Box>

        <div style={{ margin: "10px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />

        <Box className="fileSideBarTgBox">
          <ToggleButtonGroup
            value={selectedTab}
            exclusive
            onChange={handleTabChange}
            size="small"
            className="toggle-group"
          >
            {tabData.map(({ id, value, label, icon }) => (
              <ToggleButton key={id} value={value} className="toggle-button" sx={{ borderRadius: "8px" }}>
                {icon}{label}
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
        ) : (
          <Box className="filePreviewSection">
            {Array.from(
              new Set([
                ...Object.keys(uploadedFile.attachment || {}),
                ...Object.keys(uploadedFile.url || {}),
                ...Object.keys(formValues.attachment || {}),
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
                    const isVideo = item?.fileType === "application/octet-stream";

                    return (
                      <Box key={`uploaded-${index}`} className="file-card">
                        {isImage ? (
                          <img src={fileURL} alt={item.fileName} className="preview-image" loading="lazy" onError={handleImgError} />
                        ) : isPdf ? (
                          <img src={pdfIcon} alt="pdf" className="preview-file" loading="lazy" onError={handleImgError} />
                        ) : isVideo ? (
                          <VideoIcon size={30} color='#6D6B77' style={{ marginBottom: '15px' }} />
                        ) : isExcel ? (
                          <img src={sheetIcon} alt="excel" className="preview-file" loading="lazy" onError={handleImgError} />
                        ) : (
                          <img src={Document} alt="doc" className="preview-file" loading="lazy" onError={handleImgError} />
                        )}
                        <Typography className="file-title">{item.fileName}</Typography>
                        <IconButton className="delete-icon" onClick={() => handleDeleteFile(folder, index, 'uploaded')}>
                          <CircleX size={16} />
                        </IconButton>
                      </Box>
                    );
                  })}
                  {(formValues.attachment[folder] || []).map((f, index) => {
                    const fileURL = URL.createObjectURL(f.file);
                    const fileType = f.file?.type;
                    const fileName = f.file?.name;
                    const isImage = fileType?.startsWith('image/');
                    const isPdf = fileType === 'application/pdf';
                    const isVideo = fileType == "application/octet-stream";
                    const isExcel = fileType?.includes('spreadsheet') || fileType?.includes('excel');
                    return (
                      <Box
                        key={`local-${index}`}
                        className="file-card"
                        sx={{
                          border: "1px solid #FFD700 !important",
                          background: "linear-gradient(to right, #fff8e1, #fff3cd) !important",
                        }}
                      >
                        {isImage ? (
                          <img src={fileURL} alt={fileName} className="preview-image" loading="lazy" onError={handleImgError} />
                        ) : isPdf ? (
                          <img src={pdfIcon} alt="pdf" className="preview-file" loading="lazy" onError={handleImgError} />
                        ) : isVideo ? (
                          <VideoIcon size={30} color='#6D6B77' style={{ marginBottom: '15px' }} />
                        ) : isExcel ? (
                          <img src={sheetIcon} alt="excel" className="preview-file" loading="lazy" onError={handleImgError} />
                        ) : (
                          <img src={Document} alt="doc" className="preview-file" loading="lazy" onError={handleImgError} />
                        )}
                        <Typography className="file-title">{fileName}</Typography>
                        <IconButton className="delete-icon" onClick={() => handleDeleteFile(folder, index, 'local')}>
                          <CircleX size={16} />
                        </IconButton>
                      </Box>
                    );
                  })}

                  {/* URL links */}
                  {(uploadedFile?.url[folder] || []).map((link, idx) => (
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
                          {link.replace(/^https?:\/\//, '')?.split('?')[0].slice(0, 30)}...
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
        )}

        <Box className="bottom-buttons" sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex' }}>
          <Button variant="outlined" className="secondaryBtnClassname" onClick={handleCancel} sx={{ marginRight: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="buttonClassname"
            onClick={handleSave}
            disabled={
              !formValues?.folderName?.trim() ||
              (Object.keys(formValues.attachment || {}).length === 0 &&
                Object.keys(uploadedFile.url || {}).length === 0)
            }
          >
            Save Attachment
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SidebarDrawerFile;
