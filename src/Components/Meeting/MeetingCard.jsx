// src/components/MeetingCard.jsx
import React from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';

const MeetingCard = ({
  meeting,
  handleDrawerToggle,
  setCalFormData,
  StatusCircles,
  ImageUrl,
  background,
  handleAcceptMeeting,
  handleReject
}) => {
  return (
    <Card
      sx={{
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        minHeight: '190px',
      }}
    >
      <CardContent sx={{ paddingBottom: '16px !important' }}>
        <Box
          onClick={() => {
            handleDrawerToggle();
            setCalFormData(meeting);
          }}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              marginBottom: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '65%',
              color: '#6D6B77 !important',
            }}
          >
            {meeting.meetingtitle}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6D6B77 !important' }}>
            {dayjs(meeting.StartDate)?.format('DD MMM YYYY, hh:mm A')}
          </Typography>
        </Box>

        <div
          style={{
            margin: '10px 0',
            border: '1px dashed #7d7f85',
            opacity: 0.3,
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            {meeting.ProjectName && meeting.taskname && (
              <span style={{ color: '#6D6B77', fontWeight: 'bold' }}>
                {meeting.ProjectName}/{meeting.taskname}
              </span>
            )}
          </Typography>
          {StatusCircles(meeting, {redCount: 5, yellowCount: 10, greenCount: 50})}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#6D6B77 !important',
            textTransform: 'capitalize',
            marginBottom: '8px',
            mt: 0.5,
          }}
        >
          {meeting.Desc || '\u00A0'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <AvatarGroup max={10}
            spacing={2}
            sx={{
              '& .MuiAvatar-root': {
                width: 25,
                height: 25,
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: 'none',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.2)',
                  zIndex: 10
                }
              }
            }}
          >
            {meeting?.guests?.map((participant) => (
              <Tooltip
                placement="top"
                key={participant?.id}
                title={participant?.firstname + " " + participant?.lastname}
                arrow
                classes={{ tooltip: 'custom-tooltip' }}
              >
                <Avatar
                  key={participant?.id}
                  alt={participant?.firstname + " " + participant?.lastname}
                  src={ImageUrl(participant) || null}
                  sx={{
                    backgroundColor: background(participant),
                  }}
                >
                  {!participant.avatar && participant?.firstname?.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>

          {meeting?.isAction && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                href={meeting.link}
                target="_blank"
                className="buttonClassname"
                onClick={() => handleAcceptMeeting(meeting)}
              >
                Accept
              </Button>

              <Button
                variant="contained"
                onClick={() => handleReject(meeting)}
                className="secondaryBtnClassname"
              >
                Reject
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MeetingCard;
