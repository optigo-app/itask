import React, { useState } from 'react'
import PendingAcceptanceDrawer from '../Components/ShortcutsComponent/Notification/PendingAcceptanceDrawer'
import { Button } from '@mui/material';
import CustomDateRangePicker from '../Components/ShortcutsComponent/DateRangePicker';

const SampleTaskTable = () => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  const handleDateChange = (range) => {
    setDateRange(range);
    // optionally trigger API/filter update here
  };
  return (
    <div>
      {/* <h1>SampleTaskTable</h1>
      <Button variant='contained' onClick={() => setOpen(true)}>Open Drawer</Button>
      <PendingAcceptanceDrawer open={open} onClose={() => setOpen(false)} /> */}

      <h3>Select Date Range</h3>
      <CustomDateRangePicker value={dateRange} onChange={handleDateChange} />

      {/* Example use */}
      <p>
        Start: {dateRange.startDate?.toString() || "-"} <br />
        End: {dateRange.endDate?.toString() || "-"}
      </p>
    </div>
  )
}

export default SampleTaskTable