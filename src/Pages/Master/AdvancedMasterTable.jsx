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
} from "@mui/material";
import { Pencil, Trash } from "lucide-react";

const AdvancedMasterTable = ({ data, handleEditAdvRow, handleAdvDeleteRow }) => {
    return (
        <Box>
            <TableContainer component={Paper} sx={{ marginTop: 2 }} className="TableContainer">
                <Table className="Table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Main Group</TableCell>
                            <TableCell>Group</TableCell>
                            <TableCell>Attribute</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.map((mainGroup, mainIndex) => {
                            const { groups = [], name: mainName } = mainGroup;
                            const rows = [];

                            // Always add main group row first
                            rows.push(
                                <TableRow key={`main-${mainIndex}`}>
                                    <TableCell>
                                        <Typography fontWeight="bold">{mainName || "(Unnamed Group)"}</Typography>
                                    </TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleEditAdvRow(mainGroup, null, null)}>
                                            <Pencil size={18} />
                                        </IconButton>
                                        <IconButton onClick={() => handleAdvDeleteRow(mainGroup, null, null)}>
                                            <Trash size={18} style={{ color: "#ab003c" }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );

                            // Add group and attribute rows
                            groups?.forEach((group, groupIndex) => {
                                const { attributes = [], name: groupName } = group;

                                // Add group row
                                rows.push(
                                    <TableRow key={`group-${mainIndex}-${groupIndex}`}>
                                        <TableCell></TableCell>
                                        <TableCell>{groupName}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleEditAdvRow(mainGroup, group, null)}>
                                                <Pencil size={18} />
                                            </IconButton>
                                            <IconButton onClick={() => handleAdvDeleteRow(mainGroup, group, null)}>
                                                <Trash size={18} style={{ color: "#ab003c" }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );

                                // Add attribute rows
                                attributes?.forEach((attr, attrIndex) => {
                                    rows.push(
                                        <TableRow key={`attr-${mainIndex}-${groupIndex}-${attrIndex}`}>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell>{attr.name}</TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={() => handleEditAdvRow(mainGroup, group, attr)}>
                                                    <Pencil size={18} />
                                                </IconButton>
                                                <IconButton onClick={() => handleAdvDeleteRow(mainGroup, group, attr)}>
                                                    <Trash size={18} style={{ color: "#ab003c" }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                });
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
