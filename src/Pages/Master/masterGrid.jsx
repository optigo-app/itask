import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Pagination, IconButton, TableSortLabel, Chip, Popover } from '@mui/material';
import { Pencil, Trash, ArchiveRestore, Trash2, Palette } from 'lucide-react';
import { getDynamicPriorityColor, getDynamicStatusColor } from '../../Utils/globalfun';
import ColorPicker from '../../Components/Common/ColorPicker';
import './Master.scss';

const Mastergrid = ({
    data,
    handleEditRow,
    handleDeleteRow,
    handleRestoreRow,
    handleFinalDelete,
    paginationCount,
    paginationPage,
    onPaginationChange,
    rowsPerPage,
    totalRows,
    masterType = '', // Add masterType prop to identify priority/status
    onColorChange // Add callback for color changes
}) => {
    console.log(masterType, 'masterType');
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [selectedRowForColor, setSelectedRowForColor] = useState(null);
    // Custom Footer Component for Pagination
    const CustomFooter = ({ totalRows, paginationCount, paginationPage, onPaginationChange }) => {
        const startEntry = (paginationPage - 1) * rowsPerPage + 1;
        const endEntry = Math.min(paginationPage * rowsPerPage, totalRows);

        return (
            <Box className="TablePaginationBox" sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" className="paginationText">
                    Showing {totalRows > 0 ? startEntry : 0} to {totalRows > 0 ? endEntry : 0} of {totalRows} entries
                </Typography>
                <Pagination
                    size="medium"
                    count={paginationCount}
                    page={paginationPage}
                    onChange={onPaginationChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    siblingCount={1}
                    boundaryCount={1}
                    className="pagination"
                    sx={{ '.MuiPaginationItem-root': { minHeight: '30px !important' } }}
                />
            </Box>
        );
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const sortedMaster = useMemo(() => {
        const sorted = [...data];
        const { key, direction } = sortConfig;
        if (!key) return sorted;

        sorted.sort((a, b) => {
            const getValue = (item) => {
                if (key === "labelname") return item?.labelname;
                return (item[key] || "").toString().toLowerCase();
            };

            const aVal = getValue(a);
            const bVal = getValue(b);
            return direction === "asc" ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
        });

        return sorted;
    }, [data, sortConfig]);

    const renderSortCell = (label, key) => (
        <TableSortLabel
            active={sortConfig.key === key}
            direction={sortConfig.direction}
            onClick={() => handleSort(key)}
        >
            {label}
        </TableSortLabel>
    );


    return (
        <Box>
            <TableContainer className='TableContainer' component={Paper} sx={{ marginTop: 2 }}>
                <Table className='Table'>
                    <TableHead>
                        <TableRow>
                            <TableCell width={80}>Sr#</TableCell>
                            <TableCell width={120}>Display Order</TableCell>
                            <TableCell >{renderSortCell("Name", "labelname")}</TableCell>
                            {(masterType === "task_priority" || masterType === "task_status") && (
                                <TableCell width={120}>Color</TableCell>
                            )}
                            <TableCell className='actionCell'>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedMaster?.map((row, index) => {
                            // Get color info for priority/status
                            let colorInfo = null;
                            if (masterType === "task_priority") {
                                colorInfo = getDynamicPriorityColor(row.labelname, row.colorkey);
                            } else if (masterType === "task_status") {
                                colorInfo = getDynamicStatusColor(row.labelname, row.colorkey);
                            }
                            
                            return (
                                <TableRow key={row.id}>
                                    <TableCell>{row?.srno}</TableCell>
                                    <TableCell>{row?.displayorder}</TableCell>
                                    <TableCell style={{
                                        textDecoration: row.isdelete !== 0 ? 'line-through' : 'none',
                                        color: row.isdelete !== 0 ? '#ab003c' : '#444050',
                                        textTransform: 'capitalize'
                                    }}>
                                        {row.labelname}
                                    </TableCell>
                                    {(masterType === "task_priority" || masterType === "task_status") && (
                                        <TableCell>
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 1,
                                                    cursor: 'pointer',
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    '&:hover': {
                                                        backgroundColor: '#f5f5f5'
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    setColorPickerAnchor(e.currentTarget);
                                                    setSelectedRowForColor(row);
                                                }}
                                            >
                                                {colorInfo ? (
                                                    <>
                                                        <Box
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: '50%',
                                                                backgroundColor: colorInfo.color,
                                                                border: '2px solid #fff',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                        <Chip
                                                            label={row.labelname}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: colorInfo.backgroundColor,
                                                                color: colorInfo.color,
                                                                border: `1px solid ${colorInfo.color}30`,
                                                                fontWeight: 500,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Palette size={16} color="#666" />
                                                        <Typography variant="caption" color="textSecondary">
                                                            Click to set color
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell className='actionCell'>
                                        {row.isdelete == 0 &&
                                            <IconButton
                                                onClick={() => handleEditRow(row)}
                                                disabled={row.isdelete !== 0}
                                            >
                                                <Pencil
                                                    size={18}
                                                />
                                            </IconButton>
                                        }
                                        {row.isdelete === 0 ? (
                                            <IconButton
                                                onClick={() => handleDeleteRow(row)}
                                                disabled={row.isdelete !== 0}
                                            >
                                                <Trash
                                                    size={18}
                                                    style={{ color: "#ab003c" }}
                                                />
                                            </IconButton>
                                        ) : (
                                            <>
                                                <IconButton
                                                    onClick={() => handleRestoreRow(row)}
                                                >
                                                    <ArchiveRestore
                                                        size={18}
                                                        style={{ color: "#ab003c" }}
                                                    />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleFinalDelete(row)}
                                                >
                                                    <Trash2
                                                        size={18}
                                                        style={{ color: "#ab003c" }}
                                                    />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow className='paginationRow'>
                            <TableCell colSpan={(masterType === 'task_priority' || masterType === 'task_status') ? 5 : 4}>
                                <CustomFooter
                                    totalRows={totalRows}
                                    paginationCount={paginationCount}
                                    paginationPage={paginationPage}
                                    onPaginationChange={onPaginationChange}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            
            {/* Color Picker Popover */}
            <Popover
                open={Boolean(colorPickerAnchor)}
                anchorEl={colorPickerAnchor}
                onClose={() => {
                    setColorPickerAnchor(null);
                    setSelectedRowForColor(null);
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(12px)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                        overflow: 'visible',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 20,
                            height: 20,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderBottom: 'none',
                            borderRight: 'none',
                            borderRadius: '6px 0 0 0',
                            rotate: '45deg',
                            zIndex: -1,
                            backdropFilter: 'blur(12px)'
                        }
                    }
                }}
            >
                <Box sx={{ 
                    p: 3,
                    background: 'transparent'
                }}>
                    <ColorPicker
                        selectedColor={selectedRowForColor?.colorkey || ''}
                        onColorSelect={(colorKey) => {
                            if (selectedRowForColor && onColorChange) {
                                onColorChange(selectedRowForColor, colorKey, masterType);
                            }
                            setColorPickerAnchor(null);
                            setSelectedRowForColor(null);
                        }}
                        label={`Select color for ${selectedRowForColor?.labelname}`}
                        size="small"
                    />
                </Box>
            </Popover>
        </Box>
    );
};

export default Mastergrid;
