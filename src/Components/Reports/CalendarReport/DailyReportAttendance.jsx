import React from 'react';
import { IconButton, Box } from '@mui/material';
import { CheckCircle, Circle } from 'lucide-react';
import AssigneeAvatarGroup from '../../ShortcutsComponent/Assignee/AssigneeAvatarGroup';

const DailyReportAttendance = ({ 
    checked, 
    isToday, 
    disabled, 
    onCheckClick, 
    assignees = [], 
    onAvatarClick,
    showCheckbox = true,
    iconSize = 18,
    avatarSize = 26
}) => {
    return (
        <Box 
            className="calendar-day-header-right" 
            sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
            }}
        >
            {showCheckbox && (
                <div className="calendar-day-header-right-center">
                    <IconButton
                        disabled={disabled || !isToday}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onCheckClick) onCheckClick(e);
                        }}
                        className={`attn-attendance-btn ${checked ? 'is-checked' : 'not-checked'}`}
                        sx={{
                            padding: '4px',
                            width: '32px',
                            height: '32px',
                            backgroundColor: checked ? '#7367f0 !important' : '#fff !important',
                            color: checked ? '#fff !important' : '#9e9e9e !important',
                            border: checked ? 'none !important' : '1px solid #e0e0e0 !important',
                            '&:hover': {
                                backgroundColor: checked ? '#5a52d5 !important' : 'rgba(115, 103, 240, 0.1) !important',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.5,
                            }
                        }}
                        title={isToday ? "Mark attendance (optional remark)" : ""}
                    >
                        {checked ? <CheckCircle size={iconSize} /> : <Circle size={iconSize} />}
                    </IconButton>
                </div>
            )}
            <div className="calendar-day-header-right-right">
                <AssigneeAvatarGroup
                    assignees={assignees}
                    task={{ parentid: 0 }}
                    maxVisible={1}
                    showAddButton={false}
                    onAvatarClick={onAvatarClick}
                    size={avatarSize}
                    spacing={0.25}
                />
            </div>
        </Box>
    );
};

export default DailyReportAttendance;
