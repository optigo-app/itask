import React from 'react';
import {
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { CheckCircle, Delete, MarkEmailUnread } from '@mui/icons-material';
import './NotificationTable.scss';

const notifications = [
  {
    id: 1,
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    title: "Task Assigned: Design Homepage 🎨",
    message: "You have been assigned to design the homepage for Project X.",
    time: "2h ago",
    markAsUnread: true,
    hasActions: true,
  },
  {
    id: 2,
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    title: "Meeting Reminder 📅",
    message: "Don't forget the meeting scheduled for 3 PM today.",
    time: "4h ago",
    markAsUnread: false,
    hasActions: true,
  },
];

const NotificationTable = () => {
  const handleMarkAsRead = (id) => {
    console.log(`Marked as read: ${id}`);
  };

  const handleMarkAsUnread = (id) => {
    console.log(`Marked as unread: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Deleted notification: ${id}`);
  };

  return (
    <TableContainer component={Paper} className="notification-table">
      <Table>
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
                          <CheckCircle color="success" />
                        ) : (
                          <MarkEmailUnread color="primary" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(notif.id)}>
                        <Delete color="error" />
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
  );
};

export default NotificationTable;
