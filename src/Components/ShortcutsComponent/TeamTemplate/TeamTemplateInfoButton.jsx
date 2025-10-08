import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Info } from 'lucide-react';
import TeamTemplateInfoModal from './TeamTemplateInfoModal';

const TeamTemplateInfoButton = ({ 
    tooltip = 'View team templates'
}) => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Tooltip title={tooltip}>
                <IconButton
                    onClick={() => setModalOpen(true)}
                    size="medium"
                    sx={{
                        color: '#7367f0',
                        backgroundColor: 'rgba(115, 103, 240, 0.1)',
                        border: '1px solid rgba(115, 103, 240, 0.2)',
                        borderRadius: '8px',
                        '&:hover': {
                            color: '#fff',
                            backgroundColor: '#7367f0',
                            borderColor: '#7367f0',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(115, 103, 240, 0.3)'
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <Info size={18} />
                </IconButton>
            </Tooltip>

            <TeamTemplateInfoModal 
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
};

export default TeamTemplateInfoButton;
