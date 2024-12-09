import React from 'react';
import { Card, CardContent, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { formatDate } from '../../Utils/globalfun';

const CommentList = ({ comments }) => {
    return (
        <Card className="HomePageCom">
            <CardContent sx={{ padding: '0', paddingBottom: '0 !important' }}>
                <Typography className='cardTitle' component="div" variant="h5">
                    Comments
                </Typography>
                <List className='muiList'>
                    {comments?.map((comment) => (
                        <ListItem key={comment.commentId} alignItems="flex-start" className='commentListItem'>
                            <ListItemAvatar>
                                <Avatar src={comment.author.image}>
                                    {!comment.author.image && comment.author.name.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={comment.author.name}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textPrimary">
                                            {comment.commentText}
                                        </Typography>
                                        <br />
                                        {comment.createdAt && formatDate(comment.createdAt)}
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
