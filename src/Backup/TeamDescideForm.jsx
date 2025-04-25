import { Drawer } from '@mui/material'
import { Box } from 'lucide-react'
import React from 'react'

const TeamDescideForm = () => {
    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box className="teamdrawerMainBox">
            </Box>
        </Drawer>
    )
}

export default TeamDescideForm

