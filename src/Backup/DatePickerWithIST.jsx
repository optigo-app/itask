import React, { useState } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TextField from '@mui/material/TextField';

dayjs.extend(utc);
dayjs.extend(timezone);

const DatePickerISTFormat = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (date) => {
    setSelectedDate(date);

    if (date) {
      const istDate = date.tz('Asia/Kolkata');
      console.log("Selected Date in IST:", istDate.format('YYYY-MM-DDTHH:mm:ss.SSS'));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Pick a Date"
        value={selectedDate}
        onChange={handleChange}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};

export default DatePickerISTFormat;
