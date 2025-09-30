import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Button,
  ButtonGroup,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExcelPreview from './ExcelPreview';
import WordPreview from './WordPreview';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './DocsViewerModal.css';

const DocsViewerModal = ({ modalOpen, closeModal, fileData, attachments = [], initialSlideIndex = 0 }) => {
  // Support both single file and multiple attachments
  const files = attachments.length > 0 ? attachments : (fileData ? [fileData] : []);
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [zoom, setZoom] = useState(1);
  const [fullWidth, setFullWidth] = useState(false);
  const swiperRef = useRef(null);

  // Get current file data
  const currentFile = files[currentIndex] || {};
  const { url, filename, extension, fileObject } = currentFile;
  const lowerExt = extension?.toLowerCase();
  
  // File type definitions
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
  const videoExts = ['mp4', 'webm', 'ogg'];
  const pdfExts = ['pdf'];
  const excelExts = ['xlsx', 'xls', 'csv'];
  const wordExts = ['docx', 'doc'];
  const textExts = ['txt'];

  const isImage = imageExts.includes(lowerExt);
  const isVideo = videoExts.includes(lowerExt);
  const isPdf = pdfExts.includes(lowerExt);
  const isExcel = excelExts.includes(lowerExt);
  const isWord = wordExts.includes(lowerExt);
  const isText = textExts.includes(lowerExt);
  const isBrowserPreviewable = isImage || isVideo || isPdf || isExcel || isWord || isText;

  const handleDownload = () => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.25));

  const handleSlideChange = (swiper) => {
    setCurrentIndex(swiper.activeIndex);
    setZoom(1); // Reset zoom when changing slides
  };

  const handlePrevSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  // Reset current index when modal opens/closes
  useEffect(() => {
    if (modalOpen) {
      setCurrentIndex(initialSlideIndex);
      setZoom(1);
      // Set initial slide in Swiper if it exists
      if (swiperRef.current && initialSlideIndex > 0) {
        setTimeout(() => {
          swiperRef.current.slideTo(initialSlideIndex, 0);
        }, 100);
      }
    }
  }, [modalOpen, initialSlideIndex]);

  // Helper component to render file content
  const renderFileContent = (file, zoomLevel = 1) => {
    const { url, filename, extension, fileObject } = file;
    const lowerExt = extension?.toLowerCase();
    
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg'];
    const pdfExts = ['pdf'];
    const excelExts = ['xlsx', 'xls', 'csv'];
    const wordExts = ['docx', 'doc'];
    const textExts = ['txt'];

    const isImage = imageExts.includes(lowerExt);
    const isVideo = videoExts.includes(lowerExt);
    const isPdf = pdfExts.includes(lowerExt);
    const isExcel = excelExts.includes(lowerExt);
    const isWord = wordExts.includes(lowerExt);
    const isText = textExts.includes(lowerExt);
    const isBrowserPreviewable = isImage || isVideo || isPdf || isExcel || isWord || isText;

    if (isPdf) {
      return (
        <iframe
          src={url}
          title="PDF Preview"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      );
    }

    if (isImage) {
      return (
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
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out',
              objectFit: 'contain',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
            }}
          />
        </Box>
      );
    }

    if (isVideo) {
      return (
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
      );
    }

    if (isExcel) {
      return <ExcelPreview url={url} filename={filename} fileObject={fileObject} />;
    }

    if (isWord) {
      return <WordPreview url={url} filename={filename} fileObject={fileObject} />;
    }

    if (isText) {
      return (
        <iframe
          src={url}
          title="Text Preview"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      );
    }

    if (!isBrowserPreviewable) {
      return (
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
            onClick={() => window.open(url, '_blank')}
            className='buttonClassname'
          >
            Download File
          </Button>
        </Box>
      );
    }

    return null;
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
            <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{
                padding: fullWidth && '0px 10px 0 10px',
                flex: 1,
                minWidth: 0
              }}>
                {filename || 'Document Preview'}
              </Typography>
              {files.length > 1 && (
                <Chip 
                  label={`${currentIndex + 1} / ${files.length}`}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
              )}
            </Box>
            <Box className="docs-toolbar" display="flex" alignItems="center" gap={0.5}>
              {/* Navigation Controls for Multiple Files */}
              {files.length > 1 && (
                <>
                  <IconButton 
                    onClick={handlePrevSlide} 
                    disabled={currentIndex === 0}
                    title="Previous File" 
                    className="secondaryBtnClassname"
                    size="small"
                  >
                    <ChevronLeft  size={18} />
                  </IconButton>
                  <IconButton 
                    onClick={handleNextSlide} 
                    disabled={currentIndex === files.length - 1}
                    title="Next File" 
                    className="secondaryBtnClassname"
                    size="small"
                  >
                    <ChevronRight  size={18} />
                  </IconButton>
                </>
              )}

              <IconButton onClick={() => setFullWidth(!fullWidth)} title="Toggle Fullscreen" className="docs-icon secondaryBtnClassname">
                {fullWidth ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>

              <Button onClick={handleZoomIn} title="Zoom In" className='secondaryBtnClassname'>
                <ZoomIn size={18} />
              </Button>
              <Button onClick={handleZoomOut} title="Zoom Out" className='secondaryBtnClassname'>
                <ZoomOut size={18} />
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                className="download-btn buttonClassname"
              >
                Download
              </Button>

              <IconButton onClick={closeModal} className="docs-close-icon" title="Close">
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

          {/* Preview Area with Swiper */}
          <Box flexGrow={1} sx={{ overflow: 'hidden', position: 'relative' }}>
            {files.length > 1 ? (
              <Swiper
                modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                spaceBetween={0}
                slidesPerView={1}
                initialSlide={initialSlideIndex}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                keyboard={{
                  enabled: true,
                }}
                mousewheel={{
                  forceToAxis: true,
                }}
                onSlideChange={handleSlideChange}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                className="docs-viewer-swiper"
                style={{ width: '100%', height: '100%' }}
              >
                {files.map((file, index) => (
                  <SwiperSlide key={index} style={{ height: '100%' }}>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      {renderFileContent(file, index === currentIndex ? zoom : 1)}
                    </Box>
                  </SwiperSlide>
                ))}
                
                {/* Custom Navigation Buttons */}
                <Box
                  className="swiper-button-prev-custom"
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    cursor: 'pointer',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    },
                  }}
                >
                  <ChevronLeft  />
                </Box>
                <Box
                  className="swiper-button-next-custom"
                  sx={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    cursor: 'pointer',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    },
                  }}
                >
                  <ChevronRight  />
                </Box>
              </Swiper>
            ) : (
              // Single file display (backward compatibility)
              <Box sx={{ width: '100%', height: '100%' }}>
                {files.length > 0 && renderFileContent(files[0], zoom)}
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DocsViewerModal;