import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Grid, IconButton, Typography, Box, Tooltip } from '@mui/material';
import { Clipboard, CloudDownload, Link } from 'lucide-react';
import pdfIcon from '../../Assests/pdf.png';
import sheetIcon from '../../Assests/xls.png';
import Document from '../../Assests/document.png'
import { ContentCopy } from '@mui/icons-material';
import { toast } from 'react-toastify';

const AttachmentGrid = ({ uploadedFile, selectedFolder }) => {
    const attachments = uploadedFile?.attachment?.[selectedFolder] || [];
    const urlData = uploadedFile?.url?.[selectedFolder] || [];

    const handleCopy = async (url) => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success('URL copied to clipboard!')
        } catch (err) {
            toast.error('Failed to copy:', err)
        }
    }

    const getFilePreview = (url, extension) => {
        const ext = extension?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
            return url; // show actual image
        } else if (ext === 'pdf') {
            return pdfIcon;
        } else if (ext === 'xlsx' || ext === 'xls') {
            return sheetIcon;
        } else {
            return Document;
        }
    };

    return (
        <Grid item xs={12} mt={1}>
            <Grid container spacing={2}>
                {attachments?.map((item, index) => {
                    const extension = item.fileName?.split('.').pop();
                    const previewImage = getFilePreview(item.url, extension);

                    return (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card className="attachment-card" sx={{ position: 'relative', borderRadius: 2, p: 1 }}>
                                <CardMedia
                                    component="img"
                                    image={previewImage}
                                    alt={item.fileName}
                                    sx={{
                                        height: 120,
                                        objectFit: 'contain',
                                        borderRadius: 2,
                                        filter: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']?.includes(extension) ? 'none' : 'opacity(.5)'
                                    }}
                                />
                                <CardContent sx={{ p: 0.5, pt: 1 }}>
                                    <Typography variant="body2" noWrap fontWeight={500}>
                                        {item.fileName}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1 }}>
                                    <IconButton
                                        sx={{
                                            backgroundColor: '#fff',
                                            borderRadius: '50%',
                                            boxShadow: 1,
                                            '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                            },
                                        }}
                                        onClick={() => window.open(item.url, '_blank')}
                                    >
                                        <CloudDownload size={18} color='#7367f0' />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}

            </Grid>
            {/* Display the URL if exists for selected folder */}
            {urlData.length > 0 && (
                <Box mt={2}>
                    <Typography variant="h6">Project Reference URL(s):</Typography>
                    <Grid container spacing={1}>
                        {urlData?.map((url, index) => (
                            <Grid item xs={12} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Link size={18} color="#7367f0" />
                                    <Typography
                                        variant="body2"
                                        component="a"
                                        href={url}
                                        target="_blank"
                                        sx={{ color: '#7367f0', textDecoration: 'none', flexGrow: 1 }}
                                    >
                                        {url}
                                    </Typography>
                                    <IconButton size="small" onClick={() => handleCopy(url)}>
                                        <Clipboard size={16} />
                                    </IconButton>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Grid>
    );
};

export default AttachmentGrid;
