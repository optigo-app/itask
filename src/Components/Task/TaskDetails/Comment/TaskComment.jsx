import React, { useState } from 'react';
import {Box, IconButton, TextareaAutosize, Button } from '@mui/material';
import { Eye, Paperclip, Send } from 'lucide-react';
import CommentCard from './CommentCard';

const CommentSection = ({ comments, newComment, onCommentChange, onEditComment, onDeleteComment, onSendComment }) => {
    console.log('comments: ', comments);
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
            {comments.map((comment, index) => (
                <CommentCard key={index} comment={comment} onEditComment={onEditComment} onDeleteComment={onDeleteComment} />
            ))}

            {/* Add New Comment Section */}
            <Box sx={{ position: 'sticky', bottom: '0', background: '#fff', padding: '10px', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '12px' }}>
                <TextareaAutosize
                    value={newComment}
                    onChange={onCommentChange}
                    rows={4}
                    placeholder="Add a comment..."
                    className="textarea"
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
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
                                <Paperclip size={20} color='#7367f0' />
                            </IconButton>
                        </label>
                        {selectedFile && (
                            <IconButton onClick={() => window.open(filePreview, '_blank')}>
                                <Eye size={20} color='#7367f0' />
                            </IconButton>
                        )}
                    </Box>
                    <Button
                        size='small'
                        variant="contained"
                        onClick={onSendComment}
                        startIcon={<Send size={20} />}
                        className='buttonClassname'
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default CommentSection;
