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

const AdvancedMasterTable = ({
    data,
    handleEditAdvRow,
    handleAdvDeleteRow
}) => {
    return (
        <Box>
            <TableContainer className="TableContainer" component={Paper} sx={{ marginTop: 2 }}>
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
                        {data?.map((mainGroup, mainIndex) =>
                            mainGroup?.groups?.map((group, groupIndex) =>           
                                group?.attributes?.map((attr, attrIndex) => (
                                    <TableRow key={`${mainIndex}-${groupIndex}-${attrIndex}`}>
                                        <TableCell>
                                            {groupIndex === 0 && attrIndex === 0 ? (
                                                <Typography fontWeight="bold">{mainGroup.name || "(Unnamed Group)"}</Typography>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            {attrIndex === 0 ? group.name : null}
                                        </TableCell>
                                        <TableCell>{attr.name}</TableCell>
                                        <TableCell align="right" className="actionCell">
                                            <IconButton onClick={() => handleEditAdvRow(mainGroup, group, attr)}>
                                                <Pencil size={18} />
                                            </IconButton>
                                            <IconButton onClick={() => handleAdvDeleteRow(mainGroup, group, attr)}>
                                                <Trash size={18} style={{ color: "#ab003c" }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdvancedMasterTable;
