import React, { useState } from 'react';
import SidebarDrawer from './SidebarDrawerFile'; // Adjust the path if needed
import { Button } from '@mui/material';

const FileUploadComp = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <Button variant="contained" onClick={() => setDrawerOpen(true)}>
        Open Upload Drawer
      </Button>

      <SidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default FileUploadComp;
