import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExcelPreview from './ExcelPreview'; // Import the Excel preview component
import WordPreview from './WordPreview'; // Import the Word preview component

const DocsViewerModal = ({ modalOpen, closeModal, fileData }) => {
  const { url, filename, extension, fileObject } = fileData || {};

  const lowerExt = extension?.toLowerCase();
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
  const videoExts = ['mp4', 'webm', 'ogg'];
  const pdfExts = ['pdf'];
  const excelExts = ['xlsx', 'xls', 'csv']; // Excel and CSV support
  const wordExts = ['docx', 'doc']; // Word document support
  const textExts = ['txt'];

  const isImage = imageExts.includes(lowerExt);
  const isVideo = videoExts.includes(lowerExt);
  const isPdf = pdfExts.includes(lowerExt);
  const isExcel = excelExts.includes(lowerExt);
  const isWord = wordExts.includes(lowerExt);
  const isText = textExts.includes(lowerExt);
  const isBrowserPreviewable = isImage || isVideo || isPdf || isExcel || isWord || isText;

  const [fullWidth, setFullWidth] = useState(false);

  const handleDownload = () => {
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Modal open={modalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: 'absolute',
            top: fullWidth ? '0%' : '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: fullWidth ? '100%' : '80%',
            height: fullWidth ? '100%' : '85vh',
            bgcolor: 'background.paper',
            borderRadius: fullWidth ? 0 : 2,
            boxShadow: 24,
            p: 2,
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" noWrap sx={{
              padding: fullWidth && '0px 10px 0 10px',
            }}>{filename || 'Document Preview'}</Typography>
            <Box display="flex" alignItems="center">
              <IconButton onClick={() => setFullWidth(!fullWidth)} title="Toggle Fullscreen">
                {fullWidth ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ mx: 1 }}
                className='buttonClassname'
              >
                Download
              </Button>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Divider */}
          <div
            style={{
              margin: "10px 0",
              border: "1px dashed #7d7f85",
              opacity: 0.3,
            }}
          />

          {/* Preview Area */}
          <Box flexGrow={1} sx={{ overflow: 'hidden' }}>
            {isPdf && (
              <iframe
                src={url}
                title="PDF Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
            {isImage && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={url}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </Box>
            )}
            {isVideo && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                overflow="auto"
              >
                <video
                  src={url}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  autoPlay
                  muted
                  loop
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              </Box>
            )}
            {isExcel && (
              <ExcelPreview url={url} filename={filename} fileObject={fileObject} />
            )}
            {isWord && (
              <WordPreview url={url} filename={filename} fileObject={fileObject} />
            )}
            {isText && (
              <iframe
                src={url}
                title="Text Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            )}
            {!isBrowserPreviewable && (
              <Box
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                textAlign="center"
                bgcolor="#f5f5f5"
                borderRadius={1}
              >
                <Typography variant="body1" mb={2}>
                  Preview not available for <strong>{extension}</strong> files.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  className='buttonClassname'
                >
                  Download File
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DocsViewerModal;