import React from 'react';
import { Grid, Divider } from '@mui/material';
import CustomAutocomplete from '../ShortcutsComponent/CustomAutocomplete';

const DynamicDropdownSection = ({
    dropdownConfigs = [],
    formValues = {},
    handleDropdownChange = () => { },
    divider = true,
    mainMdValue = 4,
    mdValue = 4,
    taskType = 'single',
}) => {
    return (
        <>
            {divider && (
                <Grid item xs={12} md={0.5} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: '#ccc', height: '100%' }} />
                </Grid>
            )}
            <Grid xs={12} md={mainMdValue} sx={{ mt: taskType === 'single' ? 7.3 : 0 }}>
                <Grid container spacing={1}>
                    {dropdownConfigs.map((dropdown, index) => (
                        <Grid item xs={12} md={mdValue} key={index}>
                            <CustomAutocomplete
                                label={dropdown.label}
                                name={dropdown.label}
                                value={
                                    formValues.dynamicDropdowns?.find((d) => d.label === dropdown.label)?.selectedId || ''
                                }
                                onChange={(e) => handleDropdownChange(dropdown, e.target.value)}
                                options={dropdown.options}
                                placeholder={`Select ${dropdown.label}`}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </>
    );
};

export default DynamicDropdownSection;
