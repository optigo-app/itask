import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import React from 'react'
import './Styles/dashboard.scss';

const DasboardTab = ({ tabData, selectedTab, handleChange }) => {
  return (
    <div>
      <Box className="prDashboard_ToggleBox">
        <ToggleButtonGroup
          value={selectedTab}
          exclusive
          onChange={handleChange}
          aria-label="dashboard tab selection"
          className="toggle-group"
        >
          {tabData.map((item) => (
            <ToggleButton key={item.label} value={item.label} className="toggle-button">
              {item.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </div>
  )
}

export default DasboardTab