import React from "react";
import { Card, Grid, Typography, Box, Avatar, Link } from "@mui/material";
import { Download } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import { formatDate4, getRandomAvatarColor, ImageUrl } from "../../../Utils/globalfun";
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
                    <Avatar
                        alt={comment?.assignee?.firstname}
                        src={ImageUrl(comment?.assignee)}
                        sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: background(comment?.assignee?.firstname + " " + comment?.assignee?.lastname),
                        }}
                    >
                        {!comment?.assignee?.avatar && comment?.assignee?.firstname?.charAt(0)}
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography className="title">
                        {comment?.assignee?.firstname + " " + comment?.assignee?.lastname}
                    </Typography>
                    <Typography className="caption">
                        {formatDate4(comment?.entrydate)}
                    </Typography>
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
                        marginTop: 2,
                    }}
                >
                    <DescriptionIcon sx={{ color: "#007BFF", fontSize: 20, marginRight: 1 }} />
                    <Link
                        href={comment.attachments[0].url}
                        download
                        underline="always"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#007BFF !important',
                            textDecorationColor: '#007BFF !important',
                            '&:hover': {
                                color: '#0056b3',
                                textDecorationColor: '#0056b3',
                            }
                        }}
                    >
                        {comment.attachments[0].filename}
                        <Download size={16} style={{ marginLeft: 4 }} />
                    </Link>
                </Box>
            )}

            {/* {comment.attachments?.length > 0 && (
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
            )} */}
        </Card>
    );
};

export default CommentCard;
