import React, { useState, useEffect } from 'react';
import "./ExcelPreview.scss"
import {
    Box,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Chip,
    Button,
    Input,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { toast } from 'react-toastify';

const ExcelPreview = ({ url, filename, fileObject }) => {
    const [workbook, setWorkbook] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeSheet, setActiveSheet] = useState(0);

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadExcelFromFile(file);
        }
    };

    const loadExcelFromFile = async (file) => {
        try {
            setLoading(true);
            setError(null);
            const arrayBuffer = await file.arrayBuffer();
            const wb = XLSX.read(arrayBuffer, { type: 'array' });
            setWorkbook(wb);
            setActiveSheet(0);
        } catch (err) {
            console.error('Excel loading error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadExcelFromUrl = async (url) => {
        try {
            setLoading(true);
            setError(null);
            let arrayBuffer;
            const methods = [
                async () => {
                    const response = await fetch(url, {
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,*/*'
                        }
                    });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return await response.arrayBuffer();
                },
                async () => {
                    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error(`Proxy fetch failed: ${response.status}`);
                    return await response.arrayBuffer();
                },
                async () => {
                    const altProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                    const response = await fetch(altProxyUrl);
                    if (!response.ok) throw new Error('Alternative proxy failed');
                    return await response.arrayBuffer();
                }
            ];

            let lastError;
            for (const method of methods) {
                try {
                    arrayBuffer = await method();
                    break;
                } catch (err) {
                    lastError = err;
                    console.warn('Method failed, trying next:', err.message);
                }
            }

            if (!arrayBuffer) {
                throw new Error(`All fetch methods failed. Last error: ${lastError?.message}`);
            }

            const wb = XLSX.read(arrayBuffer, { type: 'array' });

            setWorkbook(wb);
            setActiveSheet(0);
        } catch (err) {
            console.error('Excel loading error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fileObject) {
            loadExcelFromFile(fileObject);
        } else if (url) {
            loadExcelFromUrl(url);
        }
    }, [url, fileObject]);

    const handleSheetChange = (event, newValue) => {
        setActiveSheet(newValue);
    };

    if (error && error?.includes('CORS') || error?.includes('fetch')) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
                p={3}
                textAlign="center"
            >
                <Alert severity="warning" sx={{ mb: 3, width: '100%', maxWidth: 500 }}>
                    <Typography variant="body1" gutterBottom>
                        Unable to load Excel file due to CORS restrictions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {error}
                    </Typography>
                </Alert>

                <Typography variant="h6" gutterBottom>
                    Upload Excel File Instead
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    You can upload the Excel file directly to preview it without CORS issues.
                </Typography>

                <label htmlFor="excel-file-upload">
                    <Input
                        id="excel-file-upload"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        sx={{ display: 'none' }}
                    />
                    <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        size="large"
                        className='buttonClassname'
                    >
                        Upload Excel File
                    </Button>
                </label>
            </Box>
        );
    }

    if (loading) {
        return (
            <LoadingBackdrop isLoading={loading} />
        );
    }

    if (error) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                p={2}
            >
                <Alert severity="error" sx={{ maxWidth: 400 }}>
                    <Typography variant="body2">
                        Error loading Excel File: {error}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    if (!workbook) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
            >
                <Typography variant="body1">No data available</Typography>
            </Box>
        );
    }

    const sheetNames = workbook.SheetNames;
    const currentSheet = workbook.Sheets[sheetNames[activeSheet]];
    const jsonData = XLSX.utils.sheet_to_json(currentSheet, { header: 1 });

    const range = XLSX.utils.decode_range(currentSheet['!ref'] || 'A1:A1');
    const totalRows = range.e.r + 1;
    const totalCols = range.e.c + 1;

    const displayRows = Math.min(totalRows, 100);
    const displayCols = Math.min(totalCols, 20);
    const displayData = jsonData.slice(0, displayRows).map(row => {
        const paddedRow = [...row];
        while (paddedRow.length < displayCols) {
            paddedRow.push(null);
        }
        return paddedRow.slice(0, displayCols);
    });

    return (
        <Box className="data-table-container-excel">
            <Box className="data-table-header">
                <Box className="data-table-chips">
                    <Chip label={`${totalRows} rows`} size="small" variant="outlined" />
                    <Chip label={`${totalCols} columns`} size="small" variant="outlined" />
                    {displayRows < totalRows && (
                        <Chip label={`Showing first ${displayRows} rows`} size="small" color="warning" variant="outlined" />
                    )}
                    {displayCols < totalCols && (
                        <Chip label={`Showing first ${displayCols} columns`} size="small" color="warning" variant="outlined" />
                    )}
                </Box>
            </Box>

            {sheetNames.length > 1 && (
                <Box className="data-table-tabs">
                    <Tabs value={activeSheet} onChange={handleSheetChange} variant="scrollable" scrollButtons="auto">
                        {sheetNames.map((name, index) => (
                            <Tab key={index} label={name} />
                        ))}
                    </Tabs>
                </Box>
            )}

            <Box className="data-table-wrapper">
                <TableContainer component={Paper} className="data-table-paper">
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {Array.from({ length: displayCols }, (_, index) => (
                                    <TableCell key={index} className="data-table-header-cell">
                                        {displayData[0]?.[index] != null ? String(displayData[0][index]) : ''}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.slice(1).map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {Array.from({ length: displayCols }, (_, cellIndex) => (
                                        <TableCell key={cellIndex} className="data-table-cell">
                                            {row[cellIndex] != null ? String(row[cellIndex]) : ''}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default ExcelPreview;