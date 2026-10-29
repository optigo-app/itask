import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRecoilState } from 'recoil';
import { liveNotificationStack } from '../../Recoil/atom';
import NotificationToast from './NotificationToast';
import './NotificationStack.scss';

const MAX_DEPTH = 3;      // cards visible in the collapsed stack (front + peeks)
const MAX_ITEMS = 5;      // hard cap — extras are dropped visually until slots free
const PEEK_PX = 14;       // vertical offset per sheet peeking below the front card

/**
 * Stacked notification cards — bottom-right, newest on top with sheets
 * peeking below (ref-image style). Hover expands the stack into a list.
 * Each card auto-dismisses after its expiresAt; hover pauses expiry.
 */
const NotificationStack = () => {
    const [live, setLive] = useRecoilState(liveNotificationStack);
    const [hovered, setHovered] = useState(false);
    const hoverRef = useRef(false);
    hoverRef.current = hovered;

    // Expiry sweeper — paused while the user is hovering the stack
    useEffect(() => {
        const timer = setInterval(() => {
            if (hoverRef.current) return;
            const now = Date.now();
            setLive((prev) => {
                const next = prev.filter((n) => !n.expiresAt || n.expiresAt > now);
                return next.length === prev.length ? prev : next;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const remove = (id) =>
        setLive((prev) => prev.filter((n) => n.id !== id));

    if (!live.length) return null;

    const visible = live.slice(0, MAX_ITEMS);
    const maxDepth = Math.min(visible.length, MAX_DEPTH) - 1;
    const extraCount = Math.max(0, live.length - MAX_DEPTH);

    return createPortal(
        <div
            className="ntf-stack"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {visible.map((n, i) => {
                const hidden = i >= MAX_DEPTH;
                const lift = (maxDepth - i) * PEEK_PX;
                return (
                    <div
                        key={n.id}
                        className="ntf-stack-item"
                        data-hidden={hidden}
                        style={{
                            '--i': i,
                            transform: hidden
                                ? 'translateY(40px)'
                                : `translateY(-${lift}px)`,
                            opacity: hidden ? 0 : 1,
                            zIndex: 100 - i,
                            pointerEvents: hidden ? 'none' : 'auto',
                        }}
                    >
                        <NotificationToast
                            notification={n}
                            closeToast={() => remove(n.id)}
                        />
                    </div>
                );
            })}
            {!hovered && extraCount > 0 && (
                <div className="ntf-stack-more">+{extraCount} more</div>
            )}
        </div>,
        document.body
    );
};

export default NotificationStack;
