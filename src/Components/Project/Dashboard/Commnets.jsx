import React, { useState } from "react";
import { Box, IconButton, Button, TextareaAutosize } from "@mui/material";
import { Paperclip, Eye, Send } from "lucide-react";
import CommentCard from "../../Task/TaskDetails/Comment/CommentCard";
import "./Styles/Comments.scss";
import commentsData from "../../../Data/commentsData";

const Comments = () => {
    const [comments, setComments] = useState(commentsData);
    const [newComment, setNewComment] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState("");

    const onCommentChange = (e) => setNewComment(e.target.value);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const onSendComment = () => {
        if (!newComment.trim() && !selectedFile) return;

        const newCommentData = {
            id: comments.length + 1,
            text: newComment,
            file: selectedFile ? filePreview : null,
        };

        setComments([...comments, newCommentData]);
        setNewComment("");
        setSelectedFile(null);
        setFilePreview("");
    };

    const onEditComment = (id, updatedText) => {
        setComments(comments.map((comment) => (comment.id === id ? { ...comment, text: updatedText } : comment)));
    };

    const onDeleteComment = (id) => {
        setComments(comments.filter((comment) => comment.id !== id));
    };

    return (
        <div className="comments-container">
                <Box className="comment_list">
                    {comments.map((comment) => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            onEditComment={onEditComment}
                            onDeleteComment={onDeleteComment}
                        />
                    ))}
                </Box>

                {/* Sticky Comment Box */}
                <Box className="comment-box">
                    <TextareaAutosize
                        value={newComment}
                        onChange={onCommentChange}
                        rows={4}
                        placeholder="Add a comment..."
                        className="textarea"
                    />
                    <Box className="comment-actions">
                        <Box>
                            <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="file-upload" />
                            <label htmlFor="file-upload">
                                <IconButton component="span">
                                    <Paperclip size={20} color="#7367f0" />
                                </IconButton>
                            </label>
                            {selectedFile && (
                                <IconButton onClick={() => window.open(filePreview, "_blank")}>
                                    <Eye size={20} color="#7367f0" />
                                </IconButton>
                            )}
                        </Box>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={onSendComment}
                            startIcon={<Send size={20} />}
                            className="buttonClassname"
                        >
                            Add comment
                        </Button>
                    </Box>
                </Box>
        </div>
    );
};

export default Comments;
