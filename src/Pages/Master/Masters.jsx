import React, { useEffect, useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Backdrop,
    CircularProgress,
    Box,
    InputAdornment,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { ArchiveRestore, Pencil, SearchIcon, Trash } from 'lucide-react';
import { addEditDelMaster, fetchMaster } from "../../Api/MasterApi/MasterApi";
import "./Master.scss";
import LoadingBackdrop from "../../Utils/LoadingBackdrop";

const CategoryCards = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formattedData, setFormattedData] = useState([]);
    const [categoryStates, setCategoryStates] = useState({});
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const fetchMasterData = async () => {
        setIsLoading(true);
        try {
            const masterData = await fetchMaster();
            const result = Object.keys(masterData)
                .filter((key) => key.startsWith("rd") && key !== "rd")
                .map((key) => {
                    const rdIndex = parseInt(key.replace("rd", ""), 10);
                    const rdItem = masterData.rd.find((item) => item.id === rdIndex);
                    return {
                        id: rdItem?.id,
                        table_name: rdItem?.table_name,
                        Table_Title: rdItem?.title,
                        rows: masterData[key].map((item) => ({
                            ...item,
                            table_id: rdItem?.id,
                        })),
                    };
                });

            setFormattedData(result);

            // Initialize category states
            const initialStates = result.reduce((acc, category) => {
                acc[category.id] = {
                    newRow: { labelname: "" },
                    rows: category.rows || [],
                    editMode: null,
                    searchValue: "", // Add searchValue state here
                };
                return acc;
            }, {});
            setCategoryStates(initialStates);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    const handleAddOrSaveRow = async (categoryId, category) => {
        const categoryState = categoryStates[categoryId];
        const { newRow, editMode, rows } = categoryState;
        if (newRow.labelname.trim() === "") return;

        let mode;
        if (editMode !== null) {
            mode = "edit";
            const editData = await addEditDelMaster(mode, category.table_name, newRow, editMode);
            if (editData[0]?.stat !== 0) {
                const updatedRows = rows.map((row) =>
                    row.id === editMode ? { ...row, labelname: newRow.labelname } : row
                );
                setCategoryStates((prev) => ({
                    ...prev,
                    [categoryId]: { ...prev[categoryId], rows: updatedRows, editMode: null },
                }));
            }
        } else {
            mode = "add";
            const addData = await addEditDelMaster(mode, category.table_name, newRow);
            if (addData[0]?.stat !== 0) {
                const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
                const updatedRows = [...rows, { ...newRow, id: newId }];
                setCategoryStates((prev) => ({
                    ...prev,
                    [categoryId]: { ...prev[categoryId], rows: updatedRows },
                }));
            }
        }
        setCategoryStates((prev) => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], newRow: { labelname: "" } },
        }));
    };

    const handleEditRow = (categoryId, rowId) => {
        const rowToEdit = categoryStates[categoryId].rows.find((row) => row.id === rowId);
        setCategoryStates((prev) => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], newRow: { labelname: rowToEdit.labelname }, editMode: rowId },
        }));
    };

    const handleDeleteRow = async (categoryId, category, rowId) => {
        const updatedRows = categoryStates[categoryId].rows.map((row) =>
            row.id === rowId ? { ...row, isdelete: 1 } : row
        );
        let mode = 'del';
        const deleteRow = await addEditDelMaster(mode, category?.table_name, null, rowId);
        if (deleteRow && deleteRow[0]?.stat !== 0) {
            setCategoryStates((prev) => ({
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    rows: updatedRows
                },
            }));
        }
    };

    const handleRestoreRow = async (categoryId, category, rowId) => {
        const updatedRows = categoryStates[categoryId].rows.map((row) =>
            row.id === rowId ? { ...row, isdelete: 0 } : row
        );
        let mode = 'restore';
        const deleteRow = await addEditDelMaster(mode, category?.table_name, null, rowId);
        if (deleteRow && deleteRow[0]?.stat !== 0) {
            setCategoryStates((prev) => ({
                ...prev,
                [categoryId]: {
                    ...prev[categoryId],
                    rows: updatedRows
                },
            }));
        }
    };

    const handleSearchChange = (categoryId, value) => {
        setCategoryStates((prev) => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], searchValue: value },
        }));
    };

    const getFilteredRows = (categoryId) => {
        const { rows, searchValue } = categoryStates[categoryId];
        return rows?.filter((row) =>
            row?.labelname?.toLowerCase()?.includes(searchValue?.toLowerCase())
        );
    };


    const columns = (categoryId, category) => [
        {
            field: "labelname",
            headerName: "Name",
            flex: 1,
            renderCell: (params) => {
                const isDeleted = params.row.isdelete === 1;
                return (
                    <div
                        style={{
                            textDecoration: isDeleted ? 'line-through' : 'none',
                            color: isDeleted && '#ab003c'
                        }}
                    // variant="body1"
                    >
                        {params.value}
                    </div>
                );
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            sortable: false,
            renderCell: (params) => (
                <>
                    <Pencil
                        className="iconEdit"
                        size={18}
                        style={{ cursor: "pointer", marginRight: 10 }}
                        onClick={() => handleEditRow(categoryId, params.row.id)}
                    />
                    {params.row.isdelete === 0 ? (
                        <Trash
                            className="iconDelete"
                            size={18}
                            style={{ cursor: "pointer", color: "#ab003c" }}
                            onClick={() => handleDeleteRow(categoryId, category, params.row.id)}
                        />
                    ) : (
                        <ArchiveRestore
                            className="iconRestore"
                            size={18}
                            style={{ cursor: "pointer", color: "#ab003c" }}
                            onClick={() => handleRestoreRow(categoryId, category, params.row.id)}
                        />
                    )}
                </>
            ),
        },
    ];


    return (
        <div className="customDataGridWrapper">
            {isLoading ? (
               <LoadingBackdrop isLoading={isLoading}/>
            ) : (
                <Grid container spacing={2}>
                    {formattedData.map((category) => (
                        <Grid item xs={12} sm={6} key={category.id}>
                            <Card>
                                <CardContent className="masterCardContent">
                                    <div className="masterHeader">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography className="masterTitle" variant="h6" gutterBottom>
                                                {category.Table_Title}
                                            </Typography>
                                            <TextField
                                                placeholder="Search..."
                                                value={categoryStates[category.id]?.searchValue || ""}
                                                onChange={(e) => handleSearchChange(category.id, e.target.value)}
                                                size="small"
                                                className="textfieldsClass"
                                                sx={{ minWidth: 250 }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon  size={20} color="#7d7f85" opacity={.5}/>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            {/* <TextField
                                                placeholder="Search..."
                                                size="small"
                                                sx={{ width: "250px" }}
                                                className="textfieldsClass"
                                                value={categoryStates[category.id]?.searchValue || ""}
                                                onChange={(e) => handleSearchChange(category.id, e.target.value)}
                                            /> */}
                                        </div>
                                        <div
                                            style={{
                                                margin: "20px 0",
                                                border: "1px dashed #7d7f85",
                                                opacity: 0.3,
                                            }}
                                        />
                                        {/* Input and Add/Save button */}
                                        <Grid container spacing={1} alignItems="center" style={{ marginBottom: "16px" }}>
                                            <Grid item xs={8}>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Enter Data..."
                                                    size="small"
                                                    variant="outlined"
                                                    className="textfieldsClass"
                                                    value={categoryStates[category.id]?.newRow.labelname || ""}
                                                    onChange={(e) =>
                                                        setCategoryStates((prev) => ({
                                                            ...prev,
                                                            [category.id]: { ...prev[category.id], newRow: { labelname: e.target.value } },
                                                        }))
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    className="primary-btn"
                                                    onClick={() => handleAddOrSaveRow(category.id, category)}
                                                >
                                                    {categoryStates[category.id]?.editMode !== null ? "Save" : "Add"}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </div>
                                    <div className="DataGridContainer" >
                                        <DataGrid
                                            rows={getFilteredRows(category.id)}
                                            columns={columns(category.id, category)}
                                            initialState={{
                                                pagination: {
                                                    paginationModel: {
                                                        pageSize: 5,
                                                    },
                                                },
                                            }}
                                            disableSelectionOnClick
                                            disableColumnMenu
                                            pageSizeOptions={[5, 10, 20, 30, 50]}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default CategoryCards;
