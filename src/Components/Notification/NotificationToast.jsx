import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { X, BellRing } from 'lucide-react';
import SafeAvatar from '../ShortcutsComponent/SafeAvatar';
import './NotificationToast.scss';

const NotificationToast = ({ notification, closeToast }) => {
    const n = notification;

    const dismiss = () => closeToast?.();

    return (
        <Box className="ntf-toast" onClick={() => n.link && (window.location.href = n.link)}>
            <Box className="ntf-toast-head">
                {n.avatar ? (
                    <SafeAvatar src={n.avatar.startsWith?.('http') ? n.avatar : undefined} alt={n.title} sx={{ width: 34, height: 34 }}>
                        {String(n.avatar).slice(0, 2).toUpperCase()}
                    </SafeAvatar>
                ) : (
                    <Box className="ntf-doc-icon" sx={{ backgroundColor: `${n.color}1a`, color: n.color }}>
                        <BellRing size={18} />
                    </Box>
                )}
                <Typography className="ntf-eyebrow">
                    {n.eyebrow}
                    {n.tag ? <> • <span>{n.tag}</span></> : null}
                    {n.time ? ` • ${n.time}` : ''}
                </Typography>
                <Chip label={n.tag} size="small" className="ntf-tag"
                    sx={{ backgroundColor: `${n.color}1a`, color: n.color }} />
                <Box className="ntf-toast-icons">
                    <IconButton size="small" className="ntf-icon-btn" onClick={dismiss} aria-label="close">
                        <X size={14} />
                    </IconButton>
                </Box>
            </Box>

            <Typography className="ntf-title">{n.title}</Typography>
            {!!n.message && <Typography className="ntf-message">{n.message}</Typography>}
        </Box>
    );
};

export default NotificationToast;
