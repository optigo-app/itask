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

                            // Case 1: No groups at all
                            if (groups?.length === 0) {
                                return (
                                    <TableRow key={`no-group-${mainIndex}`}>
                                        <TableCell>
                                            <Typography fontWeight="bold">{mainName || "(Unnamed Group)"}</Typography>
                                        </TableCell>
                                        <TableCell colSpan={2}>
                                            <Typography color="text.secondary" fontStyle="italic">
                                                -
                                            </Typography>
                                        </TableCell>
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
                            }

                            // Case 2 & 3: Groups with or without attributes
                            return groups?.map((group, groupIndex) => {
                                const { attributes = [], name: groupName } = group;

                                // Case 2: Group exists but has no attributes
                                if (attributes?.length === 0) {
                                    return (
                                        <TableRow key={`no-attr-${mainIndex}-${groupIndex}`}>
                                            <TableCell>
                                                {groupIndex === 0 && (
                                                    <Typography fontWeight="bold">{mainName || "(Unnamed Group)"}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{groupName}</TableCell>
                                            <TableCell>
                                                <Typography color="text.secondary" fontStyle="italic">
                                                    -
                                                </Typography>
                                            </TableCell>
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
                                }

                                // Case 3: Normal group with attributes
                                return attributes.map((attr, attrIndex) => (
                                    <TableRow key={`row-${mainIndex}-${groupIndex}-${attrIndex}`}>
                                        <TableCell>
                                            {groupIndex === 0 && attrIndex === 0 && (
                                                <Typography fontWeight="bold">{mainName || "(Unnamed Group)"}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{attrIndex === 0 ? groupName : null}</TableCell>
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
                                ));
                            });
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdvancedMasterTable;
