import React from 'react'
import { ImageUrl, getAvatarColors, getInitials } from '../../Utils/globalfun'
import { AvatarGroup, Tooltip } from '@mui/material'
import SafeAvatar from './SafeAvatar'

const ReusableAvatar = ({ assineeData, width = 30, max = 5 }) => {
    return (
        <div>
            <AvatarGroup
                max={max}
                spacing={2}
                sx={{
                    justifyContent: 'start !important',
                    '& .MuiAvatar-root': {
                        width: width,
                        height: width,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.2)',
                            zIndex: 10,
                        },
                    },
                }}
            >
                {assineeData?.map((assignee, teamIdx) => (
                    <Tooltip
                        placement="top"
                        key={assignee?.id}
                        title={`${assignee?.firstname} ${assignee?.lastname}`}
                        arrow
                        classes={{ tooltip: 'custom-tooltip' }}
                    >
                        <SafeAvatar
                            key={teamIdx}
                            alt={`${assignee?.firstname} ${assignee?.lastname}`}
                            src={ImageUrl(assignee) || null}
                            sx={{
                                ...getAvatarColors(`${assignee?.firstname + " " + assignee?.lastname}`),
                            }}
                        >
                            {!assignee.avatar && getInitials(assignee?.firstname, assignee?.lastname)}
                        </SafeAvatar>
                    </Tooltip>
                ))}
            </AvatarGroup>
        </div>
    )
}

export default ReusableAvatar