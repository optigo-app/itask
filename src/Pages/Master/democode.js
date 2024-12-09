import React, { useEffect, useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Backdrop,
    Box,
} from "@mui/material";
import { ArchiveRestore, Pencil, Trash } from 'lucide-react';
import "./Master.scss";
import { addEditDelMaster, fetchMaster } from "../../Api/MasterApi/MasterApi";

const CategoryCards = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formattedData, setFormattedData] = useState([]);
    const [categoryStates, setCategoryStates] = useState({});

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
                    searchValue: "",
                    rows: category.rows || [],
                    editMode: null,
                };
                return acc;
            }, {});
            setCategoryStates(initialStates);

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const getInit = JSON.parse(localStorage.getItem("taskInit"));
        if (getInit) {
            fetchMasterData();
        }
    }, []);

    const handleAddOrSaveRow = async (categoryId, category) => {
        const categoryState = categoryStates[categoryId];
        const { newRow, editMode, rows } = categoryState;
        let mode;
        if (newRow.labelname.trim() === "") return;

        if (editMode !== null) {
            // Save edited row
            const updatedRows = rows.map((row) =>
                row.id === editMode ? { ...row, labelname: newRow.labelname } : row
            );
            mode = "edit"
            const editData = await addEditDelMaster(mode, category?.table_name, newRow, editMode);
            if (editData[0]?.stat != 0) {
                setCategoryStates((prev) => ({
                    ...prev,
                    [categoryId]: { ...prev[categoryId], rows: updatedRows, editMode: null },
                }));
            }
        } else {
            // Add new row
            const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
            const updatedRows = [...rows, { ...newRow, id: newId }];
            mode = "add"
            const addData = await addEditDelMaster(mode, category?.table_name, newRow);
            if (addData[0]?.stat != 0) {
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

    const handleEditRow = (categoryId, category, rowId) => {
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
        return rows.filter((row) =>
            row.labelname.toLowerCase().includes(searchValue.toLowerCase())
        );
    };

    return (
        <>
            {isLoading ? (
                <Backdrop
                    sx={{
                        backgroundColor: 'rgba(200, 200, 200, 0.2)',
                        color: '#000',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    open={isLoading}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '50%', boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' }}>
                        <CircularProgress color="inherit" />
                    </Box>
                </Backdrop>
            ) : (
                <Grid container spacing={2} justifyContent="start">
                    {formattedData.map((category) => (
                        <Grid item xs={12} sm={6} md={6} key={category?.id}>
                            <Card className="master_card" key={category?.id}>
                                <CardContent>
                                    <div className="masterHeader">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography className="masterTitle" variant="h6" gutterBottom>
                                                {category.Table_Title}
                                            </Typography>
                                            <TextField
                                                placeholder="Search..."
                                                size="small"
                                                sx={{ width: "250px" }}
                                                className="textfieldsClass"
                                                value={categoryStates[category.id]?.searchValue || ""}
                                                onChange={(e) => handleSearchChange(category.id, e.target.value)}
                                            />
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
                                    {/* Table */}
                                    <TableContainer className="masterTable" component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {getFilteredRows(category.id).map((row) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell sx={{ textDecoration: row?.isdelete == 1 ? 'line-through' : 'none' }}>{row.labelname}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => handleEditRow(category.id, category, row.id)}>
                                                                <Pencil className={"iconEdit"} size={18} />
                                                            </IconButton>
                                                            {row?.isdelete == 0 ? (
                                                                <IconButton onClick={() => handleDeleteRow(category.id, category, row.id)} sx={{ color: '#ab003c' }}>
                                                                    <Trash className={"iconDelete"} size={18} />
                                                                </IconButton>
                                                            ) :
                                                                <IconButton onClick={() => handleRestoreRow(category.id, category, row.id)} sx={{ color: '#ab003c' }}>
                                                                    <ArchiveRestore  className={"iconDelete"} size={18} />
                                                                </IconButton>
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </>
    );
};

export default CategoryCards;
