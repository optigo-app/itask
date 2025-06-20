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
                            <TableCell>Master Name</TableCell>
                            <TableCell>Sub Master</TableCell>
                            <TableCell>Master Value</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((master, masterIndex) =>
                            master.subcategories.map((sub, subIndex) =>
                                sub.items.map((item, itemIndex) => (
                                    <TableRow key={`${masterIndex}-${subIndex}-${itemIndex}`}>
                                        <TableCell>
                                            {subIndex === 0 && itemIndex === 0 ? (
                                                <Typography fontWeight="bold">{master.category}</Typography>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            {itemIndex === 0 ? (
                                                <Typography>{sub.name}</Typography>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>{item.label}</TableCell>
                                        <TableCell className="actionCell" align="right">
                                            <IconButton
                                                onClick={() => handleEditAdvRow(master, sub, item)}
                                            >
                                                <Pencil size={18} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleAdvDeleteRow(master, sub, item)}
                                            >
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
