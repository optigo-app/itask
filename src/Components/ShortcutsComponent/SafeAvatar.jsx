import React, { useEffect, useState } from 'react';
import { Avatar, Skeleton } from '@mui/material';

// Drop-in replacement for MUI <Avatar> for person images.
// - Skeleton pulse while the image is being fetched
// - On load failure, falls straight back to children (initials) —
//   the browser's broken-image icon is never painted.
const SafeAvatar = ({ src, alt, children, sx = {}, ...rest }) => {
    const hasSrc = Boolean(src);
    const [status, setStatus] = useState(hasSrc ? 'loading' : 'none');

    useEffect(() => {
        if (!src) {
            setStatus('none');
            return;
        }
        setStatus('loading');
        const img = new Image();
        img.onload = () => setStatus('loaded');
        img.onerror = () => setStatus('error');
        img.src = src;
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    if (status === 'loading') {
        const w = sx?.width ?? 40;
        const h = sx?.height ?? w;
        return (
            <Skeleton
                variant="circular"
                animation="wave"
                width={w}
                height={h}
                sx={{ flexShrink: 0 }}
            />
        );
    }

    return (
        <Avatar
            alt={alt}
            src={status === 'loaded' ? src : undefined}
            sx={sx}
            {...rest}
        >
            {children}
        </Avatar>
    );
};

export default SafeAvatar;
