import React, { useState } from 'react'
import PendingAcceptanceDrawer from '../Components/ShortcutsComponent/Notification/PendingAcceptanceDrawer'
import { Button } from '@mui/material';

const SampleTaskTable = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h1>SampleTaskTable</h1>
      <Button variant='contained' onClick={() => setOpen(true)}>Open Drawer</Button>
      <PendingAcceptanceDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default SampleTaskTable