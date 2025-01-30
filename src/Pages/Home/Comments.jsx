import React from 'react';
import { Card, CardContent, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { formatDate, getRandomAvatarColor } from '../../Utils/globalfun';

const CommentList = ({ comments }) => {

    const background = (team) => {
        const avatarBackgroundColor = team?.image
            ? "transparent"
            : getRandomAvatarColor(team?.name);
        return avatarBackgroundColor;
    }

    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Comments
                </Typography>
                {/* <div className="itask_separator" /> */}
                <List className='muiList'>
                    {comments?.map((comment) => (
                        <ListItem key={comment.commentId} alignItems="flex-start" className='commentListItem'>
                            <ListItemAvatar>
                                <Avatar
                                    src={comment?.author?.image}
                                    sx={{
                                        background: background(comment?.author),
                                        transition: 'transform 0.3s ease-in-out',
                                        width: 35,
                                        height: 35,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                        }
                                    }}
                                >
                                    {!comment.author.image && comment.author.name.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {comment.author.name}
                                        </Typography>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {comment.createdAt && formatDate(comment.createdAt)}
                                        </Typography>
                                    </div>
                                }
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {comment.commentText}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default CommentList;
