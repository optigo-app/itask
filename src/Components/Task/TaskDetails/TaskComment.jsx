import React, { useState } from 'react';
import { Card, Grid, Typography, Box, IconButton, TextareaAutosize } from '@mui/material';
import { Eye, Paperclip, Send } from 'lucide-react';
import { formatDate3 } from '../../../Utils/globalfun';

const CommentSection = ({ comments, newComment, onCommentChange, onSendComment }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            {/* Mapping through multiple comments */}
            {comments?.map((comment, index) => (
                <Card key={index} className="comment-card" sx={{ marginBottom: 2, padding: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                            {/* Title and Description */}
                            <Typography variant="h6">{comment?.comment}</Typography>
                            <Typography variant="body1">{comment?.description}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                            {/* Date/Time */}
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px !important' }}>
                                {formatDate3(comment?.entrydate)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>
            ))}

            {/* Add New Comment Section */}
            <Box sx={{ position: 'sticky', bottom: '0', background: '#fff', padding: '10px', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '12px'  }}>
                <TextareaAutosize
                    value={newComment}
                    onChange={onCommentChange}
                    rows={4}
                    placeholder="Add a comment..."
                    className="textarea"
                    style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <Box>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <IconButton component="span">
                                <Paperclip size={25} color='#7367f0' />
                            </IconButton>
                        </label>
                        {selectedFile && (
                            <IconButton onClick={() => window.open(filePreview, '_blank')}>
                                <Eye size={25} color='#7367f0' />
                            </IconButton>
                        )}
                    </Box>
                    <IconButton onClick={onSendComment}>
                        <Send size={25} color='#7367f0' />
                    </IconButton>
                </Box>
            </Box>
        </>
    );
};

export default CommentSection;
