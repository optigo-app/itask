import React, { useEffect, useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './Master.scss';
import { AdvancedMasterApiFunc, commonTextFieldProps } from '../../Utils/globalfun';
import Mastergrid from './masterGrid';
import { addEditDelMaster, fetchMaster } from '../../Api/MasterApi/MasterApi';
import MasterFormDrawer from './MasterFormDrawer';
import { fetchIndidualApiMaster } from '../../Api/MasterApi/masterIndividualyApi';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { Add as AddIcon } from "@mui/icons-material";
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import { toast } from 'react-toastify';
import MasterAdvFormDrawer from './MasterAdvFormDrawer';
import DynamicMasterDrawer from './DynamicMasterDrawer';
import AdvancedMasterTable from './AdvancedMasterTable';
import { AddAdvFilterGroupAttrApi, deleteAdvancedMasterApi, editAdvancedMasterApi } from '../../Api/MasterApi/AddAdvFilterGroupAttrApi';
import { useLocation } from 'react-router-dom';
import ColorGridShortcuts from '../../Components/Common/ColorGridShortcuts';
import ViewToggle from '../../Components/Common/ViewToggle';

const MasterToggle = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [isIndLoading, setIsIndLoading] = useState(false);
    const [value, setValue] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [formattedData, setFormattedData] = useState([]);
    const [tableTabData, setTableTabData] = useState([]);
    const [categoryStates, setCategoryStates] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [structuredAdvMasterData, setStructuredAdvMasterData] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        displayorder: '',
        colorKey: null
    });
    const [formAdvData, setFormAdvData] = useState({
        masterName: '',
        subMasterName: '',
        masterValue: ''
    });
    const [groups, setGroups] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [mode, setMode] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [cnfDelDialogOpen, setCnfDelDialogOpen] = React.useState(false);
    const [deleteType, setDeleteType] = useState('');
    const [editType, setEditType] = useState('');
    const [masterType, setMasterType] = useState("single");
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const fetchAdvMasterData = async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cached = sessionStorage.getItem('structuredAdvMasterData');
            if (cached) {
                setStructuredAdvMasterData(JSON.parse(cached));
                return;
            }
        }
        const response = await AdvancedMasterApiFunc();
        const safeData = Array.isArray(response) ? response : [];
        setStructuredAdvMasterData(safeData);
        sessionStorage.setItem('structuredAdvMasterData', JSON.stringify(safeData));
    };

    useEffect(() => {
        fetchAdvMasterData();
        if (location?.pathname?.includes('/master')) {
            fetchAdvMasterData(true);
        }
    }, []);

    const handleCloseCnfDialog = () => {
        setCnfDelDialogOpen(false);
        setDeleteType('');
    };

    const getDeleteMessage = () => {
        const itemName = deleteType === 'attribute' ? formAdvData.masterValue :
                        deleteType === 'group' ? formAdvData.subMasterName :
                        deleteType === 'main group' ? formAdvData.masterName :
                        selectedRow?.labelname || 'this item';

        return `Are you sure you want to remove this ${deleteType}${itemName ? ` "${itemName}"` : ''}?`;
    };

    const handleOpenDrawer = () => {
        setSelectedRow(null);
        setFormData({
            name: '',
            displayorder: '',
            colorKey: null
        });
        setMode('add');
        setDrawerOpen(true)
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedRow(null);
        setFormData({
            name: '',
            displayorder: '',
            colorKey: null
        });
        setMode('');
        setEditType('');
        setFormAdvData({
            masterName: '',
            subMasterName: '',
            masterValue: ''
        });
        setGroups([]);
    };

    const fetchMasterData = async () => {
        setIsLoading(true);
        try {
            const masterData = await fetchMaster();
            const updatedTabData = [...(masterData?.rd || []), { id: 'advanced_master', title: 'Advanced Master', mode: 'advanced' }];
            setTableTabData(updatedTabData);
            const storedValue = localStorage?.getItem('masterTab');
            if (storedValue) {
                setValue(storedValue);
            } else {
                setValue(updatedTabData[0]?.title);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskApicall = async () => {
        if (formattedData?.length == 0) {
            setIsIndLoading(true);
        }
        try {
            if (tableTabData) {
                const mode = tableTabData.find(tabItem => tabItem.title === value);
                setCategoryStates(mode);
                const modeValue = mode?.mode;
                if (modeValue) {
                    const masterIndApi = await fetchIndidualApiMaster({ mode: modeValue });
                    const finalMasterData = masterIndApi?.rd || [];
                    const sortedMasterData = finalMasterData.sort((a, b) => {
                        if (a.displayorder !== b.displayorder) {
                            return a.displayorder - b.displayorder;
                        }
                        return a.labelname.localeCompare(b.labelname);
                    });
                    const mergedData = sortedMasterData.map((item, index) => ({
                        srno: index + 1,
                        ...item,
                        tabData: tableTabData.find(tabItem => tabItem.id === item.masterid) || null
                    }));
                    setFormattedData(mergedData);
                }
            }
        } catch (error) {
            console.error('Error in handleTaskApicall:', error);
        } finally {
            setIsIndLoading(false);
        }
    }

    useEffect(() => {
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (tableTabData) {
            handleTaskApicall()
        }
    }, [value])

    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            setValue(newValue);
            localStorage?.setItem('masterTab', newValue);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleMasterChange = (event, newType) => {
        if (newType !== null) {
            setMasterType(newType);
            setFormData({ ...formData, name: '' });
        }
    };

    const handleAddOrSaveRow = async (row) => {
        try {
            const payload = mode == 'edit'
                ? { ...row, ...formData, mode: 'edit' }
                : { ...formData, tabData: categoryStates, mode: 'add' };

            const response = await addEditDelMaster(payload);
            if (response[0]?.stat == 1) {
                // Save color mapping if it's a priority or status master
                if (formData.colorKey && (categoryStates?.title?.toLowerCase().includes('priority') || categoryStates?.title?.toLowerCase().includes('status'))) {
                    const colorType = categoryStates?.title?.toLowerCase().includes('priority') ? 'priorityMasterColors' : 'statusMasterColors';
                    const existingColors = JSON.parse(sessionStorage.getItem(colorType) || '{}');
                    existingColors[formData.name?.toLowerCase()] = formData.colorKey;
                    sessionStorage.setItem(colorType, JSON.stringify(existingColors));
                }
                handleTaskApicall();
            }
        } catch (error) {
            console.error('Error in handleAddOrSaveRow:', error);
        } finally {
            handleCloseDrawer();
        }
    };

    const formatAdvPayload = (groups, formAdvData, mode = 'edit', defaultFilterMaster = 'DocTeam') => {
        const result = [];

        if (mode === 'edit' || masterType === "single") {
            result.push({
                filtermaster: defaultFilterMaster,
                filtergroup: formAdvData.subMasterName?.trim(),
                filterattr: formAdvData.masterValue?.trim()
            });
        } else {
            groups.forEach(group => {
                const groupName = group.name?.trim();
                group.masters.forEach(master => {
                    const attrList = master.values
                        .split('\n')
                        .map(val => val.trim())
                        .filter(Boolean)
                        .join(',');
                    result.push({
                        filtermaster: groupName,
                        filtergroup: master.name?.trim(),
                        filterattr: attrList
                    });
                });
            });
        }

        return result;
    };

    const handleAddAdvRow = async (groups) => {
        try {
            if (mode === 'edit') {
                // Handle edit operation
                const response = await editAdvancedMasterApi(formAdvData, editType);
                
                if (response?.rd?.[0]?.stat == 1) {
                    toast.success("Data Updated Successfully");
                    
                    // Update the local state to reflect changes immediately
                    setStructuredAdvMasterData(prev =>
                        prev.map(master => {
                            if (editType === 'main group' && master.id === formAdvData.id) {
                                return { ...master, name: formAdvData.updatedValue };
                            }
                            
                            if (master.id !== formAdvData.id) return master;
                            
                            return {
                                ...master,
                                groups: master.groups.map(group => {
                                    if (editType === 'group' && group.id === formAdvData.subid) {
                                        return { ...group, name: formAdvData.updatedValue };
                                    }
                                    
                                    if (group.id !== formAdvData.subid) return group;
                                    
                                    return {
                                        ...group,
                                        attributes: group.attributes.map(attr => {
                                            if (editType === 'attribute' && attr.id === formAdvData.itemid) {
                                                return { ...attr, name: formAdvData.updatedValue };
                                            }
                                            return attr;
                                        })
                                    };
                                })
                            };
                        })
                    );
                } else {
                    toast.error("Failed to update data");
                }
            } else {
                // Handle add operation (existing logic)
                if (masterType === 'single') {
                    const payload = formatAdvPayload([], formAdvData, mode, formAdvData?.masterName);
                    const response = await AddAdvFilterGroupAttrApi(payload);

                    if (response?.rd?.[0]?.stat == 1) {
                        const data = await AdvancedMasterApiFunc();
                        setStructuredAdvMasterData(data);
                        toast.success("Data Added Successfully");
                    }
                } else {
                    let hasSuccess = false;
                    for (const master of groups[0]?.masters || []) {
                        const singleGroup = {
                            ...groups[0],
                            masters: [master]
                        };
                        const payload = formatAdvPayload([singleGroup], formAdvData, mode, "DocTeam");
                        const response = await AddAdvFilterGroupAttrApi(payload);
                        if (response?.rd?.[0]?.stat == 1) {
                            hasSuccess = true;
                        }
                    }
                    if (hasSuccess) {
                        const data = await AdvancedMasterApiFunc();
                        setStructuredAdvMasterData(data);
                        toast.success("Data Added Successfully");
                    }
                }
            }
        } catch (error) {
            console.error("Error in handleAddAdvRow:", error);
            toast.error("Operation failed");
        } finally {
            handleCloseDrawer();
        }
    };

    const handleEditRow = (row) => {
        setDrawerOpen(true);
        setSelectedRow(row);
        setMode('edit');
        setFormData({
            name: row?.labelname,
            displayorder: row?.displayorder || '',
            colorKey: row?.colorkey || null
        });
    };

    const handleEditAdvRow = (master, sub, item) => {
        setDrawerOpen(true);
        setMasterType('single');
        setMode('edit');
        // Determine edit type based on parameters
        if (item) {
            setEditType('attribute');
            setSelectedRow(item);
            setFormAdvData({
                masterName: master?.name,
                subMasterName: sub?.name,
                masterValue: item?.name,
                id: master?.id,
                subid: sub?.id,
                itemid: item?.id,
                bindid: item?.bindid,
                filtermaingroupid: master?.id,
                filtergroupid: sub?.id,
                filterattrid: item?.id,
                updatedValue: item?.name // Current value for editing
            });
        } else if (sub) {
            setEditType('group');
            setSelectedRow(sub);
            setFormAdvData({
                masterName: master?.name,
                subMasterName: sub?.name,
                masterValue: '',
                id: master?.id,
                subid: sub?.id,
                itemid: null,
                updatedValue: sub?.name // Current value for editing
            });
        } else {
            setEditType('main group');
            setSelectedRow(master);
            setFormAdvData({
                masterName: master?.name,
                subMasterName: sub?.name,
                masterValue: '',
                id: master?.id,
                subid: null,
                itemid: null,
                updatedValue: master?.name // Current value for editing
            });
        }
    }

    console.log(formAdvData,"formAdvData");

    const handleAdvDeleteRow = (master, sub, item) => {
        setFormAdvData({
            masterName: master?.name,
            subMasterName: sub?.name,
            masterValue: item?.name,
            id: master?.id,
            subid: sub?.id,
            itemid: item?.id,
            bindid: item?.bindid,
        });
        
        // Determine delete type based on parameters
        if (item) {
            setDeleteType('attribute');
        } else if (sub) {
            setDeleteType('group');
        } else {
            setDeleteType('main group');
        }
        
        setCnfDelDialogOpen(true);
    }

    const handleDeleteRow = async (row) => {
        try {
            const payload = {
                ...row,
                ...formData,
                mode: 'del',
            };
            const response = await addEditDelMaster(payload);
            if (response[0]?.stat == 1) {
                setFormattedData(formattedData.map(item =>
                    item.id == row.id ? { ...item, isdelete: 1 } : item
                ));
            }
        } catch (error) {
            console.error('Error in handleDeleteRow:', error);
        }
    };

    const handleRestoreRow = async (row) => {
        try {
            const payload = {
                ...row,
                ...formData,
                mode: 'restore',
            };
            const response = await addEditDelMaster(payload);
            if (response[0]?.stat == 1) {
                setFormattedData(formattedData.map(item =>
                    item.id == row.id ? { ...item, isdelete: 0 } : item
                ));
            }
        } catch (error) {
            console.error('Error in handleRestoreRow:', error);
        }
    };

    const handleFinalDelete = (row) => {
        setSelectedRow(row);
        setDeleteType('master record');
        setCnfDelDialogOpen(true);
    }

    const handleRemoveMasterData = async () => {
        if (categoryStates?.id === "advanced_master") {
            const apiRes = await deleteAdvancedMasterApi(formAdvData, deleteType);
            if (apiRes?.rd?.[0]?.stat == 1) {
                toast.success("Data Removed Successfully");
                setStructuredAdvMasterData(prev =>
                    prev.map(master => {
                        // If deleting a main group, filter it out completely
                        if (deleteType === 'main group' && master.id === formAdvData.id) {
                            return null;
                        }
                        
                        if (master.id !== formAdvData.id) return master;
                        
                        return {
                            ...master,
                            groups: master.groups.map(group => {
                                // If deleting a group, filter it out completely
                                if (deleteType === 'group' && group.id === formAdvData.subid) {
                                    return null;
                                }
                                
                                // If deleting an attribute, filter it from the group
                                if (deleteType === 'attribute' && group.id === formAdvData.subid) {
                                    return {
                                        ...group,
                                        attributes: group.attributes.filter(attr => attr.id !== formAdvData.itemid)
                                    };
                                }
                                
                                return group;
                            }).filter(group => group !== null && group.attributes.length > 0)
                        };
                    }).filter(master => master !== null && master.groups.length > 0)
                );
                handleCloseCnfDialog();
            }
        } else {
            try {
                const result = await addEditDelMaster({ ...selectedRow, isdelete: 2 });
                if (result?.rd) {
                    const updatedData = formattedData.filter(item => item.id !== selectedRow.id);
                    setFormattedData(updatedData);
                    toast.success('Record permanently deleted successfully!');
                }
                handleCloseCnfDialog();
            } catch (error) {
                console.error('Error in handleRemoveMasterData:', error);
                toast.error('Failed to delete record');
            }
        }
    };

    const handleColorChange = async (row, colorKey, masterType) => {
        try {
            const updatedRow = { ...row, colorkey: colorKey };
            const result = await addEditDelMaster(updatedRow);
            
            if (result?.rd) {
                const updatedData = formattedData.map(item => 
                    item.id === row.id ? { ...item, colorkey: colorKey } : item
                );
                setFormattedData(updatedData);
                const storageKey = masterType === 'priority' ? 'priorityMasterColors' : 'statusMasterColors';
                const existingColors = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
                existingColors[row.labelname.toLowerCase()] = colorKey;
                sessionStorage.setItem(storageKey, JSON.stringify(existingColors));
                
                toast.success(`Color updated for ${row.labelname}!`);
            } else {
                toast.error('Failed to update color');
            }
        } catch (error) {
            console.error('Error updating color:', error);
            toast.error('Failed to update color');
        }
    };

    const isAdvanced = categoryStates?.id === "advanced_master";
    const isPriorityOrStatus = categoryStates?.title?.toLowerCase().includes('priority') || categoryStates?.title?.toLowerCase().includes('status');
    const masterType_display = categoryStates?.table_name;

    const searchAllNestedNames = (data, searchTerm) => {
        const lowerSearch = (searchTerm || "").toLowerCase();

        return (data || []).map(team => {
            const teamMatch = team.name?.toLowerCase().includes(lowerSearch);

            const filteredGroups = (team.groups || []).map(group => {
                const groupMatch = group.name?.toLowerCase().includes(lowerSearch);

                const filteredAttributes = (group.attributes || []).filter(attr =>
                    attr.name?.toLowerCase().includes(lowerSearch)
                );

                const includeGroup = groupMatch || filteredAttributes.length > 0;

                return includeGroup
                    ? {
                        ...group,
                        attributes: filteredAttributes
                    }
                    : null;
            }).filter(Boolean);

            const includeTeam = teamMatch || filteredGroups.length > 0;

            return includeTeam
                ? {
                    ...team,
                    groups: filteredGroups
                }
                : null;
        }).filter(Boolean);
    };

    const filteredData = isAdvanced
        ? searchAllNestedNames(structuredAdvMasterData, searchTerm)
        : (formattedData || []).filter(item =>
            item?.labelname?.toLowerCase().includes(searchTerm?.toLowerCase())
        );

    const paginatedData = isAdvanced
        ? filteredData
        : filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <>
            {!isLoading ? (
                <div className='masterMainDiv'>
                    <Box
                        className="masterGridBox"
                        sx={{
                            boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                            padding: "20px 20px",
                            borderRadius: "8px",
                            overflow: "hidden !important",
                        }}
                    >
                        <Box className="masterToggleBox">
                            <ToggleButtonGroup
                                value={value}
                                exclusive
                                onChange={handleChange}
                                aria-label="master toggles"
                                className="toggle-group"
                            >
                                {tableTabData?.map((item, index) => (
                                    <ToggleButton className="toggle-button" key={item?.id} value={item.title}>
                                        {item?.title}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>
                        <div style={{
                            margin: "20px 0",
                            border: "1px dashed #7d7f85",
                            opacity: 0.3,
                        }}
                        />
                        <Box className="gridHeaderBox" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" className="gridHeaderText">{value}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'end', gap: 2 }}>
                                <TextField
                                    placeholder="Search..."
                                    value={searchTerm}
                                    {...commonTextFieldProps}
                                    onChange={handleSearch}
                                    InputProps={{
                                        endAdornment: <SearchIcon />,
                                    }}
                                />
                                
                                {isPriorityOrStatus && (
                                    <ViewToggle
                                        view={viewMode}
                                        onViewChange={setViewMode}
                                        size="small"
                                        variant="outlined"
                                        showLabels={false}
                                        sx={{ ml: 1 }}
                                    />
                                )}
                                
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    className="buttonClassname"
                                    onClick={handleOpenDrawer}
                                >
                                    New
                                </Button>
                            </Box>
                        </Box>
                        {isIndLoading ? (
                            <LoadingBackdrop isLoading={isIndLoading} />
                        ) :
                            <>
                                {categoryStates?.id != "advanced_master" ?
                                    (
                                        <>
                                            {/* Show Grid View for Priority/Status when enabled */}
                                            {isPriorityOrStatus && viewMode === 'grid' ? (
                                                <ColorGridShortcuts
                                                    data={filteredData}
                                                    type={masterType_display}
                                                    onEdit={handleEditRow}
                                                    onDelete={handleDeleteRow}
                                                    showActions={true}
                                                />
                                            ) : (
                                                <Mastergrid
                                                    data={paginatedData}
                                                    handleEditRow={handleEditRow}
                                                    handleDeleteRow={handleDeleteRow}
                                                    handleRestoreRow={handleRestoreRow}
                                                    paginationCount={Math.ceil(filteredData.length / rowsPerPage)}
                                                    totalRows={filteredData.length}
                                                    paginationPage={page}
                                                    rowsPerPage={rowsPerPage}
                                                    onPaginationChange={handlePageChange}
                                                    handleFinalDelete={handleFinalDelete}
                                                    masterType={masterType_display}
                                                    onColorChange={handleColorChange}
                                                />
                                            )}
                                        </>
                                    ) :
                                    <div>
                                        <AdvancedMasterTable
                                            data={filteredData}
                                            handleEditAdvRow={handleEditAdvRow}
                                            handleAdvDeleteRow={handleAdvDeleteRow}
                                        />
                                    </div>
                                }
                            </>
                        }
                    </Box>
                    {categoryStates?.id != "advanced_master" ? (
                        <MasterFormDrawer
                            open={drawerOpen}
                            activeTab={value}
                            formattedData={formattedData}
                            onClose={handleCloseDrawer}
                            onSubmit={handleAddOrSaveRow}
                            formData={formData}
                            selectedRow={selectedRow}
                            setFormData={setFormData}
                        />
                    ) :
                        <MasterAdvFormDrawer
                            open={drawerOpen}
                            activeTab={value}
                            mode={mode}
                            editType={editType}
                            filteredData={filteredData}
                            groups={groups}
                            setGroups={setGroups}
                            onClose={handleCloseDrawer}
                            onSubmit={handleAddAdvRow}
                            formData={formAdvData}
                            selectedRow={selectedRow}
                            setFormData={setFormAdvData}
                            masterType={masterType}
                            handleMasterChange={handleMasterChange}
                        />
                    }
                </div>
            ) :
                <LoadingBackdrop isLoading={isLoading} />
            }
            <ConfirmationDialog
                open={cnfDelDialogOpen}
                onClose={handleCloseCnfDialog}
                onConfirm={handleRemoveMasterData}
                title="Confirm Deletion"
                cancelLabel="Cancel"
                confirmLabel="Remove"
                content={getDeleteMessage()}
            />
        </>
    );
};

export default MasterToggle;