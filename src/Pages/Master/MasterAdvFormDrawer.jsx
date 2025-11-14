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

const MasterAdvFormDrawer = ({ open, onClose, mode, editType, filteredData, groups, setGroups, onSubmit, formData, masterType, setFormData, handleMasterChange }) => {
    const [masterOptions, setMasterOptions] = useState([]);
    const [subMasterOptions, setSubMasterOptions] = useState([]);
    const [valueOptions, setValueOptions] = useState([]);
    const [errors, setErrors] = useState({});

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

            // Only reset fields in add mode, not in edit mode
            if (mode !== 'edit' && formData.subMasterName && !subGroups.includes(formData.subMasterName.replace(/^#/, ''))) {
                setFormData(prev => ({ ...prev, subMasterName: '', masterValue: '' }));
            }
        }
    }, [formData.masterName, mode]);

    const validateForm = () => {
        const newErrors = {};

        if (masterType === "single") {
            if (mode === 'edit') {
                // In edit mode, validate the updatedValue field
                if (!formData.updatedValue || formData.updatedValue.trim() === "") {
                    newErrors.updatedValue = `${editType === 'main group' ? 'Main group' : editType === 'group' ? 'Group' : 'Attribute'} name is required`;
                }
            } else {
                // In add mode, validate all fields
                if (!formData.masterName || formData.masterName.trim() === "") {
                    newErrors.masterName = "Master Group is required";
                }
                if (!formData.subMasterName || formData.subMasterName.trim() === "") {
                    newErrors.subMasterName = "Master Name is required";
                }
                if (!formData.masterValue || formData.masterValue.trim() === "") {
                    newErrors.masterValue = "Master Data is required";
                }
            }
        } else if (masterType === "multi_input") {
            if (!groups || groups.length === 0) {
                newErrors.groups = "At least one group is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(groups);
        }
    };

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
                        {mode === 'edit' ? (
                            // Edit mode - show only relevant field based on editType
                            <>
                                {editType === 'main group' && (
                                    <SmartDropdown
                                        label="Main Group Name"
                                        value={formData.updatedValue || formData.masterName}
                                        setValue={(val) => {
                                            setFormData({ ...formData, updatedValue: val });
                                            if (errors.updatedValue) {
                                                setErrors({ ...errors, updatedValue: "" });
                                            }
                                        }}
                                        options={[]}
                                        setOptions={() => {}}
                                        error={errors.updatedValue}
                                        placeholder="Enter main group name"
                                    />
                                )}
                                
                                {editType === 'group' && (
                                    <>
                                        <SmartDropdown
                                            label="Main Group"
                                            value={formData.masterName || ''}
                                            setValue={() => {}} // Read-only
                                            options={formData.masterName ? [formData.masterName] : []}
                                            setOptions={() => {}}
                                            placeholder="Main group (read-only)"
                                            disabled={true}
                                        />
                                        <SmartDropdown
                                            label="Group Name"
                                            value={formData.updatedValue || formData.subMasterName}
                                            setValue={(val) => {
                                                setFormData({ ...formData, updatedValue: val });
                                                if (errors.updatedValue) {
                                                    setErrors({ ...errors, updatedValue: "" });
                                                }
                                            }}
                                            options={[]}
                                            setOptions={() => {}}
                                            error={errors.updatedValue}
                                            placeholder="Enter group name"
                                        />
                                    </>
                                )}
                                
                                {editType === 'attribute' && (
                                    <>
                                        <SmartDropdown
                                            label="Main Group"
                                            value={formData.masterName || ''}
                                            setValue={() => {}} // Read-only
                                            options={formData.masterName ? [formData.masterName] : []}
                                            setOptions={() => {}}
                                            placeholder="Main group (read-only)"
                                            disabled={true}
                                        />
                                        <SmartDropdown
                                            label="Group"
                                            value={formData.subMasterName || ''}
                                            setValue={() => {}} // Read-only
                                            options={formData.subMasterName ? [formData.subMasterName] : []}
                                            setOptions={() => {}}
                                            placeholder="Group (read-only)"
                                            disabled={true}
                                        />
                                        <SmartDropdown
                                            label="Attribute Name"
                                            value={formData.updatedValue || formData.masterValue}
                                            setValue={(val) => {
                                                setFormData({ ...formData, updatedValue: val });
                                                if (errors.updatedValue) {
                                                    setErrors({ ...errors, updatedValue: "" });
                                                }
                                            }}
                                            options={[]}
                                            setOptions={() => {}}
                                            error={errors.updatedValue}
                                            placeholder="Enter attribute name"
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            // Add mode - show all fields
                            <>
                                <SmartDropdown
                                    label="Master Group"
                                    value={formData.masterName}
                                    setValue={(val) => {
                                        setFormData({ ...formData, masterName: val });
                                        if (errors.masterName) {
                                            setErrors({ ...errors, masterName: "" });
                                        }
                                    }}
                                    options={masterOptions}
                                    setOptions={setMasterOptions}
                                    error={errors.masterName}
                                />

                                <SmartDropdown
                                    label="Master Name"
                                    value={formData.subMasterName}
                                    setValue={(val) => {
                                        const newVal = val ? (val?.startsWith('#') ? val : `#${val}`) : ''; 
                                        setFormData({ ...formData, subMasterName: newVal });
                                        if (errors.subMasterName) {
                                            setErrors({ ...errors, subMasterName: "" });
                                        }
                                    }}
                                    options={subMasterOptions}
                                    setOptions={setSubMasterOptions}
                                    error={errors.subMasterName}
                                />

                                <SmartDropdown
                                    label="Master Data"
                                    value={formData.masterValue}
                                    setValue={(val) => {
                                        setFormData({ ...formData, masterValue: val });
                                        if (errors.masterValue) {
                                            setErrors({ ...errors, masterValue: "" });
                                        }
                                    }}
                                    options={valueOptions}
                                    setOptions={setValueOptions}
                                    error={errors.masterValue}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <DynamicMasterDrawer
                            groups={groups}
                            setGroups={setGroups}
                        />
                        {errors.groups && (
                            <Typography variant="body2" color="error" sx={{ mt: 1, fontSize: "0.75rem" }}>
                                {errors.groups}
                            </Typography>
                        )}

                    </>
                )}

                {(masterType === "single" || (masterType == "multi_input" && groups.length > 0)) && (
                    <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: 1 }}>
                        <Button size="small" className="secondaryBtnClassname" variant="outlined" onClick={onClose}>Cancel</Button>
                        <Button size="small" className="buttonClassname" variant="contained" onClick={handleSubmit}>
                            {mode === 'edit' ? "Update" : "Add"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default MasterAdvFormDrawer;
