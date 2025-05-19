// App.jsx
import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const MuiDateTimePickerExample = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <DateTimePicker
          label="Select Date & Time"
          value={selectedDateTime}
          onChange={(newValue) => setSelectedDateTime(newValue)}
          ampm={true}
          format="DD/MM/YYYY hh:mm A"
          renderInput={(params) => <TextField fullWidth {...params} />}
        />

        <Typography sx={{ mt: 2 }}>
          ISO Format: {selectedDateTime ? selectedDateTime.toISOString() : ''}
        </Typography>
      </Box>
    </LocalizationProvider>
  );
};

export default MuiDateTimePickerExample;
