import React, { useState, useEffect } from 'react';
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
    const [selectedTeam, setSelectedTeam] = useState('');
    const [availableTeams, setAvailableTeams] = useState([]);
    const [filteredGroupConfigs, setFilteredGroupConfigs] = useState([]);

    useEffect(() => {
        const teams = Array.from(new Set(dropdownConfigs?.map((d) => d.teamName)))?.map((team) => ({
            id: team,
            labelname: team,
        }));
        setAvailableTeams(teams);
        setSelectedTeam(teams[0]?.id);
    }, [dropdownConfigs]);

    useEffect(() => {
        if (selectedTeam) {
            const filtered = dropdownConfigs.filter((d) => d.teamName === selectedTeam);
            setFilteredGroupConfigs(filtered);
        } else {
            setFilteredGroupConfigs([]);
        }
    }, [selectedTeam, dropdownConfigs]);

    return (
        <>
            {divider && (
                <Grid item xs={12} md={0.5} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: '#ccc', height: '100%' }} />
                </Grid>
            )}
            <Grid item xs={12} md={mainMdValue} sx={{ mt: taskType === 'single' ? 7.3 : 0 }}>
                <Grid container spacing={1}>
                    {/* Team Dropdown */}
                    <Grid item xs={12} md={12}>
                        <CustomAutocomplete
                            label="Select Team"
                            name="team"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            options={availableTeams}
                            placeholder="Select Team"
                        />
                    </Grid>

                    {/* Group Dropdowns for selected team */}
                    {filteredGroupConfigs.map((dropdown, index) => (
                        <Grid item xs={12} md={mdValue} key={index}>
                            <CustomAutocomplete
                                label={`${dropdown.groupName}`}
                                name={dropdown.groupName}
                                value={
                                    formValues.dynamicDropdowns?.find(
                                        (d) => d.label === dropdown.label
                                    )?.selectedId || ''
                                }
                                onChange={(e) => handleDropdownChange(dropdown, e.target.value)}
                                options={dropdown.options}
                                placeholder={`Select ${dropdown.groupName}`}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </>
    );
};

export default DynamicDropdownSection;
