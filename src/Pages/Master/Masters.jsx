import React, { useEffect, useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './Master.scss';
import { commonTextFieldProps } from '../../Utils/globalfun';
import Mastergrid from './masterGrid';
import { addEditDelMaster, fetchMaster } from '../../Api/MasterApi/MasterApi';
import MasterFormDrawer from './MasterFormDrawer';
import { fetchIndidualApiMaster } from '../../Api/MasterApi/masterIndividualyApi';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { Add as AddIcon } from "@mui/icons-material";

const toggleData = [
    { label: 'Toggle 1', content: 'Content for Toggle 1' },
    { label: 'Toggle 2', content: 'Content for Toggle 2' },
    { label: 'Toggle 3', content: 'Content for Toggle 3' },
];

const tableData = [
    { id: 1, name: 'Item 1', createdDate: '2024-03-01', updatedDate: '2024-03-10', isdelete: 0 },
    { id: 2, name: 'Item 2', createdDate: '2024-02-15', updatedDate: '2024-03-08', isdelete: 1 },
    { id: 3, name: 'Item 3', createdDate: '2024-01-20', updatedDate: '2024-02-25', isdelete: 0 },
];

const MasterToggle = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isIndLoading, setIsIndLoading] = useState(false);
    const [value, setValue] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [formattedData, setFormattedData] = useState([]);
    const [tableTabData, setTableTabData] = useState([]);
    const [categoryStates, setCategoryStates] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: ''
    });
    const [selectedRow, setSelectedRow] = useState(null);
    const [mode, setMode] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
    };

    const fetchMasterData = async () => {
        setIsLoading(true);
        try {
            const masterData = await fetchMaster();
            setTableTabData(masterData?.rd)
            setValue(masterData?.rd[0]?.title);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskApicall = async () => {
        setIsIndLoading(true);
        try {
            if (tableTabData) {
                const mode = tableTabData.find(tabItem => tabItem.title === value);
                setCategoryStates(mode);
                const modeValue = mode?.mode;
                if (modeValue) {
                    const masterIndApi = await fetchIndidualApiMaster({ mode: modeValue });
                    const finalMasterData = masterIndApi?.rd || [];
                    const sortedMasterData = finalMasterData.sort((a, b) => a.displayorder - b.displayorder);
                    const mergedData = sortedMasterData.map(item => ({
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
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleAddOrSaveRow = async (row) => {
        setIsIndLoading(true);
        try {
            const payload = mode == 'edit'
                ? { ...row, ...formData, mode: 'edit' }
                : { ...formData, tabData: categoryStates, mode: 'add' };

            const response = await addEditDelMaster(payload);
            if (response?.success) {
                handleTaskApicall();
            }
        } catch (error) {
            console.error('Error in handleAddOrSaveRow:', error);
        } finally {
            setIsIndLoading(false);
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

    const filteredData = formattedData?.filter(item =>
        item?.labelname?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );

    const paginatedData = filteredData?.slice((page - 1) * rowsPerPage, page * rowsPerPage);


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
                            <Box sx={{ display: 'flex', alignItems:'end', gap: 2 }}>
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
                            />
                        }
                    </Box>
                    <MasterFormDrawer
                        open={drawerOpen}
                        onClose={handleCloseDrawer}
                        onSubmit={handleAddOrSaveRow}
                        formData={formData}
                        selectedRow={selectedRow}
                        setFormData={setFormData}
                    />
                </div>
            ) :
                <LoadingBackdrop isLoading={isLoading} />
            }
        </>
    );
};

export default MasterToggle;