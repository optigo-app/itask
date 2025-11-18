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
import Breadcrumb from '../../BreadCrumbs/Breadcrumb';
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';
import { getFileIcon } from './fileIcons';

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
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [initialSlideIndex, setInitialSlideIndex] = useState(0);

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

  useEffect(() => {
    if (showError) {
      setTimeout(() => {
        setShowError(false);
      }, 1500);
    }
  }, [showError])

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
    setErrorMsg('');
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
      setErrorMsg(`Skipped duplicate file(s): ${duplicateFiles.join(', ')}`);
      setShowError(true);
    }
    if (oversizedFiles.length > 0) {
      setErrorMsg(`Skipped file(s) exceeding 25MB: ${oversizedFiles.join(', ')}`);
      setShowError(true);
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

      const combinedAttachment = { ...uploadedFile.attachment };

      for (const folder in uploadedAttachment) {
        combinedAttachment[folder] = [
          ...(uploadedFile.attachment?.[folder] || []),
          ...uploadedAttachment[folder],
        ];
      }

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

  // Handle single file preview with multiple attachments support
  const handlePreviewClick = (fileData, allFiles = [], startIndex = 0) => {
    if (allFiles.length > 0) {
      setCurrentAttachments(allFiles);
      setInitialSlideIndex(startIndex);
    } else {
      setCurrentAttachments([fileData]);
      setInitialSlideIndex(0);
    }
    setViewerOpen(true);
  };

  // Handle viewing all attachments from a folder
  const handleViewAllAttachments = (folder, startIndex = 0) => {
    const uploadedFiles = (uploadedFile.attachment[folder] || []).map(item => ({
      url: item.url,
      filename: item.fileName,
      extension: item.fileName?.split('.').pop()?.toLowerCase(),
      fileObject: null
    }));

    const localFiles = (formValues.attachment[folder] || []).map(f => ({
      url: URL.createObjectURL(f.file),
      filename: f.file?.name,
      extension: f.file?.name?.split('.').pop()?.toLowerCase(),
      fileObject: f.file
    }));

    const allAttachments = [...uploadedFiles, ...localFiles];

    if (allAttachments.length > 0) {
      setCurrentAttachments(allAttachments);
      setInitialSlideIndex(startIndex);
      setViewerOpen(true);
    }
  };

  return (
    <Drawer anchor="right" open={open}>
      <Box className="filedrawerMainBox">
        <Box className="drawer-header">
          <Typography variant="h6" className="drawer-title">Attachment</Typography>
          <IconButton onClick={onClose}><CircleX /></IconButton>
        </Box>

        <div style={{ margin: "10px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />
        <Typography variant="caption" sx={{ color: '#7D7f85 !important' }}>
          <Breadcrumb breadcrumbTitles={selectedRow?.breadcrumbTitles} />
        </Typography>
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
        {showError && (
          <Box sx={{ padding: '10px 0' }}>
            <Typography sx={{ color: '#D32F2F !important' }} variant="body2" gutterBottom>{errorMsg}</Typography>
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" className="folder-title">{folder}</Typography>
                  {/* View All Button for folders with multiple files */}
                  {((uploadedFile.attachment[folder] || []).length + (formValues.attachment[folder] || []).length) > 1 && (
                    <Button
                      variant="outlined"
                      size="small"
                      className="buttonClassname"
                      onClick={() => handleViewAllAttachments(folder, 0)}
                      sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
                    >
                      View All {(uploadedFile.attachment[folder] || []).length + (formValues.attachment[folder] || []).length}
                    </Button>
                  )}
                </Box>
                <Box className="preview-grid">
                  {(uploadedFile.attachment[folder] || []).map((item, index) => {
                    const fileURL = item.url;
                    const fileName = item.fileName;
                    console.log("item.extension", item);
                    const Icon = getFileIcon(item.extention);
                    const isImage = item.extention === 'jpg' || item.extention === 'jpeg' || item.extention === 'png' || item.extention === 'gif' || item.extention === 'webp';
                    const fileData = {
                      url: fileURL,
                      filename: item.fileName,
                      extension: item.fileName?.split('.').pop()?.toLowerCase(),
                      fileObject: null
                    };

                    return (
                      <Box
                        key={`uploaded-${index}`}
                        className="file-card"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                        onClick={() => {
                          const uploadedFiles = (uploadedFile.attachment[folder] || []).map(item => ({
                            url: item.url,
                            filename: item.fileName,
                            extension: item.fileName?.split('.').pop()?.toLowerCase(),
                            fileObject: null
                          }));
                          const localFiles = (formValues.attachment[folder] || []).map(f => ({
                            url: URL.createObjectURL(f.file),
                            filename: f.file?.name,
                            extension: f.file?.name?.split('.').pop()?.toLowerCase(),
                            fileObject: f.file
                          }));
                          const allFiles = [...uploadedFiles, ...localFiles];
                          const currentIndex = index;
                          handlePreviewClick(fileData, allFiles, currentIndex);
                        }}
                      >
                        {isImage ? (
                          <img
                            src={fileURL}
                            alt={fileName}
                            style={{ width: "100%", height: "80px", objectFit: "cover" }}
                          />
                        ) : (
                          <Icon size={30} color="#6D6B77" style={{ marginBottom: "10px" }} />
                        )}
                        <Typography className="file-title">{item.fileName}</Typography>
                        <IconButton
                          className="delete-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(folder, index, 'uploaded');
                          }}
                        >
                          <CircleX size={16} />
                        </IconButton>
                      </Box>
                    );
                  })}
                  {(formValues.attachment[folder] || []).map((f, index) => {
                    const fileURL = URL.createObjectURL(f.file);
                    const fileName = f.file?.name;
                    const Icon = getFileIcon(f?.file?.name?.split('.').pop()?.toLowerCase());
                    const isImage = (fileName) => {
                      const ext = fileName?.split(".").pop()?.toLowerCase();
                      return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                    };

                    const fileData = {
                      url: fileURL,
                      filename: fileName,
                      extension: fileName?.split('.').pop()?.toLowerCase(),
                      fileObject: f.file
                    };

                    return (
                      <Box
                        key={`local-${index}`}
                        className="file-card"
                        sx={{
                          border: "1px solid #FFD700 !important",
                          background: "linear-gradient(to right, #fff8e1, #fff3cd) !important",
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0px 4px 12px rgba(255, 215, 0, 0.3)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                        onClick={() => {
                          const uploadedFiles = (uploadedFile.attachment[folder] || []).map(item => ({
                            url: item.url,
                            filename: item.fileName,
                            extension: item.fileName?.split('.').pop()?.toLowerCase(),
                            fileObject: null
                          }));
                          const localFiles = (formValues.attachment[folder] || []).map(f => ({
                            url: URL.createObjectURL(f.file),
                            filename: f.file?.name,
                            extension: f.file?.name?.split('.').pop()?.toLowerCase(),
                            fileObject: f.file
                          }));
                          const allFiles = [...uploadedFiles, ...localFiles];
                          const currentIndex = uploadedFiles.length + index;
                          handlePreviewClick(fileData, allFiles, currentIndex);
                        }}
                      >
                        {isImage(fileName) ? (
                          <img
                            src={fileURL}
                            alt={fileName}
                            style={{ width: "100%", height: "80px", objectFit: "cover" }}
                          />
                        ) : (
                          <Icon size={30} color="#6D6B77" style={{ marginBottom: "10px" }} />
                        )}

                        <Typography className="file-title">{fileName}</Typography>
                        <IconButton
                          className="delete-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(folder, index, 'local');
                          }}
                        >
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

      <DocsViewerModal
        attachments={currentAttachments}
        initialSlideIndex={initialSlideIndex}
        modalOpen={viewerOpen}
        closeModal={() => {
          setViewerOpen(false);
          setCurrentAttachments([]);
          setInitialSlideIndex(0);
        }}
      />
    </Drawer>
  );
};

export default SidebarDrawerFile;
