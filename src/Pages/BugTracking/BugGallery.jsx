import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, Typography, Tooltip, Badge } from '@mui/material';
import { Image as ImageIcon, Trash2, X, Upload, Plus } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';

// Custom styles for Swiper navigation buttons
const swiperButtonStyles = `
  .swiper-button-next, .swiper-button-prev {
    color: #7367f0 !important;
    background: rgba(255, 255, 255, 0.9);
    width: 40px !important;
    height: 40px !important;
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
  }
  .swiper-button-next:after, .swiper-button-prev:after {
    font-size: 18px !important;
    font-weight: bold;
  }
  .swiper-button-next:hover, .swiper-button-prev:hover {
    background: #fff;
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
  }
  .swiper-button-disabled {
    opacity: 0.5 !important;
    transform: none !important;
  }
`;

const BugGallery = ({
  selectedTask,
  bugs,
  selectedBugId,
  onUploadClick,
  onSelectBug,
  onDeleteSelected,
  isCreatingNew,
  onNewBugClick,
  onCancelNew,
  onDragOver,
  onDrop,
}) => {
  const mainSwiperRef = useRef(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const bugArray = useMemo(() => (Array.isArray(bugs) ? bugs : []), [bugs]);
  const selectedIndex = useMemo(() => {
    if (!selectedBugId) return 0;
    const idx = bugArray.findIndex((b) => String(b?.bugId) === String(selectedBugId));
    return idx >= 0 ? idx : 0;
  }, [bugArray, selectedBugId]);

  useEffect(() => {
    if (!mainSwiperRef.current) return;
    if (!bugArray?.length) return;
    mainSwiperRef.current.slideTo(selectedIndex);
  }, [selectedIndex, bugArray?.length]);

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDeleteSelected();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <style>{swiperButtonStyles}</style>
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <Tooltip title="Delete Bug Report" arrow>
          <IconButton
            size="small"
            onClick={handleDeleteClick}
            disabled={!selectedTask || !selectedBugId || isCreatingNew}
            sx={{
              borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              color: '#ff4c51',
              padding: '8px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#ff4c51',
                color: '#fff',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(255, 76, 81, 0.4)'
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255,255,255,0.5)',
                color: '#ccc'
              }
            }}
          >
            <Trash2 size={20} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selectedTask && bugArray.length > 0 ? (
          <Box sx={{ width: '100%', height: '100%', borderRadius: 4, overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Swiper
              modules={[Navigation, Thumbs, Keyboard]}
              navigation
              keyboard={{ enabled: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              onSwiper={(swiper) => {
                mainSwiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                if (isCreatingNew && swiper.activeIndex === 0) {
                  // New bug slide, do nothing
                } else {
                  const bugIndex = isCreatingNew ? swiper.activeIndex - 1 : swiper.activeIndex;
                  const bug = bugArray[bugIndex];
                  if (bug) onSelectBug(bug);
                }
              }}
              style={{ width: '100%', height: '100%' }}
            >
              {isCreatingNew && (
                <SwiperSlide key="new-bug">
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa',
                      p: 2,
                      position: 'relative'
                    }}
                  >
                    <IconButton
                      onClick={onCancelNew}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'white' }
                      }}
                    >
                      <X size={20} />
                    </IconButton>
                    <Box
                      sx={{
                        border: '2px dashed #e0e0e0',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: '#fafafa',
                        '&:hover': { borderColor: '#7367f0', bgcolor: '#f5f5f9' },
                        position: 'relative',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      onClick={() => document.getElementById('gallery-upload').click()}
                    >
                      <input
                        type="file"
                        id="gallery-upload"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            onNewBugClick(file);
                            onCancelNew();
                            e.target.value = null; // reset
                          }
                        }}
                      />
                      <Upload size={48} color="#999" />
                      <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
                        Drop Image or Click to Upload
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Drag and drop an image here or click to browse files
                      </Typography>
                    </Box>
                  </Box>
                </SwiperSlide>
              )}
              {bugArray.map((bug) => (
                <SwiperSlide key={bug?.bugId}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectBug(bug)}
                  >
                    {bug?.imageDataUrl ? (
                      <img
                        src={bug.imageDataUrl}
                        alt={bug?.bugtitle || 'Bug'}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        <ImageIcon size={64} />
                        <Typography variant="body2" sx={{ mt: 1 }}>No Image</Typography>
                      </Box>
                    )}
                    {bug.isDraft && (
                      <Typography variant="caption" sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.8)', color: '#333', padding: '2px 6px', borderRadius: 1, fontSize: '0.7rem' }}>
                        Draft
                      </Typography>
                    )}
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.4 }}>
            <ImageIcon size={64} strokeWidth={1.5} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
              {selectedTask ? 'No bugs reported yet' : 'Select a task to view bugs'}
            </Typography>
          </Box>
        )}
      </Box>

      {selectedTask && bugArray.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={10}
            watchSlidesProgress
            style={{ width: '100%', padding: '4px' }}
          >
            {isCreatingNew && (
              <SwiperSlide key="new-thumb" style={{ width: 'auto' }}>
                <Tooltip title="New Bug" placement="top" arrow>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      border: '2px dashed #7367f0',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f9',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Plus size={24} color="#7367f0" />
                  </Box>
                </Tooltip>
              </SwiperSlide>
            )}
            {bugArray.map((bug) => (
              <SwiperSlide key={bug?.bugId} style={{ width: 'auto' }}>
                <Tooltip title={bug?.bugtitle || 'Bug'} placement="top" arrow>
                  {bug.isDraft ? (
                    <Badge badgeContent="Draft" anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ '& .MuiBadge-badge': { top: 10, right: 17, fontSize: '0.6rem', height: 18, minWidth: 30, backgroundColor: 'rgba(255,255,255,0.8)', color: '#333' } }}>
                      <Box
                        onClick={() => onSelectBug(bug)}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          border: String(bug?.bugId) === String(selectedBugId) ? '2px solid #7367f0' : '2px solid transparent',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          backgroundColor: '#fff',
                          boxShadow: String(bug?.bugId) === String(selectedBugId) ? '0 4px 10px rgba(115, 103, 240, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {bug?.imageDataUrl ? (
                          <img
                            src={bug.imageDataUrl}
                            alt={bug?.bugtitle || 'Bug'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f5fa' }} />
                        )}
                      </Box>
                    </Badge>
                  ) : (
                    <Box
                      onClick={() => onSelectBug(bug)}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        border: String(bug?.bugId) === String(selectedBugId) ? '2px solid #7367f0' : '2px solid transparent',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        boxShadow: String(bug?.bugId) === String(selectedBugId) ? '0 4px 10px rgba(115, 103, 240, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {bug?.imageDataUrl ? (
                        <img
                          src={bug.imageDataUrl}
                          alt={bug?.bugtitle || 'Bug'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f5fa' }} />
                      )}
                    </Box>
                  )}
                </Tooltip>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmDelete}
        title="Delete Bug Report?"
        content="Are you sure you want to delete this bug report? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </Box>
  );
};

export default BugGallery;
