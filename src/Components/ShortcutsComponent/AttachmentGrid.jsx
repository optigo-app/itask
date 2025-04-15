import React from 'react';
import { Card, CardContent, CardMedia, Grid, IconButton, Typography } from '@mui/material';
import { CloudDownload } from 'lucide-react';

const AttachmentGrid = ({ count, placeholderImage }) => {
    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                {[...Array(count)]?.map((_, index) => (
                    <Grid item xs={6} key={index}>
                        <Card className="attachment-card">
                            <CardMedia
                                component="img"
                                className="attachment-image"
                                image={placeholderImage}
                                alt="Attachment"
                            />
                            <CardContent>
                                <Typography variant="body1">Attachment Name</Typography>
                                <Typography variant="body2" color="text.secondary">Details about the attachment</Typography>
                            </CardContent>
                            <IconButton sx={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                            }} component="span">
                                <CloudDownload size={25} color='#7367f0' />
                            </IconButton>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Grid>
    );
};

export default AttachmentGrid;
