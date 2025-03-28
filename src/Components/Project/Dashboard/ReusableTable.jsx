import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, Typography } from "@mui/material";
import "./Styles/ReusableTable.scss";

const ReusableTable = ({ columns, data, renderCell, className }) => {
    return (
        <TableContainer component={Paper} className={className}>
            <Table className="reusable_table">
                <TableHead>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableCell key={index}>{column.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <TableCell key={colIndex}>
                                    {renderCell ? renderCell(column.id, row) : row[column.id]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ReusableTable;
