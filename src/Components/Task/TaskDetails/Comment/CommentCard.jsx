import React from "react";
import { Card, Grid, Typography, Box, IconButton, Avatar } from "@mui/material";
import { Download, MoreVertical } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import { formatDate3, getRandomAvatarColor } from "../../../../Utils/globalfun";
import './style.scss';

const CommentCard = ({ comment }) => {
    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };
    return (
        <Card className="commentCard">
            <Grid container spacing={2} alignItems="start">
                {/* User Profile & Name */}
                <Grid item>

                    {/* <Avatar src={comment?.userImage} alt={comment?.user?.name} /> */}
                    <Avatar
                        alt={comment?.user?.name}
                        src={comment?.user?.avatar || null}
                        sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: background(comment?.user?.name),
                        }}
                    >
                        {!comment?.user?.avatar && comment?.user?.name?.charAt(0)}
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography className="title">
                        {comment?.user?.name}
                    </Typography>
                    <Typography className="caption">
                        {formatDate3(comment?.entrydate)}
                    </Typography>
                </Grid>
                <Grid item>
                    <IconButton>
                        <MoreVertical size={18} />
                    </IconButton>
                </Grid>
            </Grid>

            {/* Comment Text */}
            <Typography variant="body1" sx={{ marginTop: 1, color: "#444" }}>
                {comment?.comment}
            </Typography>

            {/* Attachment Section */}
            {comment.attachments?.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        background: "#EEF7FF",
                        borderRadius: "8px",
                        padding: "10px",
                        marginTop: 2,
                    }}
                >
                    <DescriptionIcon sx={{ color: "#007BFF", fontSize: 32 }} />
                    <Box sx={{ flexGrow: 1, marginLeft: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {comment.attachments[0].filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Preview File {comment.attachments[0].size}
                        </Typography>
                    </Box>
                    <IconButton component="a" href={comment.attachments[0].url} download>
                        <Download size={20} />
                    </IconButton>
                </Box>
            )}
        </Card>
    );
};

export default CommentCard;
