import React from 'react';
import { Card, CardContent, CardMedia, Grid, IconButton, Typography, Box } from '@mui/material';
import { CloudDownload, Link } from 'lucide-react';  // Import the Link icon
import placeholderImage from "../../Assests/Attachment.webp";

const AttachmentGrid = ({ uploadedFile, selectedFolder }) => {
    console.log('uploadedFile: ', uploadedFile);
    const attachments = uploadedFile?.attachment?.[selectedFolder] || [];
    const urlData = uploadedFile?.url?.[selectedFolder] || [];
    console.log('attachments: ', attachments);
    console.log('urlData: ', urlData);

    return (
        <Grid item xs={12} mt={1}>
            <Grid container spacing={2}>
                {attachments.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card className="attachment-card" sx={{ position: 'relative', borderRadius: 2, p: 1 }}>
                            <CardMedia
                                component="img"
                                className="attachment-image"
                                image={item.fileType.startsWith("image/") ? item.url : placeholderImage}
                                alt={item.fileName}
                                sx={{ height: 120, objectFit: 'cover', borderRadius: 2 }}
                            />
                            <CardContent sx={{ p: 0.5, pt: 1 }}>
                                <Typography variant="body2" noWrap fontWeight={500}>
                                    {item.fileName}
                                </Typography>
                            </CardContent>
                            <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1 }}>
                                {/* Download Button */}
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
                ))}
            </Grid>
            {/* Display the URL if exists for selected folder */}
            {urlData.length > 0 && (
                <Box mt={2}>
                    <Typography variant="h6">Project Reference URL(s):</Typography>
                    <Grid container spacing={1}>
                        {urlData.map((url, index) => (
                            <Grid item xs={12} sm={12} md={12} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Link size={18} color='#7367f0' />
                                    <Typography variant="body2" component="a" href={url} target="_blank" sx={{ color: '#7367f0', textDecoration: 'none' }}>
                                        {url}
                                    </Typography>
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
