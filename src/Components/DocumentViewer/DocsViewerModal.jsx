import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Button,
  ButtonGroup,
  Chip,
  Tooltip,
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
  const files = attachments.length > 0 ? attachments : (fileData ? [fileData] : []);
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [zoom, setZoom] = useState(1);
  const [fullWidth, setFullWidth] = useState(false);
  const swiperRef = useRef(null);
  const currentFile = files[currentIndex] || {};
  const { url, filename, extension, fileObject } = currentFile;
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

  const handleDownload = () => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.25));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleSlideChange = useCallback((swiper) => {
    setCurrentIndex(swiper.activeIndex);
    setZoom(1);
  }, []);

  const handlePrevSlide = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  }, []);

  const handleNextSlide = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }, []);

  const handleFirstSlide = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, []);

  const handleLastSlide = useCallback(() => {
    if (swiperRef.current && files.length > 0) {
      swiperRef.current.slideTo(files.length - 1);
    }
  }, [files.length]);

  const toggleFullWidth = useCallback(() => {
    setFullWidth(prev => !prev);
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (!modalOpen) return;

    const keyActions = {
      '+': handleZoomIn,
      '=': handleZoomIn,
      '-': handleZoomOut,
      '_': handleZoomOut,
      '0': handleResetZoom,
      'f': toggleFullWidth,
      'F': toggleFullWidth,
      'Escape': closeModal,
      'Home': handleFirstSlide,
      'End': handleLastSlide,
    };

    const action = keyActions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }, [
    modalOpen,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    toggleFullWidth,
    closeModal,
    handleFirstSlide,
    handleLastSlide,
  ]);

  const handleWheel = useCallback((event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)));
    }
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      const modalElement = document.querySelector('.docs-viewer-modal');
      if (modalElement) {
        modalElement.addEventListener('wheel', handleWheel, { passive: false });
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (modalElement) {
          modalElement.removeEventListener('wheel', handleWheel);
        }
      };
    }
  }, [modalOpen, handleKeyDown, handleWheel]);

  useEffect(() => {
    if (modalOpen) {
      setCurrentIndex(initialSlideIndex);
      setZoom(1);
      if (swiperRef.current && initialSlideIndex > 0) {
        setTimeout(() => {
          swiperRef.current.slideTo(initialSlideIndex, 0);
        }, 100);
      }
    }
  }, [modalOpen, initialSlideIndex]);

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
      <Modal open={modalOpen} onClose={closeModal} className="docs-viewer-modal">
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

              <Tooltip title="Zoom In (+ or Ctrl+Wheel Up)" arrow>
                <Button onClick={handleZoomIn} className='secondaryBtnClassname'>
                  <ZoomIn size={18} />
                </Button>
              </Tooltip>

              <Tooltip title="Reset Zoom (0)" arrow>
                <Button onClick={handleResetZoom} className='secondaryBtnClassname'>
                  100%
                </Button>
              </Tooltip>

              <Tooltip title="Zoom Out (- or Ctrl+Wheel Down)" arrow>
                <Button onClick={handleZoomOut} className='secondaryBtnClassname'>
                  <ZoomOut size={18} />
                </Button>
              </Tooltip>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                className="download-btn buttonClassname"
              >
                Download
              </Button>

              <Tooltip title="Close (Escape)" arrow>
                <IconButton onClick={closeModal} className="docs-close-icon">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
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

          {/* Keyboard Shortcuts Help */}
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ color: '#7d7f85', fontSize: '11px' }}>
              Keyboard: <strong>+/-</strong> Zoom | <strong>0</strong> Reset | <strong>F</strong> Fullscreen | <strong>Home/End</strong> First/Last | <strong>Esc</strong> Close | <strong>Ctrl+Wheel</strong> Zoom
            </Typography>
          </Box>

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
                <Tooltip title="Previous" arrow placement="left">
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
                </Tooltip>
                <Tooltip title="Next" arrow placement="right">
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
                </Tooltip>
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