import React from 'react';
import { Card, CardContent, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { formatDate2, getAvatarColors, getInitials } from '../../Utils/globalfun';

const CommentList = ({ comments }) => {

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
                                        ...getAvatarColors(comment?.author),
                                        transition: 'transform 0.3s ease-in-out',
                                        width: 35,
                                        height: 35,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                        }
                                    }}
                                >
                                    {!comment.author.image && getInitials(comment.author.name)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {comment.author.name}
                                        </Typography>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {comment.createdAt && formatDate2(comment.createdAt)}
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
