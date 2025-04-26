import React, { useState } from "react";
import { Box, IconButton, Button, TextareaAutosize } from "@mui/material";
import { Paperclip, Eye, Send } from "lucide-react";
import CommentCard from "../../ShortcutsComponent/Comment/CommentCard";
import "./Styles/Comments.scss";
import commentsData from "../../../Data/commentsData";
import AnnouncementCard from "../../ShortcutsComponent/AnouncementCard/AnnouncementCard";

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
                        <AnnouncementCard
                            key={comment.id}
                            announcement={comment}
                            onEditComment={onEditComment}
                            onDeleteComment={onDeleteComment}
                        />
                    ))}
                </Box>
        </div>
    );
};

export default Comments;
