import React from "react";
import { Card, Grid, Typography, Box, IconButton, Avatar, Link } from "@mui/material";
import { Download, MoreVertical } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import { formatDate3, getRandomAvatarColor, ImageUrl } from "../../../Utils/globalfun";
import './style.scss';

const AnnouncementCard = ({announcement}) => {
    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };
    return (
        <Card className="commentCard">
            <Grid container spacing={2} alignItems="start">
                <Grid item>
                    <Avatar
                        alt={announcement?.user?.firstname}
                        src={ImageUrl(announcement?.user)}
                        sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: background(announcement?.user?.firstname + ' ' + announcement?.user?.lastname),
                        }}
                    >
                        {!announcement?.user?.avatar && (announcement?.user?.firstname + ' ' + announcement?.user?.lastname)?.charAt(0)}
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography className="title">
                        {announcement?.user?.firstname + ' ' + announcement?.user?.lastname}
                    </Typography>
                    <Typography className="caption">
                        {formatDate3(announcement?.entrydate)}
                    </Typography>
                </Grid>
                {/* <Grid item>
                    <IconButton>
                        <MoreVertical size={18} />
                    </IconButton>
                </Grid> */}
            </Grid>

            {/* announcement Text */}
            <Typography variant="body1" sx={{ marginTop: 1, color: "#444" }}>
                {announcement?.announcement}
            </Typography>

            {/* Attachment Section */}
            {announcement.attachments?.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 2,
                    }}
                >
                    <DescriptionIcon sx={{ color: "#007BFF", fontSize: 20, marginRight: 1 }} />
                    <Link
                        href={announcement.attachments[0].url}
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
                        {announcement.attachments[0].filename}
                        <Download size={16} style={{ marginLeft: 4 }} />
                    </Link>
                </Box>
            )}
        </Card>
    );
};

export default AnnouncementCard;
