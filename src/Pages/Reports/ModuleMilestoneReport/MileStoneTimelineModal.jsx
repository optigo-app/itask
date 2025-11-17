import { Box, IconButton, Modal, Tooltip, Typography } from '@mui/material';
import { Maximize2, Minimize2 } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import MilestoneTimeline from '../../../Components/Project/Dashboard/MilestoneTimeline';

const MileStoneTimelineModal = ({ selectedModule, setSelectedModule, isFullscreen, setIsFullscreen }) => {
  return (
     <Modal
                open={Boolean(selectedModule)}
                onClose={() => {
                    setSelectedModule(null);
                    setIsFullscreen(false);
                }}
                className="docs-viewer-modal"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: isFullscreen ? '0%' : '5%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: isFullscreen ? '100%' : '80%',
                        height: isFullscreen ? '100%' : '85vh',
                        bgcolor: 'background.paper',
                        borderRadius: isFullscreen ? 0 : 2,
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
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    padding: isFullscreen && '0px 10px 0 10px',
                                    flex: 1,
                                    minWidth: 0,
                                }}
                            >
                                {selectedModule?.moduleName || 'Milestone Timeline'}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <Tooltip title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'} arrow>
                                <IconButton
                                    onClick={() => setIsFullscreen((prev) => !prev)}
                                    className="secondaryBtnClassname"
                                    size="small"
                                >
                                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Close (Escape)" arrow>
                                <IconButton
                                    onClick={() => {
                                        setSelectedModule(null);
                                        setIsFullscreen(false);
                                    }}
                                    className="docs-close-icon"
                                    size="small"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Divider */}
                    <div
                        style={{
                            margin: '10px 0',
                            border: '1px dashed #7d7f85',
                            opacity: 0.3,
                        }}
                    />

                    {/* Keyboard Shortcuts Help */}
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#7d7f85', fontSize: '11px' }}>
                            Keyboard: <strong>F</strong> Fullscreen | <strong>Esc</strong> Close
                        </Typography>
                    </Box>

                    {/* Timeline Content - scrollable when content is large */}
                    <Box
                        flexGrow={1}
                        sx={{
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            mt: 1,
                        }}
                    >
                        {selectedModule && (
                            <MilestoneTimeline
                                milestoneData={{ [selectedModule.taskid]: selectedModule.milestones }}
                                decodedData={{ taskid: selectedModule.taskid, projectid: selectedModule.projectid }}
                            />
                        )}
                    </Box>
                </Box>
            </Modal>
  )
}

export default MileStoneTimelineModal