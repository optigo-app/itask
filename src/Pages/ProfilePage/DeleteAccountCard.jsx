import React, { useState } from 'react';
import { Card, CardContent, CardActions, Button, Typography, Box, FormControlLabel, Checkbox } from '@mui/material';
import { Delete as DeleteIcon, VisibilityOff as DeactivateIcon } from '@mui/icons-material';

const DeleteDeactivateCard = ({ title, description, subDescription, onDeactivate }) => {
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleConfirmChange = (event) => {
        setIsConfirmed(event.target.checked);
    };

    const handleDeactivate = () => {
        if (isConfirmed) {
            onDeactivate();
        }
    };
    return (
        <Card className="profileCard deActivateCard">
            <CardContent sx={{padding:'0'}}>
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
                <Box className="descPDeleteBox">
                    <Typography variant="subtitle1">
                        {description}
                    </Typography>
                    <Typography variant="subtitle2">
                        {subDescription}
                    </Typography>
                </Box>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isConfirmed}
                            onChange={handleConfirmChange}
                        />
                    }
                    label="I confirm that I want to deactivate my account"
                    className='checkboxClassname'
                />
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    className='dangerbtnClassname'
                    onClick={handleDeactivate}
                >
                    Deactivate Account
                </Button>
            </CardActions>
        </Card>
    );
};

export default DeleteDeactivateCard;
