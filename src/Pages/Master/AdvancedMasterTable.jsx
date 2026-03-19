import React from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Typography,
    Paper,
    Box,
    TableContainer,
    Chip,
    Tooltip,
} from "@mui/material";
import { Pencil, Trash, X, FolderOpen, Layers } from "lucide-react";

const AdvancedMasterTable = ({ data, handleEditAdvRow, handleAdvDeleteRow }) => {
    return (
        <Box>
            <TableContainer 
                component={Paper} 
                sx={{ 
                    marginTop: 2,
                    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }} 
                className="TableContainer"
            >
                <Table className="Table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600, fontSize: '14px', width: '20%', color: '#808080' }}>
                                Main Group
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '14px', width: '20%', color: '#808080' }}>
                                Group
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '14px', width: '50%', color: '#808080' }}>
                                Attributes
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '14px', width: '10%', color: '#808080' }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((mainGroup, mainIndex) => {
                            const { groups = [], name: mainName } = mainGroup;
                            const rows = [];

                            // Main group row with enhanced styling
                            rows.push(
                                <TableRow 
                                    key={`main-${mainIndex}`}
                                    sx={{
                                        backgroundColor: '#fafafa',
                                        borderLeft: '4px solid #7367f0',
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FolderOpen size={18} color="#7367f0" />
                                            <Typography 
                                                fontWeight="600" 
                                                fontSize="15px"
                                                color="#7367f0"
                                            >
                                                {mainName || "(Unnamed Group)"}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="#6D6B77">
                                            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit Main Group" classes={{ tooltip: 'custom-tooltip' }}>
                                            <IconButton 
                                                size="small"
                                                onClick={() => handleEditAdvRow(mainGroup, null, null)}
                                                sx={{ 
                                                    '&:hover': { 
                                                        backgroundColor: 'rgba(115, 103, 240, 0.08)' 
                                                    } 
                                                }}
                                            >
                                                <Pencil size={18} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Main Group" classes={{ tooltip: 'custom-tooltip' }}>
                                            <IconButton 
                                                size="small"
                                                onClick={() => handleAdvDeleteRow(mainGroup, null, null)}
                                                sx={{ 
                                                    '&:hover': { 
                                                        backgroundColor: 'rgba(211, 47, 47, 0.08)' 
                                                    } 
                                                }}
                                            >
                                                <Trash size={18} style={{ color: "#d32f2f" }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );

                            // Group rows with attributes as chips
                            groups?.forEach((group, groupIndex) => {
                                const { attributes = [], name: groupName } = group;

                                rows.push(
                                    <TableRow 
                                        key={`group-${mainIndex}-${groupIndex}`}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#fafafa',
                                            },
                                            borderLeft: '4px solid transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <TableCell sx={{ paddingLeft: 4 }}></TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Layers size={16} color="#6D6B77" />
                                                <Typography 
                                                    fontWeight="500" 
                                                    fontSize="14px"
                                                    color="#444050"
                                                >
                                                    {groupName}
                                                </Typography>
                                                <Chip 
                                                    label={attributes.length} 
                                                    size="small" 
                                                    sx={{ 
                                                        height: '20px',
                                                        fontSize: '11px',
                                                        background: 'rgba(115, 103, 240, 0.16)',
                                                        color: '#7367f0',
                                                        fontWeight: 600
                                                    }} 
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexWrap: 'wrap', 
                                                gap: 0.75,
                                                py: 0.5
                                            }}>
                                                {attributes?.length > 0 ? (
                                                    attributes.map((attr, attrIndex) => (
                                                        <Chip
                                                            key={`chip-${mainIndex}-${groupIndex}-${attrIndex}`}
                                                            label={attr.name}
                                                            size="small"
                                                            onClick={() => handleEditAdvRow(mainGroup, group, attr)}
                                                            onDelete={() => handleAdvDeleteRow(mainGroup, group, attr)}
                                                            deleteIcon={<X size={14} />}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                backgroundColor: '#fff',
                                                                border: '1px solid #e0e0e0',
                                                                fontSize: '13px',
                                                                height: '28px',
                                                                color: '#444050',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)',
                                                                    borderColor: '#7367f0',
                                                                    color: '#fff',
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                    '& .MuiChip-deleteIcon': {
                                                                        color: '#fff'
                                                                    }
                                                                },
                                                                '& .MuiChip-deleteIcon': {
                                                                    color: '#999',
                                                                    '&:hover': {
                                                                        color: '#d32f2f'
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography 
                                                        variant="caption" 
                                                        color="#6D6B77"
                                                        fontStyle="italic"
                                                    >
                                                        No attributes
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit Group" classes={{ tooltip: 'custom-tooltip' }}>
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleEditAdvRow(mainGroup, group, null)}
                                                    sx={{ 
                                                        '&:hover': { 
                                                            backgroundColor: 'rgba(115, 103, 240, 0.08)' 
                                                        } 
                                                    }}
                                                >
                                                    <Pencil size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Group" classes={{ tooltip: 'custom-tooltip' }}>
                                                <IconButton 
                                                    size="small"
                                                    onClick={() => handleAdvDeleteRow(mainGroup, group, null)}
                                                    sx={{ 
                                                        '&:hover': { 
                                                            backgroundColor: 'rgba(211, 47, 47, 0.08)' 
                                                        } 
                                                    }}
                                                >
                                                    <Trash size={18} style={{ color: "#d32f2f" }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            });

                            return rows;
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdvancedMasterTable;
