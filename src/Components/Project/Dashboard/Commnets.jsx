import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { MessageSquare } from "lucide-react";
import "./Styles/Comments.scss";
import AnnouncementCard from "../../ShortcutsComponent/AnouncementCard/AnnouncementCard";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";

const Comments = ({ comments, isCommentLoading }) => {
    const sortedComments = useMemo(
        () =>
            [...(comments || [])].sort(
                (a, b) => new Date(b?.entrydate) - new Date(a?.entrydate)
            ),
        [comments]
    );

    return (
        <div className="comments-container">
            <Box className="comment_list">
                {isCommentLoading ? (
                    <LoadingBackdrop isLoading={isCommentLoading} />
                ) : sortedComments.length > 0 ? (
                    sortedComments.map((comment) => (
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
