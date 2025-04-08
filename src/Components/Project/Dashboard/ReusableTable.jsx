import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import "./Styles/ReusableTable.scss";

const ReusableTable = ({ columns, data, renderCell, className }) => {
    const filteredColumns = columns.filter(column => column.id !== 'id');

    return (
        <TableContainer component={Paper} className={className}>
            <Table className="reusable_table">
                <TableHead>
                    <TableRow>
                        {filteredColumns.map((column, index) => (
                            <TableCell key={index}>{column.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {filteredColumns.map((column, colIndex) => (
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
