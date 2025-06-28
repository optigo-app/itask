import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { MessageSquare } from "lucide-react";
import "./Styles/Comments.scss";
import AnnouncementCard from "../../ShortcutsComponent/AnouncementCard/AnnouncementCard";
import { taskCommentGetApi } from "../../../Api/TaskApi/TaskCommentGetApi";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";

const Comments = ({comments, isCommentLoading }) => {
    return (
        <div className="comments-container">
            <Box className="comment_list">
                {isCommentLoading ? (
                    <LoadingBackdrop isLoading={isCommentLoading} />
                ) : comments.length > 0 ? (
                    comments?.map((comment) => (
                        <AnnouncementCard key={comment.id} announcement={comment} />
                    ))
                ) : (
                    <Box className="no-comments-box">
                        <MessageSquare size={48} color="#aaa" />
                        <Typography variant="body1" sx={{ mt: 1, color: '#666' }}>
                            No comments found
                        </Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default Comments;
