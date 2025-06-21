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
import { AddAdvFilterGroupAttrApi } from '../../Api/MasterApi/AddAdvFilterGroupAttrApi';

const MasterToggle = () => {
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
        name: ''
    });
    const [formAdvData, setFormAdvData] = useState({
        masterName: '',
        subMasterName: '',
        masterValue: ''
    });
    const [selectedRow, setSelectedRow] = useState(null);
    const [mode, setMode] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [cnfDelDialogOpen, setCnfDelDialogOpen] = React.useState(false);

    useEffect(() => {
        const fetchAdvMasterData = async () => {
            const advMasterData = sessionStorage.getItem('structuredAdvMasterData');
            if (advMasterData) {
                setStructuredAdvMasterData(JSON.parse(advMasterData));
            } else {
                const response = await AdvancedMasterApiFunc();
                console.log('response: ', response);
                setStructuredAdvMasterData(response);
            }
        };
        fetchAdvMasterData();
    }, []);

    const handleCloseCnfDialog = () => {
        setCnfDelDialogOpen(false);
    };

    const handleOpenDrawer = () => {
        setSelectedRow(null);
        setFormData({
            name: ''
        });
        setMode('add');
        setDrawerOpen(true)
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedRow(null);
        setFormData({
            name: ''
        });
        setMode('');
        setFormAdvData({
            masterName: '',
            subMasterName: '',
            masterValue: ''
        });
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
                    const sortedMasterData = finalMasterData.sort((a, b) => a.displayorder - b.displayorder);
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

    const handleAddOrSaveRow = async (row) => {
        try {
            const payload = mode == 'edit'
                ? { ...row, ...formData, mode: 'edit' }
                : { ...formData, tabData: categoryStates, mode: 'add' };

            const response = await addEditDelMaster(payload);
            if (response[0]?.stat == 1) {
                handleTaskApicall();
            }
        } catch (error) {
            console.error('Error in handleAddOrSaveRow:', error);
        } finally {
            handleCloseDrawer();
        }
    };

    const formatAdvPayload = (groups, formAdvData, mode = 'edit', defaultFilterMaster = 'DocTeam') => {
        console.log('defaultFilterMaster: ', defaultFilterMaster);
        const result = [];
        if (mode === 'edit') {
            result.push({
                filtermaster: defaultFilterMaster,
                filtergroup: formAdvData.subMasterName,
                filterattr: formAdvData.masterValue
            });
        } else {
            groups.forEach(group => {
                const groupName = group.name;
                group.masters.forEach(master => {
                    const attrList = master.values
                        .split('\n')
                        .map(val => val.trim())
                        .filter(Boolean)
                        .join(',');
                    result.push({
                        filtermaster: groupName,
                        filtergroup: master.name,
                        filterattr: attrList
                    });
                });
            });
        }

        return result;
    };

    const handleAddAdvRow = async (groups) => {
        try {
            if (mode != "edit") {
                for (const master of groups[0]?.masters || []) {
                    const singleGroup = {
                        ...groups[0],
                        masters: [master]
                    };
                    const payload = formatAdvPayload([singleGroup], formAdvData, mode, "DocTeam");
                    const response = await AddAdvFilterGroupAttrApi(payload);
                    if (response[0]?.stat == 1) {
                        handleTaskApicall();
                    }
                }
            } else {
                const payload = formatAdvPayload(groups, formAdvData, mode, "DocTeam");
                const response = await AddAdvFilterGroupAttrApi(payload);
                if (response[0]?.stat == 1) {
                    handleTaskApicall();
                }
            }
        } catch (error) {
            console.error("Error in handleAddAdvRow:", error);
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
        });
    };

    const handleEditAdvRow = (master, sub, item) => {
        setDrawerOpen(true);
        setSelectedRow(item);
        setMode('edit');
        setFormAdvData({
            masterName: master.name,
            subMasterName: sub.name,
            masterValue: item.name,
        });
    }

    const handleAdvDeleteRow = (master, sub, item) => {
        console.log("Deleting item:", item);
        console.log("Under sub-master:", sub.name);
        console.log("Under master:", master.category);
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
        setCnfDelDialogOpen(true);
    }

    const handleRemoveMasterData = async () => {
        try {
            const payload = {
                ...selectedRow,
                ...formData,
                mode: 'trash',
            };
            const response = await addEditDelMaster(payload);
            setCnfDelDialogOpen(false);
            if (response[0]?.stat === 1) {
                setFormattedData(prevData => prevData.filter(item => item.id !== selectedRow.id));
                toast.success('Data Removed Successfully');
            } else {
                toast.error('Failed to remove data');
            }
        } catch (error) {
            console.error('Error in handleRemoveMasterData:', error);
            toast.error('An error occurred while removing the data');
        }
    };

    const isAdvanced = categoryStates?.id === "advanced_master";
    const filteredData = isAdvanced
        ? (structuredAdvMasterData || [])
            ?.map(mainGroup => {
                const filteredGroups = (mainGroup.groups || [])
                    ?.map(group => {
                        const filteredAttributes = (group.attributes || []).filter(attr =>
                            attr?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
                        );
                        return {
                            ...group,
                            attributes: filteredAttributes
                        };
                    })
                    .filter(group => group.attributes.length > 0);

                return {
                    ...mainGroup,
                    groups: filteredGroups
                };
            })
            .filter(mainGroup => mainGroup.groups.length > 0)
        : (formattedData || []).filter(item =>
            item?.labelname?.toLowerCase().includes(searchTerm?.toLowerCase())
        );

    const paginatedData = isAdvanced
        ? filteredData // no pagination for structured/nested
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
                                        />
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
                            onClose={handleCloseDrawer}
                            onSubmit={handleAddAdvRow}
                            formData={formAdvData}
                            selectedRow={selectedRow}
                            setFormData={setFormAdvData}
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
                title="Confirm"
                cancelLabel="Cancel"
                confirmLabel="Remove"
                content='Are you sure you want to Remove this Fields'
            />
        </>
    );
};

export default MasterToggle;