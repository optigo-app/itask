import { Delete, MarkEmailUnread } from '@mui/icons-material'
import { Avatar, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material'
import { CheckCircle } from 'lucide-react'
import React from 'react'

const NotificationGrid = ({ notifications, handleMarkAsRead, handleMarkAsUnread, handleDelete }) => {
    return (
        <div>
            <TableContainer component={Paper} className="notification-table-container">
                <Table className='notification_table'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Avatar</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notifications.map((notif) => (
                            <TableRow
                                key={notif.id}
                                className={notif.markAsUnread ? 'unread' : 'read'}
                            >
                                <TableCell>
                                    <Avatar src={notif.avatar} alt="avatar" />
                                </TableCell>
                                <TableCell>{notif.title}</TableCell>
                                <TableCell>{notif.message}</TableCell>
                                <TableCell>{notif.time}</TableCell>
                                <TableCell align="right">
                                    {notif.hasActions && (
                                        <>
                                            <Tooltip title={notif.markAsUnread ? 'Mark as Read' : 'Mark as Unread'}>
                                                <IconButton
                                                    onClick={() =>
                                                        notif.markAsUnread
                                                            ? handleMarkAsRead(notif.id)
                                                            : handleMarkAsUnread(notif.id)
                                                    }
                                                >
                                                    {notif.markAsUnread ? (
                                                        <CheckCircle />
                                                    ) : (
                                                        <MarkEmailUnread />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => handleDelete(notif.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default NotificationGrid