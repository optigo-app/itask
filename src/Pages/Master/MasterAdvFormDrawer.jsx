import React, { useEffect, useState } from "react";
import "./Master.scss"
import {
    Drawer, Box, Typography, Button, IconButton,
    ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Grid2x2, ListTodo } from "lucide-react";
import DynamicMasterDrawer from "./DynamicMasterDrawer";
import SmartDropdown from "../../Components/MastersComp/SmartDropdown";

const MasterAdvFormDrawer = ({ open, onClose, mode, filteredData, groups, setGroups, onSubmit, formData, masterType, setFormData, handleMasterChange }) => {
    const [masterOptions, setMasterOptions] = useState([]);
    const [subMasterOptions, setSubMasterOptions] = useState([]);
    const [valueOptions, setValueOptions] = useState([]);

    const master_OPTIONS = [
        { id: 1, value: "single", label: "Single", icon: <ListTodo size={20} /> },
        { id: 2, value: "multi_input", label: "Bulk", icon: <Grid2x2 size={20} /> },
    ];

    useEffect(() => {
        if (filteredData && Array.isArray(filteredData)) {
            setMasterOptions(filteredData.map((item) => item.name));
        }
    }, [filteredData]);

    useEffect(() => {
        const selectedGroup = filteredData?.find(item => item.name === formData.masterName);
        if (selectedGroup) {
            const subGroups = selectedGroup.groups.map(group => group.name);
            setSubMasterOptions(subGroups);

            if (!subGroups.includes(formData.subMasterName)) {
                setFormData(prev => ({ ...prev, subMasterName: '', masterValue: '' }));
            }
        }
    }, [formData.masterName]);

    useEffect(() => {
        const selectedGroup = filteredData?.find(item => item.name === formData.masterName);
        if (selectedGroup) {
            const subGroups = selectedGroup.groups.map(group => group.name);
            setSubMasterOptions(subGroups);
    
            // Reset only if value is not in options
            if (formData.subMasterName && !subGroups.includes(formData.subMasterName.replace(/^#/, ''))) {
                setFormData(prev => ({ ...prev, subMasterName: '', masterValue: '' }));
            }
        }
    }, [formData.masterName]);
    

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 450, padding: "10px 15px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <Typography variant="h6">Master Form</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <div style={{
                    margin: "15px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }} />
                {mode !== 'edit' &&
                    <Box className="masterSideBarTgBox">
                        <ToggleButtonGroup
                            value={masterType}
                            exclusive
                            onChange={handleMasterChange}
                            size="small"
                            className="toggle-group"
                        >
                            {master_OPTIONS?.map(({ id, value, label, icon }) => (
                                <ToggleButton key={id} value={value} className="toggle-button" sx={{ borderRadius: "8px" }}>
                                    {icon} {label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                }

                {masterType === "single" ? (
                    <>
                        <SmartDropdown
                            label="Master Group"
                            value={formData.masterName}
                            setValue={(val) => setFormData({ ...formData, masterName: val })}
                            options={masterOptions}
                            setOptions={setMasterOptions}
                        />

                        <SmartDropdown
                            label="Master Name"
                            value={formData.subMasterName}
                            setValue={(val) => {
                                const newVal = val ? (val?.startsWith('#') ? val : `#${val}`) : ''; 
                                setFormData({ ...formData, subMasterName: newVal });
                            }}
                            options={subMasterOptions}
                            setOptions={setSubMasterOptions}
                        />

                        <SmartDropdown
                            label="Master Data"
                            value={formData.masterValue}
                            setValue={(val) => setFormData({ ...formData, masterValue: val })}
                            options={valueOptions}
                            setOptions={setValueOptions}
                        />
                    </>
                ) : (
                    <>
                        <DynamicMasterDrawer
                            groups={groups}
                            setGroups={setGroups}
                        />

                    </>
                )}

                {(masterType === "single" || (masterType == "multi_input" && groups.length > 0)) && (
                    <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: 1 }}>
                        <Button size="small" className="secondaryBtnClassname" variant="outlined" onClick={onClose}>Cancel</Button>
                        <Button size="small" className="buttonClassname" variant="contained" onClick={() => onSubmit(groups)}>
                            {formData.masterName ? "Save" : "Add"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default MasterAdvFormDrawer;
